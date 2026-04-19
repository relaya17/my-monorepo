import React from 'react';
import { Link } from 'react-router-dom';
import ROUTES from '../routs/routes';
import landingContent from '../content/landing-pages.json';
import './Landing.css';

type LandingResidentContent = {
  residentPage: {
    title: string;
    subtitle: string;
    blocks: { heading: string; body: string }[];
    cta: string;
    trustBadge: string;
  };
  backToLanding?: string;
};

const content = (landingContent as Record<string, LandingResidentContent>).he;

/**
 * TrustBadge – Verified by Vantera AI
 */
const TrustBadge: React.FC = () => (
  <div className="trust-badge glass-card trust-badge--inline">
    <span className="trust-badge--checkmark" aria-hidden>✓</span>
    <span>{content.residentPage.trustBadge}</span>
  </div>
);

/**
 * דף הנחיתה – הדייר. שקיפות, AAA, דיווח בקליק.
 */
const LandingResident: React.FC = () => {
  return (
    <div className="landing-page">
      <header className="landing-login-bar">
        <Link to={ROUTES.LANDING} className="landing-cta">{content.backToLanding ?? 'Back to Landing'}</Link>
      </header>

      <section className="landing-hero">
        <TrustBadge />
        <h1>{content.residentPage.title}</h1>
        <p className="hero-subtitle">{content.residentPage.subtitle}</p>
      </section>

      <section className="landing-pillars">
        <div className="pillars-grid pillars-grid--narrow">
          {content.residentPage.blocks.map((block, i) => (
            <div key={i} className="glass-card pillar-card text-center">
              <h3>{block.heading}</h3>
              <p>{block.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 text-center">
          <Link to={ROUTES.USER_LOGIN} className="landing-cta">{content.residentPage.cta}</Link>
        </div>
      </section>
    </div>
  );
};

export default LandingResident;
