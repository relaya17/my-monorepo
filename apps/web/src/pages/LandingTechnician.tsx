import React from 'react';
import { Link } from 'react-router-dom';
import ROUTES from '../routs/routes';
import landingContent from '../content/landing-pages.json';
import './Landing.css';

const content = landingContent as {
  technicianPage: {
    title: string;
    subtitle: string;
    blocks: { heading: string; body: string }[];
    cta: string;
    videoPlaceholder?: string;
  };
  backToLanding?: string;
};

/**
 * דף הנחיתה – הטכנאי. Zero Friction, Magic Link, דיווח קולי.
 */
const LandingTechnician: React.FC = () => {
  return (
    <div className="landing-page">
      <header className="landing-login-bar">
        <Link to={ROUTES.LANDING} className="landing-cta">{content.backToLanding ?? 'Back to Landing'}</Link>
      </header>

      <section className="landing-hero">
        <h1>{content.technicianPage.title}</h1>
        <p className="hero-subtitle">{content.technicianPage.subtitle}</p>
      </section>

      <section className="landing-pillars">
        <div className="pillars-grid" style={{ maxWidth: 720, margin: '0 auto' }}>
          {content.technicianPage.blocks.map((block, i) => (
            <div key={i} className="glass-card pillar-card" style={{ textAlign: 'center' }}>
              <h3>{block.heading}</h3>
              <p>{block.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-3" style={{ textAlign: 'center' }}>
          <span className="landing-cta" style={{ cursor: 'default' }}>{content.technicianPage.cta}</span>
          <p className="text-muted small mt-2" style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
            ({content.technicianPage.videoPlaceholder ?? 'Demo video will appear here'})
          </p>
        </div>
      </section>

      <section className="landing-technician">
        <div className="mockup-placeholder" aria-hidden>
          [ Video: Technician voice report → Inventory: +1 Valve ]
        </div>
      </section>
    </div>
  );
};

export default LandingTechnician;
