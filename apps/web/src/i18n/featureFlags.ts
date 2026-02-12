/**
 * Feature Flags by Region
 * Environment variables override. Enables Stripe for US, Bit for IL, etc.
 */

import type { CountryCode } from './locale';

export type FeatureFlags = {
  useStripe: boolean;
  useBit: boolean;
  twilioSms: boolean;
  americanAppliances: boolean;
  adaCompliance: boolean;
};

function envFlag(key: string): boolean {
  const v = typeof import.meta !== 'undefined' && (import.meta as { env?: Record<string, string> }).env?.[key];
  return v === 'true' || v === '1';
}

export function getFeatureFlags(country: CountryCode): FeatureFlags {
  const forceStripe = envFlag('VITE_STRIPE_ENABLED');
  const forceBit = envFlag('VITE_BIT_ENABLED');
  const forceTwilio = envFlag('VITE_TWILIO_ENABLED');

  return {
    useStripe: forceStripe || country === 'US',
    useBit: forceBit || country === 'IL' || country === 'default',
    twilioSms: forceTwilio || country === 'US',
    americanAppliances: country === 'US',
    adaCompliance: country === 'US',
  };
}
