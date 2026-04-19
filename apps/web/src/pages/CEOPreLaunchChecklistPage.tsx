/**
 * צ'קליסט CEO לפני עלייה לאוויר – SSL, פרטיות, מהירות.
 * מקור: docs/vantera/CEO_VERIFICATION_CHECKLIST.md
 */
import React from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import ROUTES from '../routs/routes';

const PreLaunchChecklistPage: React.FC = () => {
  return (
    <>
      <SeoHead title="צ'קליסט לפני עלייה" description="וידוא אבטחה, פרטיות ומהירות לפני השקה" noIndex />
      <div style={{ maxWidth: 640, margin: '2rem auto', padding: '0 1rem', direction: 'rtl' }}>
        <div className="card shadow-sm">
          <div className="card-header bg-primary text-white">
            <strong>צ'קליסט לפני עלייה לאוויר</strong>
          </div>
          <div className="card-body">
            <p className="text-muted small mb-4">מתוך docs/vantera/CEO_VERIFICATION_CHECKLIST.md – שלוש בדיקות חובה לפני השקה.</p>

            <div className="mb-4">
              <div className="d-flex align-items-start gap-2 mb-2">
                <span className="badge bg-success">1</span>
                <div>
                  <strong>אבטחה – SSL (המנעול הירוק)</strong>
                  <p className="mb-0 small text-muted">
                    לבדוק בדפדפן: האם כתובת האתר מתחילה ב־https:// והאם יש אייקון מנעול ירוק בסרגל הכתובת?
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="d-flex align-items-start gap-2 mb-2">
                <span className="badge bg-success">2</span>
                <div>
                  <strong>פרטיות – טשטוש פנים</strong>
                  <p className="mb-0 small text-muted">
                    AI Vision מטשטש פנים בצילומי CCTV לפני עיבוד ואחסון (GDPR). קוד: visionService.processFrame – TODO: Anonymize faces.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="d-flex align-items-start gap-2 mb-2">
                <span className="badge bg-success">3</span>
                <div>
                  <strong>מהירות – דף נחיתה &lt;2 שניות</strong>
                  <p className="mb-0 small text-muted">
                    לפתוח DevTools → Network, לרענן את דף הנחיתה (/ או /landing), ולבדוק: זמן טעינה עד Interactive או LCP פחות מ־2 שניות.
                  </p>
                </div>
              </div>
            </div>

            <hr />
            <p className="small mb-0">
              <strong>מסמך מלא:</strong> docs/vantera/CEO_VERIFICATION_CHECKLIST.md ב־repository. כולל ארבעת מוקדי האימות (Peacekeeper, CEO View, Technician Evidence, Vision).
            </p>
          </div>
          <div className="card-footer">
            <Link to={ROUTES.SUPER_ADMIN_DASHBOARD} className="btn btn-outline-primary btn-sm">
              <i className="fas fa-arrow-right me-1" aria-hidden />
              חזרה ללוח CEO
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default PreLaunchChecklistPage;
