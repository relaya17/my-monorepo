import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import ROUTES from '../routs/routes';
import SeoHead from '../components/SeoHead';
import { SEO, SOFTWARE_APPLICATION_SCHEMA } from '../content/seo';
import SystemStatus from '../components/SystemStatus';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { getApiUrl } from '../api';
import landingContent from '../content/landing-pages.json';
import type { RootState } from '../redux/store';
import { RTL_LANGS } from '../i18n/translations';
import { LANDING_VIDEO_SRC } from '../config/media';
import './Landing.css';

type LangKey = 'he' | 'en';

export type LandingContent = {
  hero: { title: string; subtitle: string; subtitleLong?: string; cta: string; b2bCta?: string };
  pillars: { ceo: { title: string; description: string }; technician: { title: string; description: string }; resident: { title: string; description: string } };
  pillarsSectionTitle?: string;
  salesPitchSectionTitle?: string;
  salesPitch?: Array<{ title: string; pitch: string }>;
  competitiveSection?: {
    title: string;
    israelTitle: string;
    israelFocus: string;
    israelWeakness: string;
    israelAdvantage: string;
    globalTitle: string;
    globalFocus: string;
    globalWeakness: string;
    globalAdvantage: string;
  };
  ratingSection?: {
    title: string;
    securityTitle: string;
    securityOurs: string;
    securityOursNote: string;
    securityOthers: string;
    securityOthersNote: string;
    performanceTitle: string;
    performanceOurs: string;
    performanceOursNote: string;
    performanceOthers: string;
    performanceOthersNote: string;
    profitabilityTitle: string;
    profitabilityOurs: string;
    profitabilityOursNote: string;
    profitabilityOthers: string;
    profitabilityOthersNote: string;
  };
  securityShieldSection?: {
    title: string;
    subtitle: string;
    colParam: string;
    colBuilding: string;
    colGov: string;
    colOurs: string;
    securityRows: Array<{ param: string; building: string; gov: string; ours: string }>;
    layersTitle: string;
    layer1Title: string;
    layer1Desc: string;
    layer2Title: string;
    layer2Desc: string;
    layer3Title: string;
    layer3Desc: string;
    trustStatus: string;
    trustLine1: string;
    trustLine2: string;
    trustLine3: string;
    finalRatingTitle: string;
    finalBanks: string;
    finalBanksNote: string;
    finalOurs: string;
    finalOursNote: string;
    finalApps: string;
    finalAppsNote: string;
    e2eTitle?: string;
    e2eDesc?: string;
    latencyTitle?: string;
    latencyDesc?: string;
    tokenizationTitle?: string;
    tokenizationRegular?: string;
    tokenizationOurs?: string;
  };
  shieldSection?: {
    title: string;
    taglines: string[];
    comparisonTitle: string;
    colParam?: string;
    colRegular?: string;
    colOurs?: string;
    comparisonRows: Array<{ param: string; regular: string; ours: string }>;
    safeZoneTitle: string;
    safeZoneDesc: string;
  };
  selfFundingSection?: {
    title: string;
    body: string;
    targetingTitle: string;
    targetingDesc: string;
    revenueShareTitle: string;
    revenueShareDesc: string;
    adDemoLabel?: string;
    adDemoTitle?: string;
    adDemoDesc?: string;
    adDemoCta?: string;
  };
  revenueSection?: {
    title: string;
    subtitle: string;
    bulletPoints: string[];
    emergencyBannerTitle: string;
    emergencyBannerDesc: string;
  };
  dashboardSection?: {
    title: string;
    subtitle: string;
    eyeTitle: string;
    eyeDesc: string;
    walletTitle: string;
    walletDesc: string;
    marketplaceTitle: string;
    marketplaceDesc: string;
    aiMapTitle: string;
    aiMapDesc: string;
    revenueTableTitle: string;
    colSupplier?: string;
    colExposures?: string;
    colClicks?: string;
    colProfit?: string;
    revenueTableRows: Array<{ supplier: string; exposures: string; clicks: string; profit: string }>;
    qualityScoreTitle: string;
    qualityScoreDesc: string;
    dashboardCta?: string;
  };
  investorSection?: {
    title: string;
    tagline?: string;
    vision: string;
    problemTitle: string;
    problems: string[];
    advantageTitle: string;
    advantages: string[];
    marketTitle: string;
    marketPoints: string[];
    cta: string;
  };
  metricsSection?: { title: string };
  demoVideo?: { cta: string; url?: string };
  demoForm: {
    title: string;
    contactNameLabel: string;
    companyNameLabel: string;
    buildingCountLabel: string;
    phoneLabel: string;
    successMessage: string;
    errorMessage: string;
    cancel: string;
    submit: string;
    sending: string;
    close: string;
  };
  loginCta?: string;
  technicianQuote?: string;
  mockupPlaceholder?: string;
  partnershipSection?: { title: string; body: string; revenueShareTitle: string; revenueShareBody: string };
  vendorPortalSection?: { title: string; subtitle: string; labelBusiness: string; placeholderBusiness: string; labelSpecialty: string; options: string[]; tip: string; cta: string; smartMatching: string; documentUploadLabel?: string; documentUploadNote?: string; securityCheckLabel?: string };
  aboutSection?: {
    title: string; tagline: string; intro: string;
    coreTitle: string; shieldTitle: string; shieldDesc: string; encryptionTitle: string; encryptionDesc: string; latencyTitle: string; latencyDesc: string;
    profitTitle: string; profitIntro: string; cpcCpaTitle: string; cpcCpaDesc: string; splitTitle: string; split70: string; split20: string; split10: string;
    contractorTitle: string; digitalKeyTitle: string; digitalKeyDesc: string; blueprintTitle: string; blueprintDesc: string; zeroMarketingTitle: string; zeroMarketingDesc: string;
    escrowTitle: string; escrowStep1: string; escrowStep2: string; escrowStep3: string; escrowStep4: string; programmerNote: string;
  };
  liveStandardSection?: {
    title: string; tagline: string;
    onlineOfflineTitle: string; onlineOfflineDesc: string;
    proRadarTitle: string; proRadarDesc: string;
    pillar1Title: string; pillar1Desc: string; pillar1Result: string;
    pillar2Title: string; pillar2Desc: string; pillar2Result: string;
    pillar3Title: string; pillar3Desc: string; pillar3Result: string;
    radarSearchLabel: string; radarFoundLabel: string; radarFoundName: string; radarDistance: string; radarRating: string; radarCta: string;
    cockpitTitle: string; cockpitCard1: string; cockpitCard1Name: string; cockpitCard1Dist: string; cockpitCard2: string; cockpitCard2Name: string; cockpitCard2Dist: string;
    hslCompareTitle: string; hslCompareDesc: string;
  };
  profitPotentialSection?: {
    title: string; subtitle: string; colSource: string; colVolume: string; colFee: string; colTotal: string;
    row1Source: string; row1Volume: string; row1Fee: string; row1Total: string;
    row2Source: string; row2Volume: string; row2Fee: string; row2Total: string;
    row3Source: string; row3Volume: string; row3Fee: string; row3Total: string;
    totalLabel: string; totalValue: string; bottomLine: string;
  };
  residentAppSection?: {
    title: string; subtitle: string; securityStatus: string; securityProtected: string; securityNote: string;
    availableTitle: string; supplierName: string; supplierMeta: string; orderCta: string; feedBanner: string;
  };
  ratingSystemSection?: {
    title: string; tagline: string;
    thresholdTitle: string; thresholdDesc: string; bonusTitle: string; bonusDesc: string;
    verifiedTitle: string; verifiedDesc: string;
    completionTitle: string; completionQuestion: string; securityCheckLabel: string; approveCta: string;
  };
  digitalAgreementSection?: {
    title: string;
    point1Title: string; point1Desc: string; point2Title: string; point2Desc: string; point3Title: string; point3Desc: string;
  };
  revenueHubSection?: { title: string; cumulativeLabel: string; cumulativeValue: string; callsLabel: string; callsValue: string; activeVendorsLabel: string; vendors: Array<{ name: string; commission: string }>; proAccessTitle: string; proAccessPoints: string[] };
  programmerDeclaration?: { title: string; body: string; revenueSignature: string };
  residentValueSection?: { title: string; painTitle: string; painPoints: string[]; solutionTitle: string; solutionPoints: string[]; valueTitle: string; valuePoints: string[] };
  insightsPage?: {
    ctaTitle: string;
    ctaDesc: string;
    ctaLink: string;
    heroTitle: string;
    heroSubtitle: string;
    backToLanding: string;
  };
};

