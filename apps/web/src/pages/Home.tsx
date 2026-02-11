import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ROUTES from '../routs/routes';
import './Home.css';

const Home: React.FC = () => {
  const [showHero, setShowHero] = useState(false);

  const heroUrl = useMemo(
    () => new URL('../assets/rishon-lezion-lobby-hero.png', import.meta.url).href,
    []
  );

  useEffect(() => {
    // Don't auto-load the huge hero image on data-saver / very slow networks.
    const connection = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } })
      .connection;
    const saveData = Boolean(connection?.saveData);
    const effectiveType = connection?.effectiveType ?? '';
    const verySlow = effectiveType.includes('2g');

    if (saveData || verySlow) return;

    // Prefer idle time so first paint happens fast.
    const ric = (window as unknown as { requestIdleCallback?: (fn: () => void) => number }).requestIdleCallback;
    const cic = (window as unknown as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback;

    if (ric) {
      const idleId = ric(() => setShowHero(true));
      return () => cic?.(idleId);
    }

    const timeoutId = window.setTimeout(() => setShowHero(true), 250);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <div
      className="home-wrapper"
      style={
        showHero
          ? {
              backgroundImage: `linear-gradient(135deg, rgba(15, 23, 42, 0.55), rgba(2, 6, 23, 0.35)), url(${heroUrl})`,
            }
          : undefined
      }
    >
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
  );
};

export default Home;
