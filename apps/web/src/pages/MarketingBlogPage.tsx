/**
 * בלוג שיווקי – מאמרים לסמכות דומיין (SEO_CHECKLIST §7).
 */
import React from 'react';
import { Link } from 'react-router-dom';
import ROUTES from '../routs/routes';
import SeoHead from '../components/SeoHead';
import { SEO } from '../content/seo';

const ARTICLES = [
  {
    slug: 'revenue-share',
    title: 'מעבר לתחזוקה: איך להפוך את בניין המגורים למקור הכנסה פסיבית?',
    excerpt: 'מודל Revenue Share של Vantera – איך הבניין ממומן עצמית דרך פרסום ושירותי קבלנים.',
  },
  {
    slug: 'satellite-ai',
    title: 'עידן הלוויין בנדל"ן: כך AI וניטור מהחלל מונעים את הנזק הבא בבניין',
    excerpt: 'טכנולוגיית ניטור לווייני ו-AI שמתריעים על דליפות ותקלות לפני שהדייר מתקשר.',
  },
  {
    slug: 'contractor-guide',
    title: 'מדריך לקבלן המודרני: איך לקצר את זמן ההגעה ללקוח ב-70% בעזרת GPS ומפתחות דיגיטליים',
    excerpt: 'Pro-Radar, מפתח דיגיטלי וכניסה חכמה – הכל בדקה אחת.',
  },
];

const MarketingBlogPage: React.FC = () => (
  <div style={{ minHeight: '100vh', direction: 'rtl', padding: '3rem 1rem', backgroundColor: '#f8f9fa' }}>
    <SeoHead
      title={`בלוג Vantera | ${SEO.home.title}`}
      description="מאמרים על ניהול נכסים חכם, Revenue Share, ניטור לווייני וטכנולוגיה לבניינים."
    />
    <div className="container" style={{ maxWidth: '800px' }}>
      <h1 className="text-center mb-4">
        <i className="fas fa-book-open me-2" aria-hidden="true" />
        בלוג Vantera
      </h1>
      <p className="text-center text-muted mb-5">
        מאמרים לסמכות דומיין – ניהול נכסים, טכנולוגיה ורווחיות
      </p>
      <div className="row g-4">
        {ARTICLES.map((a) => (
          <div key={a.slug} className="col-12">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h3 className="card-title h5">{a.title}</h3>
                <p className="card-text text-muted">{a.excerpt}</p>
                <Link to={`/blog/${a.slug}`} className="btn btn-outline-primary btn-sm">
                  קרא עוד
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-center mt-4">
        <Link to={ROUTES.LANDING} className="btn btn-link">
          ← חזרה לדף הנחיתה
        </Link>
      </p>
    </div>
  </div>
);

export default MarketingBlogPage;