const rawContent = landingContent as Record<LangKey, LandingContent>;

const pillarVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.12 },
  }),
};

/** רשימת הפיצ'רים למכירה – 4 הנקודות לועד/מנכ"ל. */
function SalesPitchSection({
  sectionTitle,
  items,
}: {
  sectionTitle?: string;
  items: Array<{ title: string; pitch: string }>;
}) {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <section className="landing-sales-pitch" ref={ref} aria-labelledby="sales-pitch-heading">
      <h2 id="sales-pitch-heading">{sectionTitle ?? 'למה לבחור ב-Vantera'}</h2>
      <div className="sales-pitch-grid">
        {items.map((item, i) => (
          <motion.article
            key={item.title}
            className="glass-card sales-pitch-card"
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <h3>{item.title}</h3>
            <p>{item.pitch}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

/** טבלת השוואה טכנולוגית + Safe-Zone – מה שהופך אותנו לסטארט-אפ. */
export function ShieldSection({
  data,
}: {
  data: {
    title: string;
    taglines: string[];
    comparisonTitle: string;
    comparisonRows: Array<{ param: string; regular: string; ours: string }>;
    safeZoneTitle: string;
    safeZoneDesc: string;
  };
}) {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <section className="landing-shield" ref={ref} aria-labelledby="shield-heading">
      <h2 id="shield-heading">{data.title}</h2>
      <div className="landing-shield-taglines">
        {data.taglines.map((t, i) => (
          <motion.span
            key={t}
            className="landing-shield-tagline"
            initial={{ opacity: 0, y: 8 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.3, delay: i * 0.08 }}
          >
            {t}
          </motion.span>
        ))}
      </div>
      <h3 className="landing-shield-table-title">{data.comparisonTitle}</h3>
      <motion.div
        className="landing-shield-table-wrap"
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <table className="landing-shield-table" role="grid">
          <thead>
            <tr>
              <th scope="col">{data.colParam ?? 'Parameter'}</th>
              <th scope="col">{data.colRegular ?? 'Regular Systems'}</th>
              <th scope="col">{data.colOurs ?? 'Our System'}</th>
            </tr>
          </thead>
          <tbody>
            {data.comparisonRows.map((row, i) => (
              <tr key={i}>
                <td data-label={data.colParam ?? 'Parameter'}>{row.param}</td>
                <td data-label={data.colRegular ?? 'Regular'}>{row.regular}</td>
                <td data-label={data.colOurs ?? 'Ours'}>{row.ours}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
      <motion.div
        className="landing-shield-safezone glass-card"
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: 0.35 }}
      >
        <h4>{data.safeZoneTitle}</h4>
        <p>{data.safeZoneDesc}</p>
      </motion.div>
    </section>
  );
}

/** סעיף תחרותי – למה אנחנו מנצחים (ישראל vs עולם). */
export function CompetitiveSection({ data }: { data: NonNullable<LandingContent['competitiveSection']> }) {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <section className="landing-competitive" ref={ref} aria-labelledby="competitive-heading">
      <h2 id="competitive-heading">{data.title}</h2>
      <div className="landing-competitive-grid">
        <motion.div
          className="landing-competitive-card glass-card"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
        >
          <h4>{data.israelTitle}</h4>
          <p>{data.israelFocus}</p>
          <p className="landing-competitive-weak">{data.israelWeakness}</p>
          <p className="landing-competitive-strong">{data.israelAdvantage}</p>
        </motion.div>
        <motion.div
          className="landing-competitive-card glass-card"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.12 }}
        >
          <h4>{data.globalTitle}</h4>
          <p>{data.globalFocus}</p>
          <p className="landing-competitive-weak">{data.globalWeakness}</p>
          <p className="landing-competitive-strong">{data.globalAdvantage}</p>
        </motion.div>
      </div>
    </section>
  );
}

/** סעיף דירוג 1-10 – Security, Performance, Profitability. */
export function RatingSection({ data }: { data: NonNullable<LandingContent['ratingSection']> }) {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const items = [
    { title: data.securityTitle, ours: data.securityOurs, oursNote: data.securityOursNote, others: data.securityOthers, othersNote: data.securityOthersNote },
    { title: data.performanceTitle, ours: data.performanceOurs, oursNote: data.performanceOursNote, others: data.performanceOthers, othersNote: data.performanceOthersNote },
    { title: data.profitabilityTitle, ours: data.profitabilityOurs, oursNote: data.profitabilityOursNote, others: data.profitabilityOthers, othersNote: data.profitabilityOthersNote },
  ];
  return (
    <section className="landing-rating" ref={ref} aria-labelledby="rating-heading">
      <h2 id="rating-heading">{data.title}</h2>
      <div className="landing-rating-grid">
        {items.map((item, i) => (
          <motion.div
            key={item.title}
            className="landing-rating-card glass-card"
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            <h4>{item.title}</h4>
            <div className="landing-rating-row">
              <span className="landing-rating-ours">{item.ours}/10</span>
              <span className="landing-rating-note">{item.oursNote}</span>
            </div>
            <div className="landing-rating-row landing-rating-others">
              <span>{item.others}/10</span>
              <span className="landing-rating-note">{item.othersNote}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/** סעיף אבטחה – טבלת השוואה, 3 שכבות הגנה, Security Trust, דירוג סופי. */
export function SecurityShieldSection({ data }: { data: NonNullable<LandingContent['securityShieldSection']> }) {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <section className="landing-security-shield" ref={ref} aria-labelledby="security-shield-heading">
      <h2 id="security-shield-heading">{data.title}</h2>
      <p className="landing-security-subtitle">{data.subtitle}</p>

      <motion.div
        className="landing-security-table-wrap glass-card"
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <table className="landing-security-table" role="grid">
          <thead>
            <tr>
              <th scope="col">{data.colParam}</th>
              <th scope="col">{data.colBuilding}</th>
              <th scope="col">{data.colGov}</th>
              <th scope="col">{data.colOurs}</th>
            </tr>
          </thead>
          <tbody>
            {data.securityRows.map((row, i) => (
              <tr key={i}>
                <td data-label={data.colParam}>{row.param}</td>
                <td data-label={data.colBuilding}>{row.building}</td>
                <td data-label={data.colGov}>{row.gov}</td>
                <td data-label={data.colOurs} className="landing-security-ours">{row.ours}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      <h3 className="landing-security-layers-title">{data.layersTitle}</h3>
      <div className="landing-security-layers">
        {[
          { title: data.layer1Title, desc: data.layer1Desc },
          { title: data.layer2Title, desc: data.layer2Desc },
          { title: data.layer3Title, desc: data.layer3Desc },
        ].map((layer, i) => (
          <motion.div
            key={layer.title}
            className="landing-security-layer glass-card"
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
          >
            <h4>{layer.title}</h4>
            <p>{layer.desc}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="landing-security-trust glass-card"
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <div className="landing-security-trust-header">
          <span className="landing-security-trust-dot" aria-hidden />
          <strong>{data.trustStatus}</strong>
        </div>
        <ul className="landing-security-trust-list">
          <li>&gt; {data.trustLine1}</li>
          <li>&gt; {data.trustLine2}</li>
          <li>&gt; {data.trustLine3}</li>
        </ul>
      </motion.div>

      {(data.e2eTitle || data.latencyTitle || data.tokenizationTitle) && (
        <div className="landing-security-tech">
          {data.e2eTitle && (
            <motion.div
              className="landing-security-tech-card glass-card"
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.45 }}
            >
              <h4>{data.e2eTitle}</h4>
              <p>{data.e2eDesc}</p>
            </motion.div>
          )}
          {data.latencyTitle && (
            <motion.div
              className="landing-security-tech-card glass-card"
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <h4>{data.latencyTitle}</h4>
              <p>{data.latencyDesc}</p>
            </motion.div>
          )}
          {data.tokenizationTitle && (
            <motion.div
              className="landing-security-tech-card glass-card"
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.55 }}
            >
              <h4>{data.tokenizationTitle}</h4>
              <p className="landing-security-weak">{data.tokenizationRegular}</p>
              <p className="landing-security-strong">{data.tokenizationOurs}</p>
            </motion.div>
          )}
        </div>
      )}

      <motion.div
        className="landing-security-final"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.4, delay: 0.65 }}
      >
        <h4>{data.finalRatingTitle}</h4>
        <p><strong>{data.finalBanks}</strong> – {data.finalBanksNote}</p>
        <p className="landing-security-final-ours"><strong>{data.finalOurs}</strong> – {data.finalOursNote}</p>
        <p><strong>{data.finalApps}</strong> – {data.finalAppsNote}</p>
      </motion.div>
    </section>
  );
}

/** סעיף אודות Vantera – תוכן שיווקי-טכנולוגי מלא. */
export function AboutSection({ data }: { data: NonNullable<LandingContent['aboutSection']> }) {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const coreItems = [
    { title: data.shieldTitle, desc: data.shieldDesc },
    { title: data.encryptionTitle, desc: data.encryptionDesc },
    { title: data.latencyTitle, desc: data.latencyDesc },
  ];
  const contractorItems = [
    { title: data.digitalKeyTitle, desc: data.digitalKeyDesc },
    { title: data.blueprintTitle, desc: data.blueprintDesc },
    { title: data.zeroMarketingTitle, desc: data.zeroMarketingDesc },
  ];
  const escrowSteps = [data.escrowStep1, data.escrowStep2, data.escrowStep3, data.escrowStep4];
  return (
    <section className="landing-about" ref={ref} aria-labelledby="about-heading">
      <h2 id="about-heading">{data.title}</h2>
      <p className="landing-about-tagline">{data.tagline}</p>
      <motion.p
        className="landing-about-intro"
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4 }}
      >
        {data.intro}
      </motion.p>

      <motion.div
        className="landing-about-core glass-card"
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: 0.08 }}
      >
        <h4>{data.coreTitle}</h4>
        <ul>
          {coreItems.map((item, i) => (
            <li key={i}><strong>{item.title}:</strong> {item.desc}</li>
          ))}
        </ul>
      </motion.div>

      <motion.div
        className="landing-about-profit glass-card"
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <h4>{data.profitTitle}</h4>
        <p>{data.profitIntro}</p>
        <p><strong>{data.cpcCpaTitle}:</strong> {data.cpcCpaDesc}</p>
        <div className="landing-about-split">
          <span>{data.splitTitle}</span>
          <span>{data.split70}</span>
          <span>{data.split20}</span>
          <span>{data.split10}</span>
        </div>
      </motion.div>

      <motion.div
        className="landing-about-contractor glass-card"
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: 0.22 }}
      >
        <h4>{data.contractorTitle}</h4>
        <ul>
          {contractorItems.map((item, i) => (
            <li key={i}><strong>{item.title}:</strong> {item.desc}</li>
          ))}
        </ul>
      </motion.div>

      <motion.div
        className="landing-about-escrow glass-card"
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <h4>{data.escrowTitle}</h4>
        <ol>
          {escrowSteps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
        <p className="landing-about-note">{data.programmerNote}</p>
      </motion.div>
    </section>
  );
}

