import React from 'react';
import { Link } from 'react-router-dom';
import ROUTES from '../routs/routes';
import SeoHead from '../components/SeoHead';
import { SEO } from '../content/seo';
import landingContent from '../content/landing-pages.json';
import './Landing.css';

type LandingTechnicianContent = {
  technicianPage: {
    title: string;
    subtitle: string;
    blocks: { heading: string; body: string }[];
    cta: string;
    videoPlaceholder?: string;
  };
  backToLanding?: string;
};

const content = (landingContent as Record<string, LandingTechnicianContent>).he;

/**
 * דף הנחיתה – הטכנאי. Zero Friction, Magic Link, דיווח קולי.
 */
const LandingTechnician: React.FC = () => {
  return (
    <div className="landing-page">
      <SeoHead title={SEO.contractors.title} description={SEO.contractors.description} />
      <header className="landing-login-bar">
        <Link to={ROUTES.LANDING} className="landing-cta">{content.backToLanding ?? 'Back to Landing'}</Link>
      </header>

      <section className="landing-hero">
        <h1>{content.technicianPage.title}</h1>
        <p className="hero-subtitle">{content.technicianPage.subtitle}</p>
      </section>

      <section className="landing-pillars">
        <div className="pillars-grid pillars-grid--narrow">
          {content.technicianPage.blocks.map((block, i) => (
            <div key={i} className="glass-card pillar-card text-center">
              <h3>{block.heading}</h3>
              <p>{block.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 text-center">
          <span className="landing-cta landing-cta--static">{content.technicianPage.cta}</span>
          <p className="text-muted small mt-2 landing-video-placeholder">
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
