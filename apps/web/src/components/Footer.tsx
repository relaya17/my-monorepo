import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import ROUTES from '../routs/routes';
import { useTranslation } from '../i18n/useTranslation';
import type { LangCode } from '../i18n/translations';

const LANG_OPTIONS: { code: LangCode; labelKey: string }[] = [
  { code: 'he', labelKey: 'lang_he' },
  { code: 'en', labelKey: 'lang_en' },
  { code: 'ar', labelKey: 'lang_ar' },
  { code: 'ru', labelKey: 'lang_ru' },
  { code: 'es', labelKey: 'lang_es' },
  { code: 'fr', labelKey: 'lang_fr' },
];

const Footer: React.FC = () => {
  const { t, lang, dir, setLang } = useTranslation();

  useEffect(() => {
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', lang === 'he' ? 'he' : lang === 'ar' ? 'ar' : lang);
  }, [dir, lang]);

  return (
    <footer className="bg-dark text-light py-4" role="contentinfo">
      <div className="container-fluid">
        <div className="row align-items-center justify-content-center text-center">
          <div className="col-12 col-md-auto mb-2 mb-md-0">
            <nav aria-label="Footer navigation">
              <Link to={lang === 'fr' ? ROUTES.LANDING_FR : ROUTES.HOME} className="text-light me-2 me-md-3">{t('footer_home')}</Link>
              {lang === 'fr' ? (
                <>
                  <Link to={ROUTES.MENTIONS_LEGALES} className="text-light me-2 me-md-3">Mentions Légales</Link>
                  <Link to={ROUTES.POLITIQUE_CONFIDENTIALITE} className="text-light me-2 me-md-3">Politique de confidentialité</Link>
                  <Link to={ROUTES.CGU} className="text-light me-2 me-md-3">CGU</Link>
                  <Link to={ROUTES.ACCESSIBILITY} className="text-light me-2 me-md-3">{t('footer_accessibility')}</Link>
                </>
              ) : (
                <>
                  <Link to={ROUTES.PRIVACY_POLICY} className="text-light me-2 me-md-3">{t('footer_privacy')}</Link>
                  <Link to={ROUTES.TERMS_AND_CONDITIONS} className="text-light me-2 me-md-3">{t('footer_terms')}</Link>
                  <Link to={ROUTES.ACCESSIBILITY} className="text-light me-2 me-md-3">{t('footer_accessibility')}</Link>
                  <Link to={ROUTES.SECURITY_POLICY} className="text-light me-2 me-md-3">{t('footer_security')}</Link>
                </>
              )}
            </nav>
          </div>
          <div className="col-12 col-md-auto mb-2 mb-md-0">
            <span className="text-muted small d-block mb-1">{t('footer_legal')}</span>
            <p className="small text-muted mb-0" style={{ maxWidth: '320px', margin: '0 auto' }}>{t('legal_notice')}</p>
          </div>
          <div className="col-12 col-md-auto">
            <div className="d-flex flex-wrap align-items-center justify-content-center gap-1" role="group" aria-label="Language selection">
              {LANG_OPTIONS.map(({ code, labelKey }) => (
                <button
                  key={code}
                  type="button"
                  className={`btn btn-sm ${lang === code ? 'btn-light' : 'btn-outline-light'}`}
                  onClick={() => setLang(code)}
                  aria-pressed={lang === code}
                  aria-label={t(labelKey)}
                >
                  {t(labelKey)}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="text-center mt-3 pt-2 border-top border-secondary">
          <small className="text-muted">© {new Date().getFullYear()} {t('footer_rights')} relaya</small>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