/** סעיף הסטנדרט החי – Pro-Radar, Online/Offline, Live GPS. */
export function LiveStandardSection({ data }: { data: NonNullable<LandingContent['liveStandardSection']> }) {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const pillars = [
    { title: data.pillar1Title, desc: data.pillar1Desc, result: data.pillar1Result },
    { title: data.pillar2Title, desc: data.pillar2Desc, result: data.pillar2Result },
    { title: data.pillar3Title, desc: data.pillar3Desc, result: data.pillar3Result },
  ];
  return (
    <section className="landing-live-standard" ref={ref} aria-labelledby="live-standard-heading">
      <h2 id="live-standard-heading">{data.title}</h2>
      <p className="landing-live-tagline">{data.tagline}</p>

      <motion.div
        className="landing-live-online-offline glass-card"
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4 }}
      >
        <h4>{data.onlineOfflineTitle}</h4>
        <p>{data.onlineOfflineDesc}</p>
      </motion.div>

      <motion.div
        className="landing-live-pro-radar glass-card"
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: 0.08 }}
      >
        <h4>{data.proRadarTitle}</h4>
        <p>{data.proRadarDesc}</p>
      </motion.div>

      <div className="landing-live-pillars">
        {pillars.map((p, i) => (
          <motion.div
            key={p.title}
            className="landing-live-pillar glass-card"
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.12 + i * 0.06 }}
          >
            <h5>{p.title}</h5>
            <p>{p.desc}</p>
            <p className="landing-live-result">{p.result}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="landing-live-radar-mockup glass-card"
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: 0.35 }}
        aria-label="Live radar demo"
      >
        <div className="landing-radar-header">
          <h4>🔎 {data.radarSearchLabel}</h4>
          <span className="landing-radar-pulse" aria-hidden />
        </div>
        <div className="landing-radar-found">
          <p><b>{data.radarFoundLabel}</b> {data.radarFoundName}</p>
          <p className="landing-radar-meta">📍 {data.radarDistance}</p>
          <p className="landing-radar-meta">⭐ {data.radarRating}</p>
        </div>
        <button type="button" className="landing-radar-cta">{data.radarCta}</button>
      </motion.div>

      <motion.div
        className="landing-live-cockpit glass-card"
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: 0.42 }}
      >
        <div className="landing-cockpit-header">
          <span className="landing-cockpit-dot" aria-hidden />
          <strong>{data.cockpitTitle}</strong>
        </div>
        <div className="landing-cockpit-grid">
          <div className="landing-cockpit-card">
            <span className="landing-cockpit-label">{data.cockpitCard1}</span>
            <span className="landing-cockpit-name">{data.cockpitCard1Name} <span className="landing-cockpit-dist">({data.cockpitCard1Dist})</span></span>
          </div>
          <div className="landing-cockpit-card">
            <span className="landing-cockpit-label">{data.cockpitCard2}</span>
            <span className="landing-cockpit-name">{data.cockpitCard2Name} <span className="landing-cockpit-dist">({data.cockpitCard2Dist})</span></span>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="landing-live-hsl-compare glass-card"
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <h4>{data.hslCompareTitle}</h4>
        <p>{data.hslCompareDesc}</p>
      </motion.div>
    </section>
  );
}

