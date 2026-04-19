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

/**
 * Revenue split: 70% contractor, 20% building committee, 10% Vantera platform.
 * Steps:
 *   1. Charge the full amount on the platform's Stripe account.
 *   2. Transfer 70% to the contractor's Connect account.
 *   3. Transfer 20% to the building committee's Connect account.
 *   The remaining 10% stays on the platform automatically.
 *
 * @param params.paymentIntentId – completed PaymentIntent ID (charge must be captured).
 * @param params.amountIls       – total amount in ILS (float, e.g. 1000.00).
 * @param params.contractorAccountId – Stripe Connect acct_ of the contractor.
 * @param params.buildingAccountId   – Stripe Connect acct_ of the building committee.
 * @returns transfer IDs for audit.
 */
export async function splitPayment(params: {
  paymentIntentId: string;
  amountIls: number;
  contractorAccountId: string;
  buildingAccountId: string;
}): Promise<{ contractorTransferId: string; buildingTransferId: string }> {
  const stripe = getStripeClient();
  const { paymentIntentId, amountIls, contractorAccountId, buildingAccountId } = params;

  const totalCents = Math.round(amountIls * 100);
  const contractorCents = Math.round(totalCents * 0.70);
  const buildingCents = Math.round(totalCents * 0.20);
  // 10% stays on platform: totalCents - contractorCents - buildingCents

  const [contractorTransfer, buildingTransfer] = await Promise.all([
    stripe.transfers.create({
      amount: contractorCents,
      currency: 'ils',
      destination: contractorAccountId,
      source_transaction: paymentIntentId,
      metadata: { split: '70pct_contractor', paymentIntentId },
    }),
    stripe.transfers.create({
      amount: buildingCents,
      currency: 'ils',
      destination: buildingAccountId,
      source_transaction: paymentIntentId,
      metadata: { split: '20pct_building', paymentIntentId },
    }),
  ]);

  return {
    contractorTransferId: contractorTransfer.id,
    buildingTransferId: buildingTransfer.id,
  };
}
