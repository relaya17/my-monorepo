import express, { Request, Response, Router } from 'express';
import Stripe from 'stripe';
import Payment from '../models/paymentModel.js';
import Building from '../models/buildingModel.js';
import { getStripeClient } from '../services/stripeService.js';
import { createTransaction } from '../services/transactionService.js';

const router: Router = Router();

async function markPaymentPaidAndCreateTransaction(
  paymentId: string | null,
  sessionId: string | null,
  paymentIntentId: string | null
): Promise<void> {
  if (paymentId) {
    const updated = await Payment.findByIdAndUpdate(
      paymentId,
      { status: 'paid', stripePaymentIntentId: paymentIntentId ?? undefined },
      { new: true }
    ).lean();
    if (updated && (updated as { buildingId?: string }).buildingId && (updated as { status?: string }).status === 'paid') {
      await createTransaction((updated as { buildingId: string }).buildingId, {
        type: 'income',
        amount: (updated as { amount: number }).amount,
        relatedPaymentId: paymentId,
        description: 'Dues payment',
      }).catch(() => {});
    }
    return;
  }
  if (sessionId) {
    const updated = await Payment.findOneAndUpdate(
      { stripeSessionId: sessionId },
      { status: 'paid', stripePaymentIntentId: paymentIntentId ?? undefined },
      { new: true }
    ).lean();
    if (updated && (updated as { buildingId?: string }).buildingId && (updated as { status?: string }).status === 'paid') {
      await createTransaction((updated as { buildingId: string }).buildingId, {
        type: 'income',
        amount: (updated as { amount: number }).amount,
        relatedPaymentId: (updated as { _id: { toString: () => string } })._id.toString(),
        description: 'Dues payment',
      }).catch(() => {});
    }
  }
}

router.post('/', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'];
  if (!signature || Array.isArray(signature)) {
    res.status(400).send('Missing stripe signature');
    return;
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    res.status(500).send('Missing STRIPE_WEBHOOK_SECRET');
    return;
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).send(`Webhook Error: ${message}`);
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const paymentId = typeof session.metadata?.paymentId === 'string' ? session.metadata.paymentId : null;
    const sessionId = session.id;
    const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : null;
    await markPaymentPaidAndCreateTransaction(paymentId, sessionId, paymentIntentId);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const id = paymentIntent.id;
    const updated = await Payment.findOneAndUpdate(
      { stripePaymentIntentId: id, status: { $ne: 'paid' } },
      { status: 'paid' },
      { new: true }
    ).lean();
    if (updated && (updated as { buildingId?: string }).buildingId && (updated as { status?: string }).status === 'paid') {
      await createTransaction((updated as { buildingId: string }).buildingId, {
        type: 'income',
        amount: (updated as { amount: number }).amount,
        relatedPaymentId: (updated as { _id: { toString: () => string } })._id.toString(),
        description: 'Dues payment',
      }).catch(() => {});
    }
  }

  if (event.type === 'account.updated') {
    const account = event.data.object as Stripe.Account;
    const detailsSubmitted = account.details_submitted === true;
    const chargesEnabled = account.charges_enabled === true;
    const buildingId = account.metadata?.buildingId as string | undefined;
    if (buildingId && (detailsSubmitted || chargesEnabled)) {
      await Building.updateOne(
        { stripeAccountId: account.id },
        { $set: { stripeOnboardingComplete: detailsSubmitted } }
      ).catch(() => {});
    }
  }

  res.json({ received: true });
});

export default router;