/** דוח פוטנציאל רווח – 50 בניינים. */
export function ProfitPotentialSection({ data }: { data: NonNullable<LandingContent['profitPotentialSection']> }) {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const rows = [
    { source: data.row1Source, volume: data.row1Volume, fee: data.row1Fee, total: data.row1Total },
    { source: data.row2Source, volume: data.row2Volume, fee: data.row2Fee, total: data.row2Total },
    { source: data.row3Source, volume: data.row3Volume, fee: data.row3Fee, total: data.row3Total },
  ];
  return (
    <section className="landing-profit-potential" ref={ref} aria-labelledby="profit-heading">
      <h2 id="profit-heading">{data.title}</h2>
      <p className="landing-profit-subtitle">{data.subtitle}</p>
      <motion.div className="landing-profit-table glass-card" initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.4 }}>
        <table>
          <thead>
            <tr>
              <th>{data.colSource}</th>
              <th>{data.colVolume}</th>
              <th>{data.colFee}</th>
              <th>{data.colTotal}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{r.source}</td>
                <td>{r.volume}</td>
                <td>{r.fee}</td>
                <td className="landing-profit-total">{r.total}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3}><strong>{data.totalLabel}</strong></td>
              <td className="landing-profit-total"><strong>{data.totalValue}</strong></td>
            </tr>
          </tfoot>
        </table>
        <p className="landing-profit-bottom">{data.bottomLine}</p>
      </motion.div>
    </section>
  );
}

