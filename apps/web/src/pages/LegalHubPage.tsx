/**
 * דף חוקים ומדיניות לפי מדינה – עיצוב מלכותי
 * IL / US / GB / FR – קישורים לדפים הרלוונטיים
 */
import React, { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import SeoHead from '../components/SeoHead';
import ROUTES from '../routs/routes';
import { setStoredCountry } from '../i18n/locale';
import type { CountryCode } from '../i18n/locale';
import { setLanguage } from '../redux/slice/settingsSlice';
import { safeSetItem } from '../utils/safeStorage';
import './LegalHubPage.css';

const COUNTRY_CONFIG: Record<string, {
  title: string;
  subtitle: string;
  links: { to: string; label: string }[];
  setLocale?: boolean;
}> = {
  IL: {
    title: 'מדיניות ומסמכים – ישראל',
    subtitle: 'חוקים, פרטיות והנחיות רלוונטיות לשוק הישראלי',
    links: [
      { to: ROUTES.PRIVACY_POLICY, label: 'מדיניות פרטיות' },
      { to: ROUTES.TERMS_AND_CONDITIONS, label: 'תנאי שימוש' },
      { to: ROUTES.ACCESSIBILITY, label: 'הנגשה' },
      { to: ROUTES.SECURITY_POLICY, label: 'אבטחת מידע' },
    ],
    setLocale: true,
  },
  US: {
    title: 'Legal & Compliance – United States',
    subtitle: 'Privacy, terms and regulations for the US market',
    links: [
      { to: ROUTES.PRIVACY_POLICY, label: 'Privacy Policy' },
      { to: ROUTES.TERMS_AND_CONDITIONS, label: 'Terms of Service' },
      { to: ROUTES.ACCESSIBILITY, label: 'Accessibility (ADA)' },
      { to: ROUTES.SECURITY_POLICY, label: 'Security Policy' },
    ],
    setLocale: true,
  },
  GB: {
    title: 'Legal & Compliance – United Kingdom',
    subtitle: 'Privacy, terms and UK regulations',
    links: [
      { to: ROUTES.PRIVACY_POLICY, label: 'Privacy Policy' },
      { to: ROUTES.TERMS_AND_CONDITIONS, label: 'Terms of Service' },
      { to: ROUTES.ACCESSIBILITY, label: 'Accessibility' },
      { to: ROUTES.SECURITY_POLICY, label: 'Security Policy' },
    ],
    setLocale: true,
  },
  FR: {
    title: 'Mentions Légales & Conformité – France',
    subtitle: 'RGPD, Loi Élan, CNIL – documents légaux',
    links: [
      { to: ROUTES.MENTIONS_LEGALES, label: 'Mentions Légales' },
      { to: ROUTES.POLITIQUE_CONFIDENTIALITE, label: 'Politique de Confidentialité' },
      { to: ROUTES.CGU, label: "Conditions Générales d'Utilisation" },
      { to: ROUTES.ACCESSIBILITY, label: "Accessibilité (RGAA)" },
    ],
    setLocale: false,
  },
};

const COUNTRY_TO_LANG: Record<string, 'he' | 'en' | 'fr'> = {
  IL: 'he',
  US: 'en',
  GB: 'en',
  FR: 'fr',
};

const LegalHubPage: React.FC = () => {
  const { country } = useParams<{ country: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const code = (country?.toUpperCase() ?? 'IL') as string;
  const config = COUNTRY_CONFIG[code] ?? COUNTRY_CONFIG.IL;

  useEffect(() => {
    if (['IL', 'US', 'GB'].includes(code)) {
      setStoredCountry(code as CountryCode);
      window.dispatchEvent(new Event('localechange'));
    }
    const lang = COUNTRY_TO_LANG[code] ?? 'he';
    dispatch(setLanguage(lang));
    safeSetItem('app_lang', lang);
    document.documentElement.setAttribute('dir', code === 'FR' ? 'ltr' : 'rtl');
    document.documentElement.setAttribute('lang', code === 'FR' ? 'fr' : code === 'US' || code === 'GB' ? 'en' : 'he');
  }, [code, dispatch]);

  return (
    <div className="legal-hub-page">
      <SeoHead
        title={config.title}
        description={config.subtitle}
        noIndex
      />
      <div className="legal-hub-bg" aria-hidden />
      <div className="legal-hub-content">
        <h1 className="legal-hub-title">{config.title}</h1>
        <p className="legal-hub-subtitle">{config.subtitle}</p>
        <div className="legal-hub-links">
          {config.links.map((link) => (
            <Link key={link.to} to={link.to} className="legal-hub-card">
              <span className="legal-hub-card-label">{link.label}</span>
              <i className="fas fa-chevron-right legal-hub-card-arrow" aria-hidden />
            </Link>
          ))}
        </div>
        <Link
          to={code === 'FR' ? ROUTES.LANDING_FR : ROUTES.LANDING}
          className="legal-hub-back"
        >
          ← {code === 'FR' ? "Retour à l'accueil" : code === 'US' || code === 'GB' ? 'Back to Home' : 'חזרה לדף הנחיתה'}
        </Link>
        <div className="legal-hub-country-switch mt-4">
          <span className="text-muted small me-2">{code === 'FR' ? 'Région:' : 'אזור:'}</span>
          {(['IL', 'US', 'GB', 'FR'] as const).map((c) => (
            <button
              key={c}
              type="button"
              className={`btn btn-sm me-1 ${code === c ? 'btn-primary' : 'btn-outline-light'}`}
              onClick={() => navigate(ROUTES.LEGAL_COUNTRY.replace(':country', c))}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LegalHubPage;
