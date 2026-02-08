import express, { Request, Response, Router } from 'express';
import Stripe from 'stripe';
import Payment from '../models/paymentModel.js';
import { getStripeClient } from '../services/stripeService.js';

const router: Router = Router();

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
    const session = event.data.object;
    if (typeof session === 'object') {
      const paymentId = typeof session.metadata?.paymentId === 'string' ? session.metadata.paymentId : null;
      const sessionId = typeof session.id === 'string' ? session.id : null;
      const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : null;

      if (paymentId) {
        await Payment.findByIdAndUpdate(paymentId, {
          status: 'paid',
          stripePaymentIntentId: paymentIntentId ?? undefined
        });
      } else if (sessionId) {
        await Payment.findOneAndUpdate(
          { stripeSessionId: sessionId },
          { status: 'paid', stripePaymentIntentId: paymentIntentId ?? undefined }
        );
      }
    }
  }

  res.json({ received: true });
});

export default router;
