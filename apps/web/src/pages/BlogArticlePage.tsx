/**
 * דף מאמר בודד – תוכן סטטי לפי slug.
 */
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import ROUTES from '../routs/routes';
import SeoHead from '../components/SeoHead';

const ARTICLES: Record<string, { title: string; description: string; body: string }> = {
  'revenue-share': {
    title: 'מעבר לתחזוקה: איך להפוך את בניין המגורים למקור הכנסה פסיבית?',
    description: 'מודל Revenue Share של Vantera – איך הבניין ממומן עצמית.',
    body: `מודל Revenue Share של Vantera מחולל מהפכה בניהול בניינים. במקום שהבניין יהיה רק הוצאה – הוא הופך למקור הכנסה פסיבית.

על כל קריאת שירות שהדייר מזמין דרך האפליקציה, ועל כל פרסום של קבלן בבניין, חברת הניהול והוועד מקבלים אחוז. התוצאה: הבניין מממן את עצמו ואף מייצר רווח.

זה לא מדע בדיוני – זה כבר קורה בבניינים שמנהלים עם Vantera.`,
  },
  'satellite-ai': {
    title: 'עידן הלוויין בנדל"ן: כך AI וניטור מהחלל מונעים את הנזק הבא בבניין',
    description: 'ניטור לווייני ו-AI שמתריעים על דליפות ותקלות.',
    body: `הטכנולוגיה שיכולה לחסוך לכם עשרות אלפי שקלים בתקלות נפץ – כבר כאן.

Vantera משלבת ניטור לווייני עם בינה מלאכותית כדי לזהות שינויים בגגות, בתשתיות ובסביבת הבניין – לעיתים לפני שהדייר אפילו שם לב.

זיהוי מוקדם של נזילה, סדיקה או התדרדרות משמעותי חיסכון בתיקוני חירום יקרים.`,
  },
  'contractor-guide': {
    title: 'מדריך לקבלן המודרני: איך לקצר את זמן ההגעה ללקוח ב-70%',
    description: 'GPS, מפתח דיגיטלי וכניסה חכמה – הכל בדקה.',
    body: `Pro-Radar של Vantera מציג לדיירים את הקבלנים הקרובים אליהם על המפה – בזמן אמת.

הקבלן מקבל "פינג" לנייד, מאשר, ומקבל מפתח דיגיטלי זמני לבניין. בלי להמתין לשומר, בלי תיאומים. הדייר רואה את הקבלן בדרך ומקבל שירות תוך דקות.

זה הזמן להצטרף לנבחרת הספקים המורשים של Vantera.`,
  },
};

const BlogArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? ARTICLES[slug] : null;

  if (!article) {
    return (
      <div style={{ padding: '3rem', direction: 'rtl', textAlign: 'center' }}>
        <h2>מאמר לא נמצא</h2>
        <Link to={ROUTES.BLOG}>חזרה לבלוג</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', direction: 'rtl', padding: '3rem 1rem', backgroundColor: '#fff' }}>
      <SeoHead title={article.title} description={article.description} />
      <article className="container" style={{ maxWidth: '720px' }}>
        <Link to={ROUTES.BLOG} className="d-inline-block mb-3 text-muted small">
          ← חזרה לבלוג
        </Link>
        <h1 className="mb-4">{article.title}</h1>
        <div style={{ whiteSpace: 'pre-line' }}>{article.body}</div>
        <p className="mt-5">
          <Link to={ROUTES.LANDING} className="btn btn-primary">
            גלו את Vantera
          </Link>
        </p>
      </article>
    </div>
  );
};

export default BlogArticlePage;
