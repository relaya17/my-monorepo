import React, { useEffect, useRef, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ROUTES from '../routs/routes';
import SeoHead from '../components/SeoHead';
import { SEO, SOFTWARE_APPLICATION_SCHEMA } from '../content/seo';
import { HOME_VIDEO_SRC } from '../config/media';
import './Home.css';

const PRAISE_PHRASES = [
  'דור הבא של ניהול ואחזקה דיגיטלית',
  'ניטור AI + לוויין – טכנולוגיה שלא תמצא אצל אחרים',
  'אבטחה ברמת בנק – הצפנה ושקיפות מלאה',
  'מודל Revenue Share – הבניין ממומן ומייצר רווח',
  'Pro-Radar – קבלן קרוב אליך כמו Uber',
];

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const Home: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const noMotion = useMemo(() => prefersReducedMotion(), []);
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (noMotion) return;
    const id = setInterval(() => {
      setPhraseIndex((i) => (i + 1) % PRAISE_PHRASES.length);
    }, 3500);
    return () => clearInterval(id);
  }, [noMotion]);

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
            <motion.h1
              className="home-title"
              initial={noMotion ? false : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={noMotion ? { duration: 0 } : { duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
            >
              <span className="home-title-main">VANTERA</span>
              <span className="home-title-tail">AI</span>
            </motion.h1>
            <div className="home-subtitle-wrap">
              <AnimatePresence mode="wait">
                <motion.p
                  key={phraseIndex}
                  className="home-subtitle home-subtitle-praise"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                >
                  {PRAISE_PHRASES[phraseIndex]}
                </motion.p>
              </AnimatePresence>
              <span className="home-subtitle-underline" aria-hidden="true" />
            <p className="home-subtitle home-subtitle-services">דור הבא של ניהול ואחזקה דיגיטלית</p>
          </div>
            <div className="home-cta home-cta-bottom">
              <Link
                to={ROUTES.LANDING}
                className="home-btn btn btn-primary btn-lg home-btn-cta"
                aria-label="חברות ומשקיעים בלבד – גילוי ההזדמנות"
              >
                חברות ומשקיעים בלבד →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
