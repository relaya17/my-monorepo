import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ROUTES from '../routs/routes';
import SeoHead from '../components/SeoHead';
import './Landing.css';
import './LandingResident.css';

const FEATURES = [
  {
    icon: '🗳️',
    title: 'הצבעות ועד',
    body: 'הצביעו על הצעות, ראו תוצאות בזמן אמת. שקיפות מלאה לכל דיירי הבניין.',
    route: ROUTES.VOTING,
    cta: 'להצבעות',
  },
  {
    icon: '🏘️',
    title: 'קיר קהילתי',
    body: 'שתפו, שאלו, הגיבו. פורום פנימי לדיירים – ללא קבוצות ווטסאפ.',
    route: ROUTES.COMMUNITY_WALL,
    cta: 'לקיר הקהילה',
  },
  {
    icon: '🛡️',
    title: 'ליווי בטוח',
    body: 'הפעילו בקשת ליווי בשניה אחת. מאבטח מקבל התראה ועוקב עד שאתם בטוחים.',
    route: ROUTES.SAFE_ZONE,
    cta: 'הפעל ליווי',
  },
  {
    icon: '🔑',
    title: 'מפתח דיגיטלי',
    body: 'קוד כניסה חד-פעמי עם תפוגה אוטומטית. פותחים שער לאורח – ללא מפתח פיזי.',
    route: ROUTES.DIGITAL_KEY,
    cta: 'צור מפתח',
  },
  {
    icon: '🔧',
    title: 'קריאות תיקון',
    body: 'דווחו תקלה בקליק. עקבו אחרי הסטטוס בזמן אמת עד לסגירה.',
    route: ROUTES.REPORT_FAULT,
    cta: 'דווח תקלה',
  },
  {
    icon: '💳',
    title: 'ועד חכם – תשלום מאובטח',
    body: 'ועד הבניין מפרסם, אתם מאשרים, Escrow מחזיק עד להשלמה. לא יותר כסף שנעלם.',
    route: ROUTES.PAYMENT_MANAGEMENT,
    cta: 'לניהול תשלומים',
  },
  {
    icon: '🗺️',
    title: 'תוכניות הבניין',
    body: 'גישה מיידית לתוכניות קומות דיגיטליות. מצאו פיפ, דוד, מסלול חשמל.',
    route: ROUTES.BLUEPRINT,
    cta: 'צפה בתוכנית',
  },
  {
    icon: '📊',
    title: 'שקיפות AAA',
    body: 'כל פעולה בבניין מתועדת בשרשרת hash. פרטיות + שקיפות – לא סתירה.',
    route: ROUTES.RESIDENT_HOME,
    cta: 'לדשבורד',
  },
];

const TRUST_POINTS = [
  'הצפנה E2E לכל התקשורת',
  'אפס גישת צד שלישי לנתונים אישיים',
  'דירוג אבטחה 9.8/10',
  'תואם GDPR ודין הגנת הפרטיות הישראלי',
];

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };

/**
 * דף הנחיתה – הדייר. כל הפיצ'רים הרלוונטיים עם קישורים אמיתיים.
 */
const LandingResident: React.FC = () => {
  return (
    <div className="landing-page lr-page" dir="rtl">
      <SeoHead
        title="Vantera לדיירים – ניהול בניין חכם, שקיפות מלאה"
        description="הצביעו, דווחו תקלות, שלמו בבטחה, קבלו ליווי – הכל מהנייד. Vantera הוא הדשבורד הראשון שבאמת עובד לדיירים."
      />

      <header className="landing-login-bar">
        <Link to={ROUTES.LANDING} className="landing-cta secondary lr-back">← חזרה</Link>
        <Link to={ROUTES.USER_LOGIN} className="landing-cta lr-nav-cta">כניסה לדיירים</Link>
      </header>

      {/* Hero */}
      <section className="landing-hero lr-hero">
        <motion.div
          className="landing-hero-content"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.55 }}
        >
          <div className="trust-badge glass-card trust-badge--inline lr-trust-badge">
            <span className="trust-badge--checkmark" aria-hidden="true">✓</span>
            <span>מאומת על ידי Vantera AI · אבטחה 9.8/10</span>
          </div>
          <h1 className="lr-hero-title">
            הבניין שלכם.<br />סוף סוף מנוהל נכון.
          </h1>
          <p className="hero-subtitle lr-hero-subtitle">
            הצביעו, דווחו תקלות, שלמו בבטחה, קבלו ליווי ותפעלו מפתח דיגיטלי –<br />
            הכל מהנייד, בפחות מדקה.
          </p>
          <div className="landing-hero-ctas">
            <Link to={ROUTES.USER_LOGIN} className="landing-cta primary">כניסה לדיירים</Link>
            <Link to={ROUTES.SIGN_UP} className="landing-cta secondary">הצטרפות חינמית</Link>
          </div>
        </motion.div>
      </section>

      {/* Features grid */}
      <section className="lr-features-section" aria-labelledby="lr-features-title">
        <h2 id="lr-features-title" className="lr-section-title">מה תמצאו בפנים?</h2>
        <div className="pillars-grid lr-features-grid">
          {FEATURES.map((f, i) => (
            <motion.article
              key={f.title}
              className="glass-card lr-feature-card"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <div className="lr-feature-icon" aria-hidden="true">{f.icon}</div>
              <h3 className="lr-feature-title">{f.title}</h3>
              <p className="lr-feature-body">{f.body}</p>
              <Link to={f.route} className="landing-cta secondary lr-feature-cta">
                {f.cta} →
              </Link>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Trust section */}
      <section className="lr-trust-section" aria-labelledby="lr-trust-title">
        <motion.div
          className="glass-card lr-trust-card"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 id="lr-trust-title" className="lr-section-title">הפרטיות שלכם – לא למכירה</h2>
          <ul className="lr-trust-list" role="list">
            {TRUST_POINTS.map((point) => (
              <li key={point} className="lr-trust-item">
                <span className="lr-trust-check" aria-hidden="true">✓</span>
                {point}
              </li>
            ))}
          </ul>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="lr-final-cta">
        <motion.div
          className="glass-card lr-cta-card"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2>מוכנים? הדשבורד ממתין.</h2>
          <p>הרשמה בחינם · פעיל ב-30 שניות · אין כרטיס אשראי</p>
          <div className="landing-hero-ctas">
            <Link to={ROUTES.SIGN_UP} className="landing-cta primary">הצטרפו עכשיו – חינם</Link>
            <Link to={ROUTES.USER_LOGIN} className="landing-cta secondary">כבר רשום? כניסה</Link>
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

export default LandingResident;

