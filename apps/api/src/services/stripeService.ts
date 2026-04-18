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

const CONNECT_COUNTRY = 'IL';

/**
 * Create or get Stripe Connect Express account for a building.
 * If existingAccountId is set and valid, returns it; otherwise creates and returns new account ID.
 */
export async function getOrCreateConnectAccount(params: {
  buildingId: string;
  existingAccountId?: string | null;
  email?: string;
  buildingName?: string;
}): Promise<string> {
  const stripe = getStripeClient();
  const { buildingId, existingAccountId, email, buildingName } = params;

  if (existingAccountId && existingAccountId.startsWith('acct_')) {
    try {
      await stripe.accounts.retrieve(existingAccountId);
      return existingAccountId;
    } catch {
      // Account deleted or invalid – create new
    }
  }

  const account = await stripe.accounts.create({
    type: 'express',
    country: CONNECT_COUNTRY,
    email: email ?? undefined,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    metadata: { buildingId },
    business_profile: buildingName ? { name: buildingName } : undefined,
  });
  return account.id;
}

/**
 * Create Account Link for Connect onboarding (collect bank & identity).
 * Use return_url and refresh_url from client (e.g. dashboard settings page).
 */
export async function createConnectAccountLink(params: {
  accountId: string;
  returnUrl: string;
  refreshUrl: string;
}): Promise<string> {
  const stripe = getStripeClient();
  const link = await stripe.accountLinks.create({
    account: params.accountId,
    refresh_url: params.refreshUrl,
    return_url: params.returnUrl,
    type: 'account_onboarding',
  });
  return link.url;
}

/**
 * Create Login Link for existing Connect account (Express dashboard).
 */
export async function createConnectLoginLink(accountId: string): Promise<string> {
  const stripe = getStripeClient();
  const loginLink = await stripe.accounts.createLoginLink(accountId);
  return loginLink.url;
}

/**
 * Retrieve Connect account – check charges_enabled / details_submitted.
 */
export async function getConnectAccountStatus(accountId: string): Promise<{
  id: string;
  chargesEnabled: boolean;
  detailsSubmitted: boolean;
}> {
  const stripe = getStripeClient();
  const account = await stripe.accounts.retrieve(accountId);
  return {
    id: account.id,
    chargesEnabled: account.charges_enabled ?? false,
    detailsSubmitted: account.details_submitted ?? false,
  };
}
