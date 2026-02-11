import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ROUTES from '../routs/routes';
import SeoHead from '../components/SeoHead';
import { SEO, SOFTWARE_APPLICATION_SCHEMA } from '../content/seo';
import { HOME_VIDEO_SRC } from '../config/media';
import './Home.css';

const Home: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {});
    }
  }, []);

  return (
    <>
      <SeoHead title={SEO.home.title} description={SEO.home.description} schemaJson={SOFTWARE_APPLICATION_SCHEMA} />
      <div className="home-wrapper">
        <div className="home-bg-video" aria-hidden>
          <video
            ref={videoRef}
            src={HOME_VIDEO_SRC}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            title="רקע וידאו – ניהול נכסים חכם, Vantera"
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
