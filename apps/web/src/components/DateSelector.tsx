/**
 * DateSelector – לוח שנה אמריקאי (ראשון) או ישראלי (שני)
 */
import React from 'react';
import { useLocale } from '../i18n/useLocale';

interface DateSelectorProps {
  value?: string;
  onChange?: (date: string) => void;
  min?: string;
  max?: string;
  id?: string;
  className?: string;
  required?: boolean;
}

const DateSelector: React.FC<DateSelectorProps> = ({
  value,
  onChange,
  min,
  max,
  id,
  className = 'form-control',
  required,
}) => {
  const { locale } = useLocale();
  const inputType = 'date';

  return (
    <input
      type={inputType}
      id={id}
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
      min={min}
      max={max}
      className={className}
      required={required}
      aria-label={locale.dateFormat === 'MDY' ? 'Date (MM/DD/YYYY)' : 'Date (DD/MM/YYYY)'}
    />
  );
};

export default DateSelector;
