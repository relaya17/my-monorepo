import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ROUTES from '../routs/routes';
import SeoHead from '../components/SeoHead';
import { SEO } from '../content/seo';
import './Landing.css';
import './LandingTechnician.css';

const FEATURES = [
  {
    icon: '📡',
    title: 'Pro-Radar – GPS זמינות',
    body: 'מופיעים ברדאר דיירים רק כשאתם מקוון. לא צריך לפרסם – הלקוחות מגיעים אליכם.',
    route: ROUTES.PRO_RADAR,
    cta: 'הצג רדאר',
  },
  {
    icon: '🔑',
    title: 'מפתח דיגיטלי',
    body: 'קוד כניסה חד-פעמי לדייר – ללא מגע, ללא מפתח פיזי. חוויה מ-2026.',
    route: ROUTES.DIGITAL_KEY,
    cta: 'נסה עכשיו',
  },
  {
    icon: '🎤',
    title: 'קול לתובנה',
    body: 'דווח תקלה בדיבור – AI ממיר לקריאת שירות מובנית. חסוך 3 דקות בכל קריאה.',
    route: ROUTES.VOICE_INSIGHT,
    cta: 'נסה דיווח קולי',
  },
  {
    icon: '🛡️',
    title: 'Escrow – תשלום מאובטח',
    body: '70% מהסכום מועבר אליכם ישירות עם אישור הדייר. אפס אפשרות לעיכוב.',
    route: ROUTES.SAFE_ZONE,
    cta: 'פרטי תשלום',
  },
  {
    icon: '🗺️',
    title: 'תוכניות הבניין',
    body: 'גישה מיידית לתוכניות קומות דיגיטליות מהשטח – ללא שיחות ולא PDF בוואטסאפ.',
    route: ROUTES.BLUEPRINT,
    cta: 'צפה בתוכנית',
  },
  {
    icon: '⭐',
    title: 'דירוג מאומת',
    body: 'כל עבודה שמסתיימת בהצלחה מוסיפה לדירוג הגלובלי שלכם. מעל 4.5 = בונוס.',
    route: ROUTES.CONTRACTOR_DASHBOARD,
    cta: 'לוח בקרה',
  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'נרשמים', desc: 'מלאו פרטים, בחרו התמחות, מקבלים אישור תוך 24 שעות.' },
  { step: '02', title: 'מקוון / לא מקוון', desc: 'לחצו "הפעל" בלוח הבקרה – אתם מופיעים ברדאר הדיירים.' },
  { step: '03', title: 'עבודה + תשלום', desc: 'דייר מזמין, אתם מאשרים, מסיימים – Escrow מעביר 70% ישירות לחשבון.' },
];

const fadeUp = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0 } };

/**
 * דף הנחיתה – הקבלן / הטכנאי.
 * מציג: Pro-Radar, Digital Key, Voice-to-Insight, Escrow, Blueprint, דירוג.
 */
