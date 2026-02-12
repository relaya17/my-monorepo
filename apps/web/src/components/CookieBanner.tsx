/**
 * Cookie Banner – CNIL compliant
 * "Accept All" ו-"Refuse All" באותה בולטות. סקריפטים (Analytics) לא רצים עד אישור.
 * מוצג when lang=fr או when visiting /fr
 */
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ROUTES from '../routs/routes';
import { safeGetItem, safeSetItem } from '../utils/safeStorage';
import type { RootState } from '../redux/store';

const STORAGE_KEY = 'vantera_cookie_consent';

export type CookieConsent = 'accepted' | 'refused' | null;

const isFrenchContext = (lang: string, pathname: string) =>
  lang === 'fr' || pathname.startsWith('/fr') || pathname === ROUTES.MENTIONS_LEGALES || pathname === ROUTES.POLITIQUE_CONFIDENTIALITE || pathname === ROUTES.CGU;

const CookieBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const language = useSelector((state: RootState) => state.settings.language);
  const { pathname } = useLocation();

  useEffect(() => {
    const stored = safeGetItem(STORAGE_KEY) as CookieConsent | null;
    if (stored === null && isFrenchContext(language, pathname)) {
      setVisible(true);
    }
  }, [language, pathname]);

  const saveAndHide = (value: CookieConsent) => {
    safeSetItem(STORAGE_KEY, value);
    setVisible(false);
    setPreferencesOpen(false);
  };

  const handleAcceptAll = () => {
    saveAndHide('accepted');
  };

  const handleRefuseAll = () => {
    saveAndHide('refused');
  };

  if (!visible) return null;

  return (
    <div
      className="cookie-banner position-fixed bottom-0 start-0 end-0 p-3 shadow-lg"
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-desc"
      style={{
        backgroundColor: '#1a1d23',
        color: '#f0f0f0',
        zIndex: 9999,
      }}
    >
      <div className="container">
        <h2 id="cookie-banner-title" className="h6 mb-2">
          Gestion des cookies
        </h2>
        <p id="cookie-banner-desc" className="small mb-3">
          Nous utilisons des cookies pour améliorer votre expérience et analyser notre trafic.
          En cliquant sur « Accepter tout », vous consentez à l&apos;utilisation de tous les cookies.
          Vous pouvez également choisir de « Refuser tout » ou de paramétrer vos préférences.
        </p>
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleAcceptAll}
            aria-label="Accepter tous les cookies"
          >
            Accepter tout
          </button>
          <button
            type="button"
            className="btn btn-outline-light btn-sm"
            onClick={handleRefuseAll}
            aria-label="Refuser tous les cookies"
          >
            Refuser tout
          </button>
          <button
            type="button"
            className="btn btn-link btn-sm text-light"
            onClick={() => setPreferencesOpen((o) => !o)}
            aria-expanded={preferencesOpen}
          >
            Paramétrer
          </button>
        </div>

        {preferencesOpen && (
          <div className="mt-3 pt-3 border-top border-secondary small">
            <p className="mb-1">
              <strong>Cookies essentiels :</strong> nécessaires au fonctionnement du site (session, sécurité).
              Ils ne peuvent pas être désactivés.
            </p>
            <p className="mb-1">
              <strong>Cookies analytiques :</strong> nous aident à comprendre l&apos;utilisation du site.
              Ils ne sont activés qu&apos;après votre consentement.
            </p>
            <p className="mb-0">
              Pour plus d&apos;informations, consultez notre{' '}
              <Link to={ROUTES.POLITIQUE_CONFIDENTIALITE} className="text-info">
                Politique de confidentialité
              </Link>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookieBanner;
