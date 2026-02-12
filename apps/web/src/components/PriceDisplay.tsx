/**
 * PriceDisplay – מציג $5 או ₪11 אוטומטית לפי מיקום המשתמש
 */
import React from 'react';
import { useLocale } from '../i18n/useLocale';

const SYMBOLS: Record<string, string> = { ILS: '₪', USD: '$', GBP: '£' };

interface PriceDisplayProps {
  amount: number;
  /** Override – e.g. from Building.currency */
  currency?: string;
  className?: string;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({ amount, currency, className }) => {
  const { formatCurrency, locale } = useLocale();
  const symbol = currency ? SYMBOLS[currency] ?? locale.currencySymbol : locale.currencySymbol;
  const display = `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  return <span className={className}>{display}</span>;
};

export default PriceDisplay;
