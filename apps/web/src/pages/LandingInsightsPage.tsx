/**
 * דף נתונים – השוואות, סטטיסטיקות, הכנסות.
 * הועבר מדף הנחיתה כדי להקטין עומס ולשמור על נקודות סבבה ברורות.
 */
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import 'framer-motion'; /* sections use motion/useInView */
import ROUTES from '../routs/routes';
import SeoHead from '../components/SeoHead';
import { SEO } from '../content/seo';
import LiveStats from '../components/LiveStats';
import LiveTicker from '../components/LiveTicker';
import XRayBuilding from '../components/XRayBuilding';
import BeforeAfterSlider from '../components/BeforeAfterSlider';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { getApiUrl } from '../api';
import landingContent from '../content/landing-pages.json';
import type { RootState } from '../redux/store';
import type { LandingContent } from './Landing';
import {
  ShieldSection,
  CompetitiveSection,
  RatingSection,
  SecurityShieldSection,
  AboutSection,
  LiveStandardSection,
  ProfitPotentialSection,
  ResidentAppSection,
  RatingSystemSection,
  DigitalAgreementSection,
  PartnershipSection,
  VendorPortalSection,
  RevenueHubSection,
  ResidentValueSection,
  ProgrammerDeclarationSection,
  SelfFundingSection,
  RevenueSection,
  DashboardSection,
  InvestorSection,
} from './Landing';
import './Landing.css';

type LangKey = 'he' | 'en' | 'fr';

/** כתובת וידאו רקע לדף הנתונים – שים כאן את הקישור לווידאו שלך */
const INSIGHTS_VIDEO_SRC = 'https://res.cloudinary.com/dora8sxcb/video/upload/v1770835423/motion2Fast_mp4_bwq9kf.mp4';

const rawContent = landingContent as Record<LangKey, LandingContent>;