const LandingTechnician: React.FC = () => {
  return (
    <div className="landing-page lt-page" dir="rtl">
      <SeoHead title={SEO.contractors.title} description={SEO.contractors.description} />

      {/* Nav bar */}
      <header className="landing-login-bar">
        <Link to={ROUTES.LANDING} className="landing-cta secondary lt-back">← חזרה</Link>
        <Link to={ROUTES.CONTRACTOR_DASHBOARD} className="landing-cta lt-nav-cta">לוח בקרה קבלן</Link>
      </header>

      {/* Hero */}
      <section className="landing-hero lt-hero">
        <motion.div
          className="landing-hero-content"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6 }}
        >
          <p className="lt-eyebrow">Vantera — לבעלי מקצוע</p>
          <h1 className="lt-hero-title">
            עבודות. תשלום. בלי בינוניות.
          </h1>
          <p className="hero-subtitle lt-hero-subtitle">
            הצטרפו לרשת הקבלנים של Vantera — מקבלים 70% מכל עבודה,<br />
            גישה לטכנולוגיית GPS + AI, וביקורות מאומתות שבונות לכם שם.
          </p>
          <div className="landing-hero-ctas lt-hero-ctas">
            <Link to={ROUTES.CONTRACTORS_JOIN} className="landing-cta primary">
              הצטרף כקבלן — חינם
            </Link>
            <Link to={ROUTES.CONTRACTOR_DASHBOARD} className="landing-cta secondary">
              כבר רשום? לוח בקרה →
            </Link>
          </div>
        </motion.div>

        {/* Earning badge */}
        <motion.div
          className="glass-card lt-earning-badge"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.3 }}
          aria-label="הכנסה לדוגמה"
        >
          <span className="lt-earning-label">ממוצע חודשי לקבלן מקוון</span>
          <span className="lt-earning-amount">₪8,200</span>
          <span className="lt-earning-note">70% מכל עבודה • אפס עמלת סוכן</span>
        </motion.div>
      </section>

      {/* How it works */}
      <section className="lt-how-section" aria-labelledby="lt-how-title">
        <h2 id="lt-how-title" className="lt-section-title">איך זה עובד?</h2>
        <div className="lt-how-grid">
          {HOW_IT_WORKS.map((step) => (
            <motion.div
              key={step.step}
              className="glass-card lt-how-card"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="lt-step-number" aria-hidden="true">{step.step}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Feature grid */}
      <section className="lt-features-section" aria-labelledby="lt-features-title">
        <h2 id="lt-features-title" className="lt-section-title">הכלים שלכם</h2>
        <div className="pillars-grid lt-features-grid">
          {FEATURES.map((f) => (
            <motion.article
              key={f.title}
              className="glass-card lt-feature-card"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
            >
              <div className="lt-feature-icon" aria-hidden="true">{f.icon}</div>
              <h3 className="lt-feature-title">{f.title}</h3>
              <p className="lt-feature-body">{f.body}</p>
              <Link to={f.route} className="landing-cta secondary lt-feature-cta">
                {f.cta} →
              </Link>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Earnings model */}
      <section className="lt-earnings-section" aria-labelledby="lt-earnings-title">
        <h2 id="lt-earnings-title" className="lt-section-title">מודל ההכנסות</h2>
        <div className="lt-earnings-table-wrapper">
          <table className="lt-earnings-table">
            <caption className="visually-hidden">חלוקת תשלומים לעבודה</caption>
            <thead>
              <tr>
                <th scope="col">גורם</th>
                <th scope="col">אחוז</th>
                <th scope="col">לדוגמה – עבודה ₪1,000</th>
              </tr>
            </thead>
            <tbody>
              <tr className="lt-row-you">
                <td>אתם (הקבלן)</td>
                <td><strong>70%</strong></td>
                <td><strong>₪700</strong></td>
              </tr>
              <tr>
                <td>Vantera (פלטפורמה)</td>
                <td>20%</td>
                <td>₪200</td>
              </tr>
              <tr>
                <td>נאמנות הבניין</td>
                <td>10%</td>
                <td>₪100</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="lt-earnings-note">* תשלום מועבר לחשבון Stripe Connect שלכם תוך 2–5 ימי עסקים</p>
      </section>

      {/* Final CTA */}
      <section className="lt-final-cta" aria-labelledby="lt-cta-title">
        <motion.div
          className="glass-card lt-cta-card"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 id="lt-cta-title">מוכנים להתחיל?</h2>
          <p>הרשמה חינמית. אין עמלת כניסה. מתחילים לקבל עבודות ביום הראשון.</p>
          <div className="landing-hero-ctas">
            <Link to={ROUTES.CONTRACTORS_JOIN} className="landing-cta primary">
              הצטרף עכשיו — חינם
            </Link>
            <Link to={ROUTES.LANDING} className="landing-cta secondary">
              חזרה לדף הבית
            </Link>
          </div>
        </motion.div>
      </section>

      <footer className="landing-footer py-3 text-center text-muted small">
        <Link to={ROUTES.PRIVACY_POLICY} className="me-3">מדיניות פרטיות</Link>
        <Link to={ROUTES.TERMS_AND_CONDITIONS}>תנאי שימוש</Link>
      </footer>
    </div>
  );
};

export default LandingTechnician;

