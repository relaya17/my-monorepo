/**
 * Locale-aware formatters: dates, currency, pressure, temperature
 */

import type { LocaleConfig } from './locale';

/** Format date according to locale (DD/MM/YYYY or MM/DD/YYYY) */
export function formatDate(date: Date | string | number, locale: LocaleConfig): string {
  const d = typeof date === 'object' && 'getTime' in date ? date : new Date(date);
  if (isNaN(d.getTime())) return '—';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return locale.dateFormat === 'MDY' ? `${month}/${day}/${year}` : `${day}/${month}/${year}`;
}

/** Format currency */
export function formatCurrency(amount: number, locale: LocaleConfig): string {
  return `${locale.currencySymbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

/** Pressure: bar → psi (1 bar ≈ 14.5 psi) or keep bar */
export function formatPressure(bar: number, locale: LocaleConfig): string {
  if (locale.pressureUnit === 'psi') {
    const psi = bar * 14.5038;
    return `${psi.toFixed(1)} PSI`;
  }
  return `${bar.toFixed(2)} bar`;
}

/** Temperature: Celsius → Fahrenheit or keep Celsius */
export function formatTemp(celsius: number, locale: LocaleConfig): string {
  if (locale.tempUnit === 'fahrenheit') {
    const f = (celsius * 9) / 5 + 32;
    return `${f.toFixed(0)}°F`;
  }
  return `${celsius.toFixed(0)}°C`;
}
