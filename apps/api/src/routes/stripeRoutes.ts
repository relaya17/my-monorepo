import { Request, Response, Router } from 'express';
import Payment from '../models/paymentModel.js';
import Building from '../models/buildingModel.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getClientUrl,
  getPlatformFeeBps,
  getStripeClient,
  getOrCreateConnectAccount,
  createConnectAccountLink,
  createConnectLoginLink,
  getConnectAccountStatus,
  splitPayment,
} from '../services/stripeService.js';

const router = Router();

type CheckoutSessionBody = {
  amount: number;
  payer: string;
  tenantId?: string;
  buildingId?: string;
  buildingStripeAccountId: string;
};

type ConnectOnboardBody = {
  buildingId: string;
  returnUrl: string;
  refreshUrl: string;
};

/** POST /api/stripe/connect/onboard – Create/link Connect account and return onboarding URL */
router.post('/connect/onboard', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { buildingId, returnUrl, refreshUrl } = req.body as ConnectOnboardBody;
    if (!buildingId || typeof returnUrl !== 'string' || typeof refreshUrl !== 'string') {
      res.status(400).json({ error: 'Missing buildingId, returnUrl or refreshUrl' });
      return;
    }
    const building = await Building.findOne({ buildingId }).lean();
    if (!building) {
      res.status(404).json({ error: 'Building not found' });
      return;
    }
    const accountId = await getOrCreateConnectAccount({
      buildingId,
      existingAccountId: (building as { stripeAccountId?: string }).stripeAccountId,
      email: (building as { committeeContact?: string }).committeeContact ?? undefined,
      buildingName: (building as { committeeName?: string }).committeeName ?? undefined,
    });
    await Building.updateOne(
      { buildingId },
      { $set: { stripeAccountId: accountId } }
    );
    const url = await createConnectAccountLink({
      accountId,
      returnUrl,
      refreshUrl,
    });
    res.json({ url, accountId });
  } catch (err) {
    console.error('Stripe Connect onboard error:', err);
    res.status(500).json({ error: 'Failed to create onboarding link' });
  }
});

/** POST /api/stripe/connect/login – Login link for existing Connect Express account */
router.post('/connect/login', authMiddleware, async (req: Request, res: Response) => {
  try {
    const buildingId = req.body?.buildingId as string | undefined;
    if (!buildingId) {
      res.status(400).json({ error: 'Missing buildingId' });
      return;
    }
    const building = await Building.findOne({ buildingId }).lean();
    const accountId = (building as { stripeAccountId?: string } | null)?.stripeAccountId;
    if (!accountId) {
      res.status(404).json({ error: 'Building has no Stripe Connect account. Complete onboarding first.' });
      return;
    }
    const url = await createConnectLoginLink(accountId);
    res.json({ url });
  } catch (err) {
    console.error('Stripe Connect login error:', err);
    res.status(500).json({ error: 'Failed to create login link' });
  }
});

/** GET /api/stripe/connect/status?buildingId=xxx – Connect account status */
router.get('/connect/status', async (req: Request, res: Response) => {
  try {
    const buildingId = req.query.buildingId as string | undefined;
    if (!buildingId) {
      res.status(400).json({ error: 'Missing buildingId' });
      return;
    }
    const building = await Building.findOne({ buildingId }).lean();
    const accountId = (building as { stripeAccountId?: string } | null)?.stripeAccountId;
    if (!accountId) {
      res.json({ accountId: null, chargesEnabled: false, detailsSubmitted: false });
      return;
    }
    const status = await getConnectAccountStatus(accountId);
    res.json({
      accountId: status.id,
      chargesEnabled: status.chargesEnabled,
      detailsSubmitted: status.detailsSubmitted,
    });
  } catch (err) {
    console.error('Stripe Connect status error:', err);
    res.status(500).json({ error: 'Failed to get Connect status' });
  }
});

router.post('/checkout-session', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { amount, payer, tenantId, buildingId, buildingStripeAccountId } = req.body as CheckoutSessionBody;

    if (!payer || !buildingStripeAccountId) {
      res.status(400).json({ error: 'Missing payer or buildingStripeAccountId' });
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      res.status(400).json({ error: 'Invalid amount' });
      return;
    }

    const unitAmount = Math.round(amount * 100);
    const feeBps = getPlatformFeeBps();
    const applicationFeeAmount = Math.round((unitAmount * feeBps) / 10000);
    const clientUrl = getClientUrl();

    const payment = await Payment.create({
      payer,
      amount,
      tenantId,
      buildingId,
      stripeAccountId: buildingStripeAccountId,
      status: 'pending'
    });

    const paymentId = (payment as { _id: { toString(): string } })._id.toString();
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'ils',
            product_data: { name: `תשלום ועד בית - בניין ${buildingId ?? 'כללי'}` },
            unit_amount: unitAmount
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      payment_intent_data: {
        application_fee_amount: applicationFeeAmount,
        transfer_data: {
          destination: buildingStripeAccountId
        }
      },
      success_url: `${clientUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/cancel`,
      metadata: {
        buildingId: buildingId ?? '',
        tenantId: tenantId ?? '',
        paymentId
      }
    });

    payment.stripeSessionId = session.id;
    await payment.save();

    res.json({ id: session.id, paymentId });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ error: 'Payment initialization failed' });
  }
});

/**
 * POST /api/stripe/split-payment
 * חלוקת תשלום 70/20/10: 70% קבלן, 20% ועד בית, 10% Vantera.
 * נקרא לאחר שה-PaymentIntent הושלם (מ-webhook או מאשרור ידני).
 */
router.post('/split-payment', authMiddleware, async (req: Request, res: Response) => {
  try {
    const auth = req.auth;
    if (!auth || auth.type !== 'admin') {
      res.status(403).json({ error: 'גישה לאדמינים בלבד' });
      return;
    }
    const { paymentIntentId, amountIls, contractorAccountId, buildingAccountId } =
      req.body as {
        paymentIntentId?: string;
        amountIls?: number;
        contractorAccountId?: string;
        buildingAccountId?: string;
      };

    if (!paymentIntentId || !amountIls || !contractorAccountId || !buildingAccountId) {
      res.status(400).json({ error: 'חסרים: paymentIntentId, amountIls, contractorAccountId, buildingAccountId' });
      return;
    }
    if (!Number.isFinite(amountIls) || amountIls <= 0) {
      res.status(400).json({ error: 'amountIls חייב להיות מספר חיובי' });
      return;
    }

    const result = await splitPayment({ paymentIntentId, amountIls, contractorAccountId, buildingAccountId });
    res.json({
      message: 'החלוקה בוצעה בהצלחה',
      splits: {
        contractor: { percent: 70, amountIls: +(amountIls * 0.7).toFixed(2), transferId: result.contractorTransferId },
        building: { percent: 20, amountIls: +(amountIls * 0.2).toFixed(2), transferId: result.buildingTransferId },
        platform: { percent: 10, amountIls: +(amountIls * 0.1).toFixed(2) },
      },
    });
  } catch (err) {
    console.error('Split payment error:', err);
    res.status(500).json({ error: 'שגיאה בביצוע חלוקת התשלום' });
  }
});

export default router;
