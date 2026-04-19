/**
 * useLocale – locale + formatters + feature flags
 */
import { useCallback, useState, useEffect } from 'react';
import {
  getLocale,
  getStoredCountry,
  setStoredCountry,
  inferCountry,
  type CountryCode,
} from './locale';
import { formatDate as fmtDate, formatCurrency as fmtCurr, formatPressure as fmtPress, formatTemp as fmtTemp } from './formatters';
import { getFeatureFlags } from './featureFlags';

export function useLocale() {
  const [country, setCountryState] = useState<CountryCode>(() => getStoredCountry() ?? inferCountry());
  const locale = getLocale(country);

  useEffect(() => {
    const onLocaleChange = () => setCountryState(getStoredCountry() ?? inferCountry());
    window.addEventListener('localechange', onLocaleChange);
    return () => window.removeEventListener('localechange', onLocaleChange);
  }, []);

  const setCountry = useCallback((code: CountryCode) => {
    setStoredCountry(code);
    setCountryState(code);
    window.dispatchEvent(new Event('localechange'));
  }, []);

  const formatDate = useCallback((d: Date | string | number) => fmtDate(d, locale), [locale]);
  const formatCurrency = useCallback((n: number) => fmtCurr(n, locale), [locale]);
  const formatPressure = useCallback((bar: number) => fmtPress(bar, locale), [locale]);
  const formatTemp = useCallback((c: number) => fmtTemp(c, locale), [locale]);

  return {
    locale,
    country,
    setCountry,
    formatDate,
    formatCurrency,
    formatPressure,
    formatTemp,
    /** Feature: US market (Stripe, ADA, Imperial) */
    isUS: country === 'US',
    /** Feature: Israel market (Bit, metric) */
    isIL: country === 'IL' || country === 'default',
    flags: getFeatureFlags(country),
  };
}
