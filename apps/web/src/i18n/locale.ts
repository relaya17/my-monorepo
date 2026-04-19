/**
 * Locale & Internationalization – Core for Global Scale
 * Country, currency, units, date format. Ready for US/IL/other markets.
 */

export type CountryCode = 'IL' | 'US' | 'GB' | 'default';
export type CurrencyCode = 'ILS' | 'USD' | 'GBP';
export type UnitSystem = 'metric' | 'imperial';

export interface LocaleConfig {
  countryCode: CountryCode;
  currency: CurrencyCode;
  currencySymbol: string;
  /** Date format: 'DMY' (DD/MM/YYYY) or 'MDY' (MM/DD/YYYY) */
  dateFormat: 'DMY' | 'MDY';
  /** Pressure: 'bar' or 'psi' */
  pressureUnit: 'bar' | 'psi';
  /** Temperature: 'celsius' or 'fahrenheit' */
  tempUnit: 'celsius' | 'fahrenheit';
  units: UnitSystem;
  /** US-only: Dishwasher, Garbage Disposal in fault categories */
  hasAmericanAppliances: boolean;
  /** ADA compliance required (US) */
  requiresADA: boolean;
}

const LOCALES: Record<CountryCode, LocaleConfig> = {
  IL: {
    countryCode: 'IL',
    currency: 'ILS',
    currencySymbol: '₪',
    dateFormat: 'DMY',
    pressureUnit: 'bar',
    tempUnit: 'celsius',
    units: 'metric',
    hasAmericanAppliances: false,
    requiresADA: false,
  },
  US: {
    countryCode: 'US',
    currency: 'USD',
    currencySymbol: '$',
    dateFormat: 'MDY',
    pressureUnit: 'psi',
    tempUnit: 'fahrenheit',
    units: 'imperial',
    hasAmericanAppliances: true,
    requiresADA: true,
  },
  GB: {
    countryCode: 'GB',
    currency: 'GBP',
    currencySymbol: '£',
    dateFormat: 'DMY',
    pressureUnit: 'bar',
    tempUnit: 'celsius',
    units: 'metric',
    hasAmericanAppliances: false,
    requiresADA: false,
  },
  default: {
    countryCode: 'IL',
    currency: 'ILS',
    currencySymbol: '₪',
    dateFormat: 'DMY',
    pressureUnit: 'bar',
    tempUnit: 'celsius',
    units: 'metric',
    hasAmericanAppliances: false,
    requiresADA: false,
  },
};

const STORAGE_KEY = 'app_locale_country';

export function getStoredCountry(): CountryCode | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v && (v === 'IL' || v === 'US' || v === 'GB' || v === 'default')) return v as CountryCode;
  } catch {}
  return null;
}

export function setStoredCountry(code: CountryCode): void {
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {}
}

/** Infer country from env (VITE_REGION) or timezone heuristic */
export function inferCountry(): CountryCode {
  const env = typeof import.meta !== 'undefined' && (import.meta as { env?: { VITE_REGION?: string } }).env?.VITE_REGION;
  if (env === 'US' || env === 'us') return 'US';
  if (env === 'GB' || env === 'uk') return 'GB';
  if (env === 'IL' || env === 'il') return 'IL';
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz?.startsWith('America/')) return 'US';
    if (tz?.startsWith('Europe/London')) return 'GB';
  } catch {}
  return 'default';
}

export function getLocale(country?: CountryCode | null): LocaleConfig {
  const code = country ?? getStoredCountry() ?? inferCountry();
  return LOCALES[code] ?? LOCALES.default;
}