const LandingInsightsPage: React.FC = () => {
  const appLang = useSelector((state: RootState) => state.settings.language);
  const lang: LangKey = appLang === 'he' || appLang === 'ar' ? 'he' : appLang === 'fr' ? 'fr' : 'en';
  const content = useMemo(() => rawContent[lang] ?? rawContent.en ?? rawContent.he, [lang]);
  const dir = lang === 'he' ? 'rtl' : 'ltr';

  const [demoOpen, setDemoOpen] = useState(false);
  const [demoSource, setDemoSource] = useState<'landing_demo' | 'vendor_portal'>('landing_demo');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [form, setForm] = useState({ contactName: '', companyName: '', buildingCount: 1, phone: '' });

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('sending');
    try {
      const res = await fetch(getApiUrl('public/demo-request'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName: form.contactName.trim(),
          companyName: form.companyName.trim(),
          buildingCount: Math.max(1, form.buildingCount),
          phone: form.phone.trim(),
          source: demoSource,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && (data.success || data.message)) {
        setSubmitStatus('success');
        setForm({ contactName: '', companyName: '', buildingCount: 1, phone: '' });
      } else setSubmitStatus('error');
    } catch {
      setSubmitStatus('error');
    }
  };

  const closeModal = () => setDemoOpen(false);

  return (
    <div className="landing-page" dir={dir} lang={lang === 'he' ? 'he' : lang === 'fr' ? 'fr' : 'en'}>
      <SeoHead
        title={`${content.insightsPage?.heroTitle ?? (lang === 'he' ? 'נתונים, השוואות והכנסות' : lang === 'fr' ? 'Données, comparaisons et revenus' : 'Data, Comparisons & Revenue')} | ${SEO.home.title}`}
        description={lang === 'he' ? 'השוואות טכנולוגיות, סטטיסטיקות צפייה, דוחות רווח ומודל הכנסות – כל המידע הטכני על Vantera.' : lang === 'fr' ? 'Comparaisons techniques, statistiques de visionnage, rapports de profit et modèle de revenus – toute l\'information technique sur Vantera.' : 'Technology comparisons, viewing stats, profit reports and revenue model – all technical information about Vantera.'}
      />
      <div className="landing-page-bg-video" aria-hidden>
        <video
          src={INSIGHTS_VIDEO_SRC}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          title="רקע וידאו – נתונים, השוואות והכנסות Vantera"
        />
        <div className="landing-page-bg-overlay" />
      </div>
      <div className="landing-page-content">
        <header className="landing-login-bar" role="banner">
          <div className="landing-nav-inner">
            <LanguageSwitcher variant="landing" />
            <Link to={ROUTES.LANDING} className="landing-cta" aria-label={content.insightsPage?.backToLanding ?? (lang === 'he' ? 'חזרה לדף הנחיתה' : lang === 'fr' ? 'Retour à l\'accueil' : 'Back to Landing')}>
              {content.insightsPage?.backToLanding ?? (lang === 'he' ? 'חזרה לדף הנחיתה' : lang === 'fr' ? 'Retour à l\'accueil' : 'Back to Landing')}
            </Link>
          </div>
        </header>

        <section className="landing-hero" style={{ minHeight: '40vh', paddingTop: '2rem' }}>
          <h1>{content.insightsPage?.heroTitle ?? (lang === 'he' ? 'נתונים, השוואות והכנסות' : lang === 'fr' ? 'Données, comparaisons et revenus' : 'Data, Comparisons & Revenue')}</h1>
          <p className="hero-subtitle">{content.insightsPage?.heroSubtitle ?? (lang === 'he' ? 'כל המידע הטכני – מאורגן ומסודר' : lang === 'fr' ? 'Toute l\'information technique – organisée et structurée' : 'All technical information – organized and structured')}</p>
        </section>

        <section className="landing-pulse">
          <h2>{content.metricsSection?.title ?? 'Vantera Intelligence in Action'}</h2>
          <LiveStats />
          <LiveTicker />
        </section>

        {/* 1. מבוא – אודות Vantera והטכנולוגיה */}
        {content.aboutSection && <AboutSection data={content.aboutSection} />}

        {/* 2. השוואות – איך אנחנו מול המתחרים */}
        {content.shieldSection && <ShieldSection data={content.shieldSection} />}
        {content.competitiveSection && <CompetitiveSection data={content.competitiveSection} />}
        {content.ratingSection && <RatingSection data={content.ratingSection} />}
        {content.securityShieldSection && <SecurityShieldSection data={content.securityShieldSection} />}

        {/* 3. מוצר חי – הסטנדרט החי, אפליקציה, דירוגים */}
        {content.liveStandardSection && <LiveStandardSection data={content.liveStandardSection} />}
        {content.residentAppSection && <ResidentAppSection data={content.residentAppSection} />}
        {content.ratingSystemSection && <RatingSystemSection data={content.ratingSystemSection} />}
        {content.digitalAgreementSection && <DigitalAgreementSection data={content.digitalAgreementSection} />}

        {/* 4. מודל הכנסה – בניין שמממן את עצמו, רווחים */}
        {content.selfFundingSection && (
          <SelfFundingSection data={content.selfFundingSection} onRequestDemo={() => setDemoOpen(true)} />
        )}
        {content.revenueSection && <RevenueSection data={content.revenueSection} />}
        {content.profitPotentialSection && <ProfitPotentialSection data={content.profitPotentialSection} />}
        {content.revenueHubSection && <RevenueHubSection data={content.revenueHubSection} />}
        {content.dashboardSection && (
          <DashboardSection data={content.dashboardSection} onRequestDemo={() => setDemoOpen(true)} />
        )}

        {/* 5. שותפים וספקים */}
        {content.partnershipSection && <PartnershipSection data={content.partnershipSection} />}
        {content.vendorPortalSection && (
          <VendorPortalSection
            data={content.vendorPortalSection}
            onRequestDemo={() => {
              setDemoSource('vendor_portal');
              setDemoOpen(true);
            }}
          />
        )}

        {/* 6. ערך לדיירים + אמון */}
        {content.residentValueSection && <ResidentValueSection data={content.residentValueSection} />}
        {content.programmerDeclaration && <ProgrammerDeclarationSection data={content.programmerDeclaration} />}

        {/* 7. משקיעים */}
        {content.investorSection && (
          <InvestorSection data={content.investorSection} onRequestSummary={() => setDemoOpen(true)} />
        )}

        {/* 8. דמואים ויזואליים */}
        <XRayBuilding />
        <BeforeAfterSlider />

        <section className="landing-pulse" style={{ marginTop: '2rem' }}>
          <Link to={ROUTES.LANDING} className="landing-cta">
            {content.insightsPage?.backToLanding ?? (lang === 'he' ? 'חזרה לדף הנחיתה' : lang === 'fr' ? 'Retour à l\'accueil' : 'Back to Landing')}
          </Link>
        </section>
      </div>

      {demoOpen && (
        <div className="landing-modal-overlay" onClick={closeModal} role="dialog" aria-modal="true" aria-labelledby="demo-modal-title">
          <div className="landing-modal glass-card" onClick={e => e.stopPropagation()}>
            <h2 id="demo-modal-title">{content.demoForm.title}</h2>
            {submitStatus === 'success' ? (
              <p className="landing-modal-success">{content.demoForm.successMessage}</p>
            ) : (
              <form onSubmit={handleDemoSubmit}>
                <label>
                  <span>{content.demoForm.contactNameLabel}</span>
                  <input type="text" value={form.contactName} onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))} required />
                </label>
                <label>
                  <span>{content.demoForm.companyNameLabel}</span>
                  <input type="text" value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} required />
                </label>
                <label>
                  <span>{content.demoForm.buildingCountLabel}</span>
                  <input type="number" min={1} value={form.buildingCount} onChange={e => setForm(f => ({ ...f, buildingCount: Number(e.target.value) || 1 }))} required />
                </label>
                <label>
                  <span>{content.demoForm.phoneLabel}</span>
                  <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
                </label>
                {submitStatus === 'error' && <p className="landing-modal-error">{content.demoForm.errorMessage}</p>}
                <div className="landing-modal-actions">
                  <button type="button" className="landing-cta secondary" onClick={closeModal}>{content.demoForm.cancel}</button>
                  <button type="submit" className="landing-cta" disabled={submitStatus === 'sending'}>
                    {submitStatus === 'sending' ? content.demoForm.sending : content.demoForm.submit}
                  </button>
                </div>
              </form>
            )}
            {submitStatus === 'success' && (
              <button type="button" className="landing-cta mt-3" onClick={closeModal}>{content.demoForm.close}</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingInsightsPage;