/** חוויית הדייר – Resident App mockup. */
export function ResidentAppSection({ data }: { data: NonNullable<LandingContent['residentAppSection']> }) {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <section className="landing-resident-app" ref={ref} aria-labelledby="resident-app-heading">
      <h2 id="resident-app-heading">{data.title}</h2>
      <p className="landing-resident-subtitle">{data.subtitle}</p>
      <motion.div className="landing-resident-mockup glass-card" initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.4 }}>
        <div className="landing-resident-security">
          <small>{data.securityStatus}</small>
          <div>{data.securityProtected}</div>
        </div>
        <h4>{data.availableTitle}</h4>
        <div className="landing-resident-supplier-card">
          <div className="landing-resident-avatar" aria-hidden />
          <div className="landing-resident-supplier-info">
            <strong>{data.supplierName}</strong>
            <span>{data.supplierMeta}</span>
          </div>
          <button type="button" className="landing-resident-order-btn">{data.orderCta}</button>
        </div>
        <p className="landing-resident-feed">{data.feedBanner}</p>
      </motion.div>
    </section>
  );
}

/** מערכת דירוג אקטיבית + אישור סיום עבודה. */
export function RatingSystemSection({ data }: { data: NonNullable<LandingContent['ratingSystemSection']> }) {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const points = [
    { title: data.thresholdTitle, desc: data.thresholdDesc },
    { title: data.bonusTitle, desc: data.bonusDesc },
    { title: data.verifiedTitle, desc: data.verifiedDesc },
  ];
  return (
    <section className="landing-rating-system" ref={ref} aria-labelledby="rating-system-heading">
      <h2 id="rating-system-heading">{data.title}</h2>
      <p className="landing-rating-tagline">{data.tagline}</p>
      <div className="landing-rating-points">
        {points.map((p, i) => (
          <motion.div key={p.title} className="landing-rating-point glass-card" initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.4, delay: i * 0.08 }}>
            <h5>{p.title}</h5>
            <p>{p.desc}</p>
          </motion.div>
        ))}
      </div>
      <motion.div className="landing-completion-mockup glass-card" initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.4, delay: 0.3 }}>
        <h4>{data.completionTitle}</h4>
        <p>{data.completionQuestion}</p>
        <div className="landing-completion-stars" aria-hidden>⭐ ⭐ ⭐ ⭐ ⭐</div>
        <div className="landing-completion-check">
          <input type="checkbox" id="completion-sec" disabled aria-label={data.securityCheckLabel} />
          <label htmlFor="completion-sec">{data.securityCheckLabel}</label>
        </div>
        <button type="button" className="landing-completion-cta">{data.approveCta}</button>
      </motion.div>
    </section>
  );
}

/** הסכם השירות הדיגיטלי. */
export function DigitalAgreementSection({ data }: { data: NonNullable<LandingContent['digitalAgreementSection']> }) {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const points = [
    { title: data.point1Title, desc: data.point1Desc },
    { title: data.point2Title, desc: data.point2Desc },
    { title: data.point3Title, desc: data.point3Desc },
  ];
  return (
    <section className="landing-digital-agreement" ref={ref} aria-labelledby="agreement-heading">
      <h2 id="agreement-heading">{data.title}</h2>
      <div className="landing-agreement-points">
        {points.map((p, i) => (
          <motion.div key={p.title} className="landing-agreement-point glass-card" initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.4, delay: i * 0.1 }}>
            <h5>{p.title}</h5>
            <p>{p.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/** סעיף שותפות עסקית – לא רק תוכנה. */
export function PartnershipSection({ data }: { data: NonNullable<LandingContent['partnershipSection']> }) {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <section className="landing-partnership" ref={ref} aria-labelledby="partnership-heading">
      <h2 id="partnership-heading">{data.title}</h2>
      <motion.p
        className="landing-partnership-body"
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4 }}
      >
        {data.body}
      </motion.p>
      <motion.div
        className="landing-partnership-revenue glass-card"
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <h4>{data.revenueShareTitle}</h4>
        <p>{data.revenueShareBody}</p>
      </motion.div>
    </section>
  );
}

/** סעיף פורטל ספקים – רישום קבלנים (Pro-Filter). */
export function VendorPortalSection({ data, onRequestDemo }: { data: NonNullable<LandingContent['vendorPortalSection']>; onRequestDemo: () => void }) {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [securityChecked, setSecurityChecked] = React.useState(false);
  return (
    <section className="landing-vendor-portal" ref={ref} aria-labelledby="vendor-heading">
      <h2 id="vendor-heading">{data.title}</h2>
      <p className="landing-vendor-subtitle">{data.subtitle}</p>
      <motion.div
        className="landing-vendor-form glass-card"
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4 }}
      >
        <label>{data.labelBusiness}</label>
        <input type="text" placeholder={data.placeholderBusiness} readOnly />
        <label>{data.labelSpecialty}</label>
        <select disabled aria-label={data.labelSpecialty}>
          {data.options.map((opt, i) => (
            <option key={i} value={opt}>{opt}</option>
          ))}
        </select>
        {data.documentUploadLabel && (
          <div className="landing-vendor-upload">
            <p>{data.documentUploadLabel}</p>
            <div className="landing-vendor-upload-zone" aria-label={data.documentUploadLabel}>
              <span>{data.documentUploadNote}</span>
            </div>
          </div>
        )}
        {data.securityCheckLabel && (
          <div className="landing-vendor-security-check">
            <input
              type="checkbox"
              id="vendor-sec-check"
              checked={securityChecked}
              onChange={e => setSecurityChecked(e.target.checked)}
              aria-label={data.securityCheckLabel}
            />
            <label htmlFor="vendor-sec-check">{data.securityCheckLabel}</label>
          </div>
        )}
        <div className="landing-vendor-tip">
          <span>💡</span> {data.tip}
        </div>
        <button type="button" className="landing-vendor-cta" onClick={onRequestDemo}>{data.cta}</button>
      </motion.div>
      <motion.p
        className="landing-vendor-smart"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {data.smartMatching}
      </motion.p>
    </section>
  );
}

