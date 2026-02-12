/**
 * Currency definitions – ILS vs USD and display format
 */
export type CurrencyCode = 'ILS' | 'USD' | 'GBP';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  decimals: number;
  /** e.g. "1,234.56" vs "1.234,56" */
  thousandsSeparator: string;
  decimalSeparator: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  ILS: {
    code: 'ILS',
    symbol: '₪',
    decimals: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    decimals: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    decimals: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
};

export function getCurrencyForCountry(country: string): CurrencyCode {
  if (country === 'US') return 'USD';
  if (country === 'GB') return 'GBP';
  return 'ILS';
}
