import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

export const getStripeClient = () => {
  if (stripeClient) {
    return stripeClient;
  }
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable');
  }
  stripeClient = new Stripe(stripeSecretKey);
  return stripeClient;
};

export const getPlatformFeeBps = () => {
  const raw = process.env.STRIPE_PLATFORM_FEE_BPS ?? '100';
  const feeBps = Number(raw);
  if (!Number.isFinite(feeBps) || feeBps < 0) {
    throw new Error('STRIPE_PLATFORM_FEE_BPS must be a non-negative number');
  }
  return feeBps;
};

export const getClientUrl = () => {
  const clientUrl = process.env.CLIENT_URL;
  if (!clientUrl) {
    throw new Error('Missing CLIENT_URL environment variable');
  }
  return clientUrl;
};
