/**
 * CountrySwitcher – IL/US/GB/FR – לחיצה מובילה לדף חוקים ומדיניות של המדינה
 */
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLocale } from '../i18n/useLocale';
import ROUTES from '../routs/routes';
import type { CountryCode } from '../i18n/locale';

const LABELS: Record<string, string> = {
  IL: 'ישראל',
  US: 'USA',
  GB: 'UK',
  FR: 'France',
  default: 'ברירת מחדל',
};

interface CountrySwitcherProps {
  variant?: 'default' | 'compact';
  className?: string;
}

const OPTS = ['IL', 'US', 'GB', 'FR'] as const;

const CountrySwitcher: React.FC<CountrySwitcherProps> = ({ variant = 'default', className = '' }) => {
  const { country, setCountry } = useLocale();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const activeCountry = pathname.startsWith('/legal/') ? (pathname.split('/legal/')[1] ?? '').toUpperCase().replace(/\/.*/, '') || country : country;

  const handleCountry = (c: string) => {
    if (c === 'FR') {
      navigate(ROUTES.LEGAL_COUNTRY.replace(':country', 'FR'));
    } else {
      setCountry(c as CountryCode);
      navigate(ROUTES.LEGAL_COUNTRY.replace(':country', c));
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`country-switcher country-switcher--compact ${className}`} role="group" aria-label="Region">
        {OPTS.map((c) => (
          <button
            key={c}
            type="button"
            className={`btn btn-sm ${activeCountry === c ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => handleCountry(c)}
            aria-pressed={activeCountry === c}
            aria-label={`Switch to ${LABELS[c] ?? c}`}
          >
            {c}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`country-switcher ${className}`} role="group" aria-label="Region">
      <span className="me-2">אזור:</span>
      <select
        className="form-select form-select-sm d-inline-block w-auto"
        value={activeCountry || country}
        onChange={(e) => {
          const v = e.target.value;
          if (v === 'FR') navigate(ROUTES.LEGAL_COUNTRY.replace(':country', 'FR'));
          else {
            setCountry(v as CountryCode);
            navigate(ROUTES.LEGAL_COUNTRY.replace(':country', v));
          }
        }}
        aria-label="Select region"
      >
        {OPTS.map((c) => (
          <option key={c} value={c}>
            {LABELS[c]} {c === 'IL' ? '(₪)' : c === 'US' ? '($)' : c === 'GB' ? '(£)' : ''}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CountrySwitcher;