/** סעיף Revenue Hub – דשבורד הכנסות. */
export function RevenueHubSection({ data }: { data: NonNullable<LandingContent['revenueHubSection']> }) {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <section className="landing-revenue-hub" ref={ref} aria-labelledby="revenue-hub-heading">
      <h2 id="revenue-hub-heading">{data.title}</h2>
      <motion.div
        className="landing-revenue-hub-card glass-card"
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4 }}
      >
        <div className="landing-revenue-hub-stats">
          <div className="landing-revenue-hub-stat">
            <span>{data.cumulativeLabel}</span>
            <strong className="text-success">{data.cumulativeValue}</strong>
          </div>
          <div className="landing-revenue-hub-stat">
            <span>{data.callsLabel}</span>
            <strong className="text-warning">{data.callsValue}</strong>
          </div>
        </div>
        <div className="landing-revenue-hub-vendors">
          <h4>{data.activeVendorsLabel}</h4>
          <ul>
            {data.vendors.map((v, i) => (
              <li key={i}>
                <span>{v.name}</span>
                <span className="landing-revenue-commission">{v.commission}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
      <motion.div
        className="landing-revenue-hub-pro glass-card"
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <h4>{data.proAccessTitle}</h4>
        <ul>
          {data.proAccessPoints.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </motion.div>
    </section>
  );
}

/** הצהרת המתכנת. */
export function ProgrammerDeclarationSection({ data }: { data: NonNullable<LandingContent['programmerDeclaration']> }) {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <section className="landing-programmer-declaration" ref={ref} aria-labelledby="declaration-heading">
      <h2 id="declaration-heading">{data.title}</h2>
      <motion.blockquote
        className="landing-declaration-body glass-card"
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4 }}
      >
        {data.body}
      </motion.blockquote>
      <motion.p
        className="landing-declaration-signature"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        {data.revenueSignature}
      </motion.p>
    </section>
  );
}

/** סעיף ערך לדיירים – המהפכה בניהול הבניין. */
export function ResidentValueSection({ data }: { data: NonNullable<LandingContent['residentValueSection']> }) {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <section className="landing-resident-value" ref={ref} aria-labelledby="resident-value-heading">
      <h2 id="resident-value-heading">{data.title}</h2>
      <div className="landing-resident-value-grid">
        <motion.div
          className="landing-resident-value-card glass-card"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
        >
          <h4>{data.painTitle}</h4>
          <ul>{data.painPoints.map((p, i) => <li key={i}>{p}</li>)}</ul>
        </motion.div>
        <motion.div
          className="landing-resident-value-card glass-card"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
          <h4>{data.solutionTitle}</h4>
          <ul>{data.solutionPoints.map((p, i) => <li key={i}>{p}</li>)}</ul>
        </motion.div>
        <motion.div
          className="landing-resident-value-card glass-card"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.16 }}
        >
          <h4>{data.valueTitle}</h4>
          <ul>{data.valuePoints.map((p, i) => <li key={i}>{p}</li>)}</ul>
        </motion.div>
      </div>
    </section>
  );
}

/** סעיף "הבניין שמממן את עצמו" – Marketplace, Targeting, Revenue Share + דוגמת באנר. */
export function SelfFundingSection({
  data,
  onRequestDemo,
}: {
  data: {
    title: string;
    body: string;
    targetingTitle: string;
    targetingDesc: string;
    revenueShareTitle: string;
    revenueShareDesc: string;
    adDemoTitle?: string;
    adDemoDesc?: string;
    adDemoCta?: string;
  };
  onRequestDemo: () => void;
}) {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <section className="landing-self-funding" ref={ref} aria-labelledby="self-funding-heading">
      <h2 id="self-funding-heading">{data.title}</h2>
      <motion.p
        className="landing-self-funding-body"
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4 }}
      >
        {data.body}
      </motion.p>

      <div className="landing-self-funding-cards">
        <motion.div
          className="landing-self-funding-card glass-card"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h4>{data.targetingTitle}</h4>
          <p>{data.targetingDesc}</p>
        </motion.div>
        <motion.div
          className="landing-self-funding-card glass-card"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h4>{data.revenueShareTitle}</h4>
          <p>{data.revenueShareDesc}</p>
        </motion.div>
      </div>

      {(data.adDemoTitle || data.adDemoDesc) && (
        <motion.div
          className="landing-ad-demo-wrap"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <p className="landing-ad-demo-label">{data.adDemoLabel ?? 'Sample ad:'}</p>
          <div className="landing-ad-demo">
            <div className="landing-ad-demo-content">
              <span className="landing-ad-demo-badge">בחסות</span>
              <h3>{data.adDemoTitle ?? 'חשמלאי מוסמך זמין כעת'}</h3>
              <p>{data.adDemoDesc ?? 'תיקון קצרים ותשתיות לדיירי הבניין שלכם.'}</p>
            </div>
            <div className="landing-ad-demo-action">
              <button type="button" className="landing-ad-demo-cta" onClick={onRequestDemo}>
                {data.adDemoCta ?? 'הזמן שירות'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </section>
  );
}

/** סעיף מודל הכנסה – פיד פרסומי + Emergency Banner. */
export function RevenueSection({
  data,
}: {
  data: {
    title: string;
    subtitle: string;
    bulletPoints: string[];
    emergencyBannerTitle: string;
    emergencyBannerDesc: string;
  };
}) {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <section className="landing-revenue" ref={ref} aria-labelledby="revenue-heading">
      <h2 id="revenue-heading">{data.title}</h2>
      <p className="landing-revenue-subtitle">{data.subtitle}</p>
      <ul className="landing-revenue-bullets">
        {data.bulletPoints.map((b, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.35, delay: 0.1 + i * 0.08 }}
          >
            {b}
          </motion.li>
        ))}
      </ul>
      <motion.div
        className="landing-revenue-emergency glass-card"
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <h4>{data.emergencyBannerTitle}</h4>
        <p>{data.emergencyBannerDesc}</p>
      </motion.div>
    </section>
  );
}

