/**
 * Locale definitions – he-IL, en-US, es-US
 */
export type LocaleCode = 'he-IL' | 'en-US' | 'es-US' | 'en-GB' | 'ar-IL';

export const LOCALES: Record<LocaleCode, { country: string; lang: string; dir: 'rtl' | 'ltr' }> = {
  'he-IL': { country: 'IL', lang: 'he', dir: 'rtl' },
  'en-US': { country: 'US', lang: 'en', dir: 'ltr' },
  'es-US': { country: 'US', lang: 'es', dir: 'ltr' },
  'en-GB': { country: 'GB', lang: 'en', dir: 'ltr' },
  'ar-IL': { country: 'IL', lang: 'ar', dir: 'rtl' },
};

export function getLocaleForCountry(country: string): LocaleCode {
  if (country === 'US') return 'en-US';
  if (country === 'GB') return 'en-GB';
  return 'he-IL';
}
