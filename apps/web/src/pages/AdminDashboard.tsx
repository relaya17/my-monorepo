import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ROUTES from '../routs/routes';
import { safeGetItem, safeRemoveItem } from '../utils/safeStorage';
import { buildingLabel, getBuildingId } from '../api';
import AINotifications from '../components/AINotifications';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [adminUsername, setAdminUsername] = useState<string>('');
  const [adminRole, setAdminRole] = useState<string>('');
  const [currentBuildingId, setCurrentBuildingId] = useState<string>(getBuildingId());

  useEffect(() => {
    const isLoggedIn = safeGetItem('isAdminLoggedIn');
    const username = safeGetItem('adminUsername');
    const role = safeGetItem('adminRole');
    if (!isLoggedIn || !username) {
      navigate('/admin-login');
      return;
    }
    setAdminUsername(username);
    setAdminRole(role || '');
    setCurrentBuildingId(getBuildingId());
  }, [navigate]);

  const handleLogout = () => {
    safeRemoveItem('isAdminLoggedIn');
    safeRemoveItem('adminUsername');
    navigate('/admin-login');
  };

  return (
    <div className="admin-dashboard">
      {/* <NavigationBar /> הוסר */}
      <div className="container-fluid p-3 p-md-4">
        <div className="row">
          <div className="col-12 d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 mb-md-5">
            <div className="d-none d-md-block"></div> {/* רווח בצד שמאל */}
            <h1 className="text-center mb-3 mb-md-0 admin-dashboard-title">
              <i className="fas fa-building me-2" aria-hidden="true"></i>
              לוח בקרה למנהל
            </h1>
            <div className="d-flex flex-column flex-md-row align-items-center gap-2 w-100 justify-content-center justify-content-md-end">
              <span className="text-muted text-center text-md-end admin-greeting-text">
                <i className="fas fa-user me-1" aria-hidden="true"></i>
                שלום, {adminUsername}
              </span>
              <div className="admin-actions d-flex flex-wrap justify-content-center justify-content-md-end gap-2">
                <Link
                  to={ROUTES.SELECT_BUILDING}
                  state={{ from: ROUTES.ADMIN_DASHBOARD }}
                  className="btn btn-outline-secondary btn-sm admin-action-btn"
                  title="החלף בניין"
                  aria-label="החלף בניין"
                >
                  <i className="fas fa-building me-1" aria-hidden="true"></i>
                  <span className="admin-action-label d-none d-sm-inline">החלף בניין</span>
                </Link>
                <AINotifications />
                <Link 
                  to={ROUTES.CHANGE_PASSWORD}
                  className="btn btn-outline-primary btn-sm admin-action-btn"
                  title="שינוי סיסמה"
                  aria-label="שינוי סיסמה"
                >
                  <i className="fas fa-key me-1" aria-hidden="true"></i>
                  <span className="admin-action-label d-none d-sm-inline">שינוי סיסמה</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="btn btn-outline-danger btn-sm admin-action-btn"
                  title="התנתק"
                  aria-label="התנתק מהמערכת"
                >
                  <i className="fas fa-sign-out-alt me-1" aria-hidden="true"></i>
                  <span className="admin-action-label d-none d-sm-inline">התנתק</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* אופציה ראשונה: בחירת בניין או המשך ללוח הבקרה */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-primary shadow-sm admin-welcome-card">
              <div className="card-body py-3 py-md-4">
                <h5 className="card-title mb-3 text-center admin-welcome-title">
                  <i className="fas fa-building me-2" aria-hidden="true"></i>
                  במה תרצה להתחיל?
                </h5>
                <div className="d-flex flex-column flex-sm-row justify-content-center align-items-center gap-3">
                  <Link
                    to={ROUTES.SELECT_BUILDING}
                    state={{ from: ROUTES.ADMIN_DASHBOARD }}
                    className="btn btn-primary btn-lg"
                    aria-label="בחר בניין ספציפי"
                  >
                    <i className="fas fa-search me-2" aria-hidden="true"></i>
                    בחירת בניין ספציפי
                  </Link>
                  <span className="text-muted small d-none d-sm-inline" aria-hidden="true">או</span>
                  <div className="text-center">
                    <span className="d-block text-muted small mb-1">עבודה עם הבניין הנוכחי</span>
                    <strong className="d-block admin-current-building">
                      <i className="fas fa-check-circle me-1" aria-hidden="true"></i>
                      {buildingLabel(currentBuildingId)}
                    </strong>
                    <span className="text-muted small">הלוח הבקרה למטה פעיל בהקשר של בניין זה</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-3 g-md-4">
          {/* ניהול משתמשים */}
          <div className="col-12 col-sm-6 col-lg-4 col-xl-3">
            <div className="card h-100 shadow-sm border-0 dashboard-card">
              <div className="card-body text-center d-flex flex-column">
                <div className="mb-3 flex-grow-1 d-flex align-items-center justify-content-center">
                  <i className="fas fa-users dashboard-icon icon-color-blue" aria-hidden="true"></i>
                </div>
                <h5 className="card-title dashboard-card-title">ניהול משתמשים</h5>
                <p className="card-text text-muted mb-3 dashboard-card-text">הוספה, עריכה ומחיקה של משתמשים במערכת</p>
                <Link to={ROUTES.USER_MANAGEMENT} className="btn btn-primary w-100 mt-auto">
                  <i className="fas fa-cog me-2" aria-hidden="true"></i>
                  <span className="d-none d-sm-inline">ניהול משתמשים</span>
                  <span className="d-sm-none">משתמשים</span>
                </Link>
              </div>
            </div>
          </div>

          {/* ניהול תשלומים */}
          <div className="col-12 col-sm-6 col-lg-4 col-xl-3">
            <div className="card h-100 shadow-sm border-0 dashboard-card">
              <div className="card-body text-center d-flex flex-column">
                <div className="mb-3 flex-grow-1 d-flex align-items-center justify-content-center">
                  <i className="fas fa-credit-card dashboard-icon icon-color-green" aria-hidden="true"></i>
                </div>
                <h5 className="card-title dashboard-card-title">ניהול תשלומים</h5>
                <p className="card-text text-muted mb-3 dashboard-card-text">מעקב וניהול תשלומי דיירים</p>
                <Link to={ROUTES.PAYMENT_MANAGEMENT} className="btn btn-success w-100 mt-auto">
                  <i className="fas fa-chart-line me-2" aria-hidden="true"></i>
                  <span className="d-none d-sm-inline">צפייה בתשלומים</span>
                  <span className="d-sm-none">תשלומים</span>
                </Link>
              </div>
            </div>
          </div>

          {/* ניהול דירות */}
          <div className="col-12 col-sm-6 col-lg-4 col-xl-3">
            <div className="card h-100 shadow-sm border-0 dashboard-card">
              <div className="card-body text-center d-flex flex-column">
                <div className="mb-3 flex-grow-1 d-flex align-items-center justify-content-center">
                  <i className="fas fa-home dashboard-icon icon-color-red" aria-hidden="true"></i>
                </div>
                <h5 className="card-title dashboard-card-title">ניהול דירות</h5>
                <p className="card-text text-muted mb-3 dashboard-card-text">הוספה ועריכה של דירות למכירה והשכרה</p>
                <Link to={ROUTES.APARTMENT_MANAGEMENT} className="btn btn-danger w-100 mt-auto">
                  <i className="fas fa-plus me-2" aria-hidden="true"></i>
                  <span className="d-none d-sm-inline">ניהול דירות</span>
                  <span className="d-sm-none">דירות</span>
                </Link>
              </div>
            </div>
          </div>

          {/* דוחות וסטטיסטיקות */}
          <div className="col-12 col-sm-6 col-lg-4 col-xl-3">
            <div className="card h-100 shadow-sm border-0 dashboard-card">
              <div className="card-body text-center d-flex flex-column">
                <div className="mb-3 flex-grow-1 d-flex align-items-center justify-content-center">
                  <i className="fas fa-chart-bar dashboard-icon icon-color-orange" aria-hidden="true"></i>
                </div>
                <h5 className="card-title dashboard-card-title">דוחות וסטטיסטיקה</h5>
                <p className="card-text text-muted mb-3 dashboard-card-text">צפייה בדוחות מפורטים וסטטיסטיקות מערכת</p>
                <Link to={ROUTES.REPORTS_DASHBOARD} className="btn btn-warning w-100 mt-auto">
                  <i className="fas fa-file-alt me-2" aria-hidden="true"></i>
                  <span className="d-none d-sm-inline">דוחות וסטטיסטיקה</span>
                  <span className="d-sm-none">דוחות</span>
                </Link>
              </div>
            </div>
          </div>

          {/* ניהול תחזוקה */}
          <div className="col-12 col-sm-6 col-lg-4 col-xl-3">
            <div className="card h-100 shadow-sm border-0 dashboard-card">
              <div className="card-body text-center d-flex flex-column">
                <div className="mb-3 flex-grow-1 d-flex align-items-center justify-content-center">
                  <i className="fas fa-tools dashboard-icon icon-color-purple" aria-hidden="true"></i>
                </div>
                <h5 className="card-title dashboard-card-title">ניהול תחזוקה</h5>
                <p className="card-text text-muted mb-3 dashboard-card-text">מעקב אחר בקשות תחזוקה ותיקונים</p>
                <Link to={ROUTES.MAINTENANCE_MANAGEMENT} className="btn btn-info w-100 mt-auto">
                  <i className="fas fa-wrench me-2" aria-hidden="true"></i>
                  <span className="d-none d-sm-inline">ניהול תחזוקה</span>
                  <span className="d-sm-none">תחזוקה</span>
                </Link>
              </div>
            </div>
          </div>

          {/* הגדרות מערכת */}
          <div className="col-12 col-sm-6 col-lg-4 col-xl-3">
            <div className="card h-100 shadow-sm border-0 dashboard-card">
              <div className="card-body text-center d-flex flex-column">
                <div className="mb-3 flex-grow-1 d-flex align-items-center justify-content-center">
                  <i className="fas fa-cogs dashboard-icon icon-color-dark" aria-hidden="true"></i>
                </div>
                <h5 className="card-title dashboard-card-title">הגדרות מערכת</h5>
                <p className="card-text text-muted mb-3 dashboard-card-text">הגדרות כלליות של המערכת והרשאות</p>
                <Link
                  to={ROUTES.SYSTEM_SETTINGS}
                  className="btn w-100 mt-auto btn-admin-settings"
                >
                  <i className="fas fa-sliders-h me-2" aria-hidden="true"></i>
                  <span className="d-none d-sm-inline">הגדרות</span>
                  <span className="d-sm-none">הגדרות</span>
                </Link>
              </div>
            </div>
          </div>

          {/* AI Dashboard */}
          <div className="col-12 col-sm-6 col-lg-4 col-xl-3">
            <div className="card h-100 shadow-sm border-0 dashboard-card">
              <div className="card-body text-center d-flex flex-column">
                <div className="mb-3 flex-grow-1 d-flex align-items-center justify-content-center">
                  <i className="fas fa-brain dashboard-icon icon-color-pink" aria-hidden="true"></i>
                </div>
                <h5 className="card-title dashboard-card-title">AI חכם</h5>
                <p className="card-text text-muted mb-3 dashboard-card-text">ניתוח מתקדם וקבלת החלטות מבוססות נתונים</p>
                <Link to={ROUTES.AI_DASHBOARD} className="btn btn-danger w-100 mt-auto">
                  <i className="fas fa-chart-network me-2" aria-hidden="true"></i>
                  <span className="d-none d-sm-inline">דשבורד AI</span>
                  <span className="d-sm-none">AI</span>
                </Link>
              </div>
            </div>
          </div>

          {/* חוזים ומכתבים */}
          <div className="col-12 col-sm-6 col-lg-4 col-xl-3">
            <div className="card h-100 shadow-sm border-0 dashboard-card">
              <div className="card-body text-center d-flex flex-column">
                <div className="mb-3 flex-grow-1 d-flex align-items-center justify-content-center">
                  <i className="fas fa-file-contract dashboard-icon icon-color-teal" aria-hidden="true"></i>
                </div>
                <h5 className="card-title dashboard-card-title">חוזים ומכתבים</h5>
                <p className="card-text text-muted mb-3 dashboard-card-text">תבניות חוזים תואמי ועד בית, מכתב נזק, פיגורי תשלום ומחדלים</p>
                <Link to={ROUTES.CONTRACTS_AND_LETTERS} className="btn w-100 mt-auto btn-admin-contracts">
                  <i className="fas fa-pen-fancy me-2" aria-hidden="true"></i>
                  <span className="d-none d-sm-inline">חוזים ומכתבים</span>
                  <span className="d-sm-none">חוזים</span>
                </Link>
              </div>
            </div>
          </div>

          {/* כלי מכירה – שיווק ופרסום */}
          <div className="col-12 col-sm-6 col-lg-4 col-xl-3">
            <div className="card h-100 shadow-sm border-0 dashboard-card">
              <div className="card-body text-center d-flex flex-column">
                <div className="mb-3 flex-grow-1 d-flex align-items-center justify-content-center">
                  <i className="fas fa-bullhorn dashboard-icon icon-color-yellow" aria-hidden="true"></i>
                </div>
                <h5 className="card-title dashboard-card-title">כלי מכירה</h5>
                <p className="card-text text-muted mb-3 dashboard-card-text">מכתב מכירה, מאגר לידים, שליחת מייל לחברות אחזקה</p>
                <Link to={ROUTES.SALES_TOOLKIT} className="btn w-100 mt-auto btn-admin-sales">
                  <i className="fas fa-paper-plane me-2" aria-hidden="true"></i>
                  <span className="d-none d-sm-inline">כלי מכירה</span>
                  <span className="d-sm-none">מכירה</span>
                </Link>
              </div>
            </div>
          </div>

          {/* הזמנת דיירים – שליחת מייל onboarding */}
          <div className="col-12 col-sm-6 col-lg-4 col-xl-3">
            <div className="card h-100 shadow-sm border-0 dashboard-card">
              <div className="card-body text-center d-flex flex-column">
                <div className="mb-3 flex-grow-1 d-flex align-items-center justify-content-center">
                  <i className="fas fa-envelope-open-text dashboard-icon icon-color-emerald" aria-hidden="true"></i>
                </div>
                <h5 className="card-title dashboard-card-title">הזמנת דיירים</h5>
                <p className="card-text text-muted mb-3 dashboard-card-text">שליחת מייל Welcome לרשימת דיירים חדשים</p>
                <Link to={ROUTES.RESIDENT_INVITE} className="btn w-100 mt-auto btn-admin-invite">
                  <i className="fas fa-paper-plane me-2" aria-hidden="true"></i>
                  <span className="d-none d-sm-inline">שלח הזמנות</span>
                  <span className="d-sm-none">הזמנות</span>
                </Link>
              </div>
            </div>
          </div>

          {/* לוח CEO – super-admin בלבד */}
          {adminRole === 'super-admin' && (
            <div className="col-12 col-sm-6 col-lg-4 col-xl-3">
              <div className="card h-100 shadow-sm border-0 dashboard-card-ceo">
                <div className="card-body text-center d-flex flex-column">
                  <div className="mb-3 flex-grow-1 d-flex align-items-center justify-content-center">
                    <i className="fas fa-crown dashboard-icon icon-color-indigo" aria-hidden="true"></i>
                  </div>
                  <h5 className="card-title dashboard-card-title">לוח CEO</h5>
                  <p className="card-text text-muted mb-3 dashboard-card-text">סטטיסטיקות גלובליות, יומן פעילות, Anomaly Feed</p>
                  <Link to={ROUTES.SUPER_ADMIN_DASHBOARD} className="btn w-100 mt-auto btn-admin-ceo">
                    <i className="fas fa-chart-pie me-2" aria-hidden="true"></i>
                    <span className="d-none d-sm-inline">לוח CEO</span>
                    <span className="d-sm-none">CEO</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* מעקב הורדות אפליקציה – ל-super-admin בלבד */}
          {adminRole === 'super-admin' && (
            <div className="col-12 col-sm-6 col-lg-4 col-xl-3">
              <div className="card h-100 shadow-sm border-0 dashboard-card">
                <div className="card-body text-center d-flex flex-column">
                  <div className="mb-3 flex-grow-1 d-flex align-items-center justify-content-center">
                    <i className="fas fa-mobile-alt dashboard-icon icon-color-violet" aria-hidden="true"></i>
                  </div>
                  <h5 className="card-title dashboard-card-title">מעקב הורדות</h5>
                  <p className="card-text text-muted mb-3 dashboard-card-text">כמה דיירים הורידו אפליקציה בכל בניין</p>
                  <Link to={ROUTES.RESIDENT_ADOPTION} className="btn w-100 mt-auto btn-admin-downloads">
                    <i className="fas fa-chart-bar me-2" aria-hidden="true"></i>
                    <span className="d-none d-sm-inline">מעקב הורדות</span>
                    <span className="d-sm-none">מעקב</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* סטטיסטיקות מהירות */}
        <div className="row mt-5 g-3">
          <div className="col-12">
            <h3 className="text-center mb-4 stats-section-title">
              <i className="fas fa-chart-line me-2" aria-hidden="true"></i>
              סטטיסטיקות מהירות
            </h3>
          </div>
          <div className="col-6 col-md-3">
            <div className="card text-center border-0 shadow-sm stats-card">
              <div className="card-body">
                <h4 className="stat-number stat-number-grey">150</h4>
                <p className="text-muted mb-0 stat-text">
                  <i className="fas fa-users me-1" aria-hidden="true"></i>
                  משתמשים פעילים
                </p>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card text-center border-0 shadow-sm stats-card">
              <div className="card-body">
                <h4 className="stat-number stat-number-green">₪45,000</h4>
                <p className="text-muted mb-0 stat-text">
                  <i className="fas fa-money-bill-wave me-1" aria-hidden="true"></i>
                  תשלומים החודש
                </p>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card text-center border-0 shadow-sm stats-card">
              <div className="card-body">
                <h4 className="stat-number stat-number-amber">12</h4>
                <p className="text-muted mb-0 stat-text">
                  <i className="fas fa-tools me-1" aria-hidden="true"></i>
                  בקשות תחזוקה
                </p>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card text-center border-0 shadow-sm stats-card">
              <div className="card-body">
                <h4 className="stat-number stat-number-grey">85%</h4>
                <p className="text-muted mb-0 stat-text">
                  <i className="fas fa-percentage me-1" aria-hidden="true"></i>
                  אחוז תפוסה
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 