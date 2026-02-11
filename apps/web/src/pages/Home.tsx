import React from 'react';
import { Link } from 'react-router-dom';
import ROUTES from '../routs/routes';
import SeoHead from '../components/SeoHead';
import { SEO, SOFTWARE_APPLICATION_SCHEMA } from '../content/seo';
import './Home.css';

const HOME_VIDEO_SRC = 'https://res.cloudinary.com/dora8sxcb/video/upload/v1770849384/motion2Fast_Cinematic.mp4_oorj6z.mp4';

const Home: React.FC = () => {
  return (
    <>
      <SeoHead title={SEO.home.title} description={SEO.home.description} schemaJson={SOFTWARE_APPLICATION_SCHEMA} />
      <div className="home-wrapper">
        <div className="home-bg-video" aria-hidden>
          <video
            src={HOME_VIDEO_SRC}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
          />
          <div className="home-bg-overlay" />
        </div>
        <div className="home-overlay">
        <div className="home-content">
          <h1 className="home-title">אחזקת מבנים חכמה ומקצועית</h1>
          <p className="home-subtitle">שירות מתקדם לניהול, גבייה ותחזוקה של בניינים</p>
          <div className="home-cta">
            <Link to={ROUTES.LANDING} className="home-btn btn btn-primary btn-lg">
              לדף הנחיתה
            </Link>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default Home;
