// Navbar.tsx – נאב יחיד. כפתור שפה אחד: אייקון עולם + קוד שפה, דרופדאון עם כל השפות
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toggleNavbar, closeNavbar } from '../redux/slice/navbarSlice';
import { setLanguage } from '../redux/slice/settingsSlice';
import type { RootState } from '../redux/store';
import ROUTES from '../routs/routes';

const IS_LANDING = (path: string) =>
  path === ROUTES.LANDING ||
  path.startsWith('/landing') ||
  path === ROUTES.LANDING_INSIGHTS;

type LangCode = 'en' | 'he' | 'ar' | 'es' | 'fr';

const LANG_OPTIONS: { code: LangCode; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'he', label: 'HE' },
  { code: 'ar', label: 'AR' },
  { code: 'es', label: 'ES' },
  { code: 'fr', label: 'FR' },
];

const Navbar: React.FC = () => {
  const { pathname } = useLocation();
  const isLanding = IS_LANDING(pathname);
  const dispatch = useDispatch();
  const isOpen = useSelector((state: RootState) => state.navbar.isOpen);
  const language = useSelector((state: RootState) => state.settings.language) as LangCode;
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const handleToggleNavbar = () => {
    dispatch(toggleNavbar());
  };

  const handleCloseNavbar = () => {
    dispatch(closeNavbar());
    setLangOpen(false);
  };

  const handleSetLang = (lang: LangCode) => {
    dispatch(setLanguage(lang));
    setLangOpen(false);
  };

  return (
    <nav className={`navbar navbar-expand-lg navbar-dark navbar-glass ${IS_LANDING(pathname) ? 'navbar-transparent' : ''}`}>
      <div className="container">
        <Link className="navbar-brand" to="/" onClick={handleCloseNavbar} style={{ color: '#ffffff' }}>
          <span className="brand-stack">
            <span className="brand-name" style={{ fontWeight: 700, fontSize: '1.7rem', color: '#ffffff', letterSpacing: '0.08em' }}>
              VANTERA
            </span>
            <span className="brand-slogan">Vantera – ניהול נכסים בסטנדרט אחר</span>
          </span>
        </Link>

        <div className="d-flex align-items-center gap-2">
          <div className="position-relative" ref={langRef}>
            <button
              type="button"
              className="navbar-lang-btn-single d-flex align-items-center gap-1"
              onClick={() => setLangOpen((o) => !o)}
              aria-expanded={langOpen}
              aria-haspopup="true"
              aria-label="שפות"
            >
              <i className="fas fa-globe" aria-hidden />
              <span>{(LANG_OPTIONS.find((l) => l.code === language)?.label ?? language?.toUpperCase?.() ?? 'EN')}</span>
            </button>
            {langOpen && (
              <div className="navbar-lang-dropdown show">
                {LANG_OPTIONS.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    className={`navbar-lang-dropdown-item ${language === l.code ? 'active' : ''}`}
                    onClick={() => handleSetLang(l.code)}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {isLanding && (
            <Link
              className="nav-link nav-btn-standards d-flex align-items-center"
              to={ROUTES.LEGAL}
              onClick={handleCloseNavbar}
              aria-label="תקנים וחוקים"
              title="תקנים וחוקים"
            >
              <i className="fas fa-certificate" aria-hidden />
            </Link>
          )}
          <button
            className="navbar-toggler"
            type="button"
            onClick={handleToggleNavbar}
            aria-controls="navbarNav"
            aria-expanded={isOpen ? 'true' : 'false'}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>

        <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav me-auto align-items-center flex-wrap gap-2">
            <li className="nav-item">
              <Link className="nav-link d-flex align-items-center" to={ROUTES.ADMIN_LOGIN} onClick={handleCloseNavbar}>
                <i className="fas fa-user-shield me-2" aria-hidden />
                אדמין
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link d-flex align-items-center" to={ROUTES.USER_LOGIN} onClick={handleCloseNavbar}>
                <i className="fas fa-home me-2" aria-hidden />
                דייר
              </Link>
            </li>
            {!isLanding && (
              <li className="nav-item">
                <Link
                  className="nav-link nav-btn-standards d-flex align-items-center"
                  to={ROUTES.LEGAL}
                  onClick={handleCloseNavbar}
                  aria-label="תקנים וחוקים"
                  title="תקנים וחוקים"
                >
                  <i className="fas fa-certificate" aria-hidden />
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
