import { Request, Response, Router } from 'express';
import Payment from '../models/paymentModel.js';
import { getClientUrl, getPlatformFeeBps, getStripeClient } from '../services/stripeService.js';

const router = Router();

type CheckoutSessionBody = {
  amount: number;
  payer: string;
  tenantId?: string;
  buildingId?: string;
  buildingStripeAccountId: string;
};

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
