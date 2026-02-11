import { Request, Response, Router } from 'express';
import Payment from '../models/paymentModel.js';
import Building from '../models/buildingModel.js';
import {
  getClientUrl,
  getPlatformFeeBps,
  getStripeClient,
  getOrCreateConnectAccount,
  createConnectAccountLink,
  createConnectLoginLink,
  getConnectAccountStatus,
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
router.post('/connect/onboard', async (req: Request, res: Response) => {
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
router.post('/connect/login', async (req: Request, res: Response) => {
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

router.post('/checkout-session', async (req: Request, res: Response) => {
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

export default router;