/** סעיף דשבורד המנהל – The Eye, Wallet, Marketplace, AI Map + טבלת רווחים + Quality Score. */
export function DashboardSection({
  data,
  onRequestDemo,
}: {
  data: {
    title: string;
    subtitle: string;
    eyeTitle: string;
    eyeDesc: string;
    walletTitle: string;
    walletDesc: string;
    marketplaceTitle: string;
    marketplaceDesc: string;
    aiMapTitle: string;
    aiMapDesc: string;
    revenueTableTitle: string;
    revenueTableRows: Array<{ supplier: string; exposures: string; clicks: string; profit: string }>;
    qualityScoreTitle: string;
    qualityScoreDesc: string;
  };
  onRequestDemo: () => void;
}) {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const widgets = [
    { title: data.eyeTitle, desc: data.eyeDesc, icon: 'eye', status: 'green' },
    { title: data.walletTitle, desc: data.walletDesc, icon: 'wallet' },
    { title: data.marketplaceTitle, desc: data.marketplaceDesc, icon: 'list' },
    { title: data.aiMapTitle, desc: data.aiMapDesc, icon: 'map' },
  ];
  return (
    <section className="landing-dashboard" ref={ref} aria-labelledby="dashboard-heading">
      <h2 id="dashboard-heading">{data.title}</h2>
      <p className="landing-dashboard-subtitle">{data.subtitle}</p>

      <div className="landing-dashboard-widgets">
        {widgets.map((w, i) => (
          <motion.div
            key={w.title}
            className="landing-dashboard-widget glass-card"
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            {w.status === 'green' && <span className="landing-dashboard-status landing-dashboard-status-ok" aria-hidden>●</span>}
            <h4>{w.title}</h4>
            <p>{w.desc}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="landing-dashboard-revenue glass-card"
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: 0.35 }}
      >
        <h3>{data.revenueTableTitle}</h3>
        <div className="landing-dashboard-table-wrap">
          <table className="landing-dashboard-table" role="grid">
            <thead>
              <tr>
                <th scope="col">{data.colSupplier ?? 'Supplier'}</th>
                <th scope="col">{data.colExposures ?? 'Exposures'}</th>
                <th scope="col">{data.colClicks ?? 'Clicks'}</th>
                <th scope="col">{data.colProfit ?? 'Profit'}</th>
              </tr>
            </thead>
            <tbody>
              {data.revenueTableRows.map((row, i) => (
                <tr key={i}>
                  <td data-label={data.colSupplier ?? 'Supplier'}>{row.supplier}</td>
                  <td data-label={data.colExposures ?? 'Exposures'}>{row.exposures}</td>
                  <td data-label={data.colClicks ?? 'Clicks'}>{row.clicks}</td>
                  <td data-label={data.colProfit ?? 'Profit'} className="landing-dashboard-profit">{row.profit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <motion.div
        className="landing-dashboard-quality glass-card"
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: 0.45 }}
      >
        <h4>{data.qualityScoreTitle}</h4>
        <p>{data.qualityScoreDesc}</p>
      </motion.div>

      <motion.div
        className="landing-dashboard-cta"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.3, delay: 0.55 }}
      >
        <button type="button" className="landing-cta" onClick={onRequestDemo}>
          {data.dashboardCta ?? 'Contact us'}
        </button>
      </motion.div>
    </section>
  );
}

/** סעיף משקיעים ושותפים אסטרטגיים – Vision, Problem, Advantage, Market. */
export function InvestorSection({
  data,
  onRequestSummary,
}: {
  data: {
    title: string;
    tagline?: string;
    vision: string;
    problemTitle: string;
    problems: string[];
    advantageTitle: string;
    advantages: string[];
    marketTitle: string;
    marketPoints: string[];
    cta: string;
  };
  onRequestSummary: () => void;
}) {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <section className="landing-investor" ref={ref} aria-labelledby="investor-heading">
      <div className="landing-investor-inner">
        <h2 id="investor-heading" className="landing-investor-title">{data.title}</h2>
        {data.tagline && <p className="landing-investor-tagline">{data.tagline}</p>}
        <motion.p
          className="landing-investor-vision"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
        >
          {data.vision}
        </motion.p>

        <motion.div
          className="landing-investor-block"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h3>{data.problemTitle}</h3>
          <ul>
            {data.problems.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          className="landing-investor-block glass-card"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h3>{data.advantageTitle}</h3>
          <ul>
            {data.advantages.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          className="landing-investor-block"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <h3>{data.marketTitle}</h3>
          <ul>
            {data.marketPoints.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          className="landing-investor-cta"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.3, delay: 0.45 }}
        >
          <button type="button" className="landing-cta" onClick={onRequestSummary}>
            {data.cta}
          </button>
        </motion.div>
      </div>
    </section>
  );
}

/** עמודי התווך – אנימציית Fade-in מלמטה בגלילה. */
function PillarsSection({
  content,
}: {
  content: { pillarsSectionTitle?: string; pillars: { ceo: { title: string; description: string }; technician: { title: string; description: string }; resident: { title: string; description: string } } };
}) {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <section className="landing-pillars">
      <h2>{content.pillarsSectionTitle ?? 'Core Pillars'}</h2>
      <div className="pillars-grid" ref={ref}>
        {[
          { to: ROUTES.SELECT_BUILDING, ...content.pillars.ceo },
          { to: ROUTES.CONTRACTORS_JOIN, ...content.pillars.technician },
          { to: ROUTES.USER_LOGIN, ...content.pillars.resident },
        ].map((item, i) => (
          <motion.div
            key={item.title}
            custom={i}
            variants={pillarVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
          >
            <Link to={item.to} className="glass-card pillar-card pillar-link">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/**
 * דף נחיתה – Vantera. Dark-Mode Luxury.
 * תמיכה מלאה בעברית/אנגלית – ללא ערבוב שפות.
 */
const Landing: React.FC = () => {
  const appLang = useSelector((state: RootState) => state.settings.language);
  const lang: LangKey = RTL_LANGS.includes(appLang as 'he' | 'ar') || appLang === 'he' ? 'he' : 'en';
  const content = useMemo(() => rawContent[lang] ?? rawContent.he, [lang]);
  const dir = lang === 'he' ? 'rtl' : 'ltr';

  const [demoOpen, setDemoOpen] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [form, setForm] = useState({
    contactName: '',
    companyName: '',
    buildingCount: 1,
    phone: '',
  });
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.3]);

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
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && (data.success || data.message)) {
        setSubmitStatus('success');
        setForm({ contactName: '', companyName: '', buildingCount: 1, phone: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    }
  };

  const closeModal = () => {
    setDemoOpen(false);
    setTimeout(() => setSubmitStatus('idle'), 300);
  };

  return (
    <div className="landing-page" dir={dir} lang={lang === 'he' ? 'he' : 'en'}>
      <SeoHead title={SEO.home.title} description={SEO.home.description} schemaJson={SOFTWARE_APPLICATION_SCHEMA} />
      <div className="landing-page-bg-video" aria-hidden>
        <video
          src={LANDING_VIDEO_SRC}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          title="רקע וידאו – ניטור לווייני ו-AI לבניינים, Vantera"
        />
        <div className="landing-page-bg-overlay" />
      </div>
      <div className="landing-page-content">
      <header className="landing-login-bar" role="banner">
        <div className="landing-nav-inner">
          <SystemStatus />
          <LanguageSwitcher variant="landing" />
          <Link
            to={ROUTES.HOME}
            className="landing-cta"
            aria-label={content.loginCta ?? 'Sign In'}
          >
            {content.loginCta ?? 'Sign In'}
          </Link>
        </div>
      </header>

      <section className="landing-hero">
        <div className="hero-video-overlay" aria-hidden />
        <motion.div className="landing-hero-content" style={{ opacity: heroOpacity }}>
          <h1>{content.hero.title}</h1>
          <p className="hero-subtitle">{content.hero.subtitle}</p>
          {content.hero.subtitleLong && <p className="hero-subtitle-long">{content.hero.subtitleLong}</p>}
          <div className="landing-hero-ctas">
            <button type="button" className="landing-cta" onClick={() => setDemoOpen(true)}>
              {content.hero.cta}
            </button>
            {content.hero.b2bCta && (
              <Link to={ROUTES.COMPANIES_MANAGEMENT} className="landing-cta secondary">
                {content.hero.b2bCta}
              </Link>
            )}
            {content.demoVideo && (
              (() => {
                const demoUrl = (import.meta.env.VITE_DEMO_VIDEO_URL as string) || content.demoVideo?.url;
                return demoUrl ? (
                  <a
                    href={demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="landing-cta secondary"
                  >
                    {content.demoVideo.cta}
                  </a>
                ) : (
                  <Link to={ROUTES.CONTRACTORS_JOIN} className="landing-cta secondary">
                    {content.demoVideo.cta}
                  </Link>
                );
              })()
            )}
          </div>
        </motion.div>
      </section>

      <PillarsSection content={content} />

      {content.salesPitch && content.salesPitch.length > 0 && (
        <SalesPitchSection
          sectionTitle={content.salesPitchSectionTitle}
          items={content.salesPitch}
        />
      )}

      <section className="landing-insights-cta">
        <Link to={ROUTES.LANDING_INSIGHTS} className="glass-card landing-insights-link">
          <h3>{content.insightsPage?.ctaTitle ?? (lang === 'he' ? 'נתונים, השוואות והכנסות' : 'Data, Comparisons & Revenue')}</h3>
          <p>{content.insightsPage?.ctaDesc ?? (lang === 'he' ? 'השוואות טכנולוגיות, סטטיסטיקות, דוחות רווח וכל המידע הטכני – מסודר ומאורגן' : 'Technology comparisons, statistics, profit reports and all technical information – organized and structured')}</p>
          <span className="landing-cta">{content.insightsPage?.ctaLink ?? (lang === 'he' ? 'לכל הנתונים →' : 'View all data →')}</span>
        </Link>
      </section>

      <footer className="landing-footer py-3 text-center text-muted small">
        <Link to={ROUTES.BLOG} className="me-3">{lang === 'he' ? 'בלוג' : 'Blog'}</Link>
        <Link to={ROUTES.PRIVACY_POLICY} className="me-3">מדיניות פרטיות</Link>
        <Link to={ROUTES.TERMS_AND_CONDITIONS}>תנאי שימוש</Link>
      </footer>

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

export { Landing };
export default Landing;
