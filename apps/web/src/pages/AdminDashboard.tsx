import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ROUTES from '../routs/routes';
import { safeGetItem, safeRemoveItem } from '../utils/safeStorage';
import { buildingLabel, getBuildingId } from '../api';
import AINotifications from '../components/AINotifications';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [adminUsername, setAdminUsername] = useState<string>('');
  const [currentBuildingId, setCurrentBuildingId] = useState<string>(getBuildingId());

  useEffect(() => {
    const isLoggedIn = safeGetItem('isAdminLoggedIn');
    const username = safeGetItem('adminUsername');
    if (!isLoggedIn || !username) {
      navigate('/admin-login');
      return;
    }
    setAdminUsername(username);
    setCurrentBuildingId(getBuildingId());
  }, [navigate]);

  const handleLogout = () => {
    safeRemoveItem('isAdminLoggedIn');
    safeRemoveItem('adminUsername');
    navigate('/admin-login');
  };

  return (
    <div className="admin-dashboard" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', direction: 'rtl', paddingTop: '80px' }}>
      {/* <NavigationBar /> הוסר */}
      <div className="container-fluid p-3 p-md-4">
        <div className="row">
          <div className="col-12 d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 mb-md-5">
            <div className="d-none d-md-block"></div> {/* רווח בצד שמאל */}
            <h1 className="text-center mb-3 mb-md-0" style={{ 
              color: '#374151', 
              fontWeight: 'bold', 
              margin: 0,
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)'
            }}>
              <i className="fas fa-building me-2" aria-hidden="true"></i>
              לוח בקרה למנהל
            </h1>
            <div className="d-flex flex-column flex-md-row align-items-center gap-2 w-100 justify-content-center justify-content-md-end">
              <span className="text-muted text-center text-md-end" style={{ fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>
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
            <div className="card border-primary shadow-sm" style={{ borderWidth: '2px', backgroundColor: '#f0f9ff' }}>
              <div className="card-body py-3 py-md-4">
                <h5 className="card-title mb-3 text-center" style={{ color: '#1e40af' }}>
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
                    <strong className="d-block" style={{ color: '#1e40af' }}>
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
            <div className="card h-100 shadow-sm border-0 dashboard-card" style={{ backgroundColor: '#fff' }}>
              <div className="card-body text-center d-flex flex-column">
                <div className="mb-3 flex-grow-1 d-flex align-items-center justify-content-center">
                  <i className="fas fa-users dashboard-icon" style={{ color: '#3498db', fontSize: 'clamp(2rem, 5vw, 3rem)' }} aria-hidden="true"></i>
                </div>
                <h5 className="card-title" style={{ color: '#374151', fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }}>ניהול משתמשים</h5>
                <p className="card-text text-muted mb-3" style={{ fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>הוספה, עריכה ומחיקה של משתמשים במערכת</p>
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
            <div className="card h-100 shadow-sm border-0 dashboard-card" style={{ backgroundColor: '#fff' }}>
              <div className="card-body text-center d-flex flex-column">
                <div className="mb-3 flex-grow-1 d-flex align-items-center justify-content-center">
                  <i className="fas fa-credit-card dashboard-icon" style={{ color: '#27ae60', fontSize: 'clamp(2rem, 5vw, 3rem)' }} aria-hidden="true"></i>
                </div>
                <h5 className="card-title" style={{ color: '#374151', fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }}>ניהול תשלומים</h5>
                <p className="card-text text-muted mb-3" style={{ fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>מעקב וניהול תשלומי דיירים</p>
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
            <div className="card h-100 shadow-sm border-0 dashboard-card" style={{ backgroundColor: '#fff' }}>
              <div className="card-body text-center d-flex flex-column">
                <div className="mb-3 flex-grow-1 d-flex align-items-center justify-content-center">
                  <i className="fas fa-home dashboard-icon" style={{ color: '#e74c3c', fontSize: 'clamp(2rem, 5vw, 3rem)' }} aria-hidden="true"></i>
                </div>
                <h5 className="card-title" style={{ color: '#374151', fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }}>ניהול דירות</h5>
                <p className="card-text text-muted mb-3" style={{ fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>הוספה ועריכה של דירות למכירה והשכרה</p>
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
            <div className="card h-100 shadow-sm border-0 dashboard-card" style={{ backgroundColor: '#fff' }}>
              <div className="card-body text-center d-flex flex-column">
                <div className="mb-3 flex-grow-1 d-flex align-items-center justify-content-center">
                  <i className="fas fa-chart-bar dashboard-icon" style={{ color: '#f39c12', fontSize: 'clamp(2rem, 5vw, 3rem)' }} aria-hidden="true"></i>
                </div>
                <h5 className="card-title" style={{ color: '#374151', fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }}>דוחות וסטטיסטיקה</h5>
                <p className="card-text text-muted mb-3" style={{ fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>צפייה בדוחות מפורטים וסטטיסטיקות מערכת</p>
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
            <div className="card h-100 shadow-sm border-0 dashboard-card" style={{ backgroundColor: '#fff' }}>
              <div className="card-body text-center d-flex flex-column">
                <div className="mb-3 flex-grow-1 d-flex align-items-center justify-content-center">
                  <i className="fas fa-tools dashboard-icon" style={{ color: '#9b59b6', fontSize: 'clamp(2rem, 5vw, 3rem)' }} aria-hidden="true"></i>
                </div>
                <h5 className="card-title" style={{ color: '#374151', fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }}>ניהול תחזוקה</h5>
                <p className="card-text text-muted mb-3" style={{ fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>מעקב אחר בקשות תחזוקה ותיקונים</p>
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
            <div className="card h-100 shadow-sm border-0 dashboard-card" style={{ backgroundColor: '#fff' }}>
              <div className="card-body text-center d-flex flex-column">
                <div className="mb-3 flex-grow-1 d-flex align-items-center justify-content-center">
                  <i className="fas fa-cogs dashboard-icon" style={{ color: '#34495e', fontSize: 'clamp(2rem, 5vw, 3rem)' }} aria-hidden="true"></i>
                </div>
                <h5 className="card-title" style={{ color: '#374151', fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }}>הגדרות מערכת</h5>
                <p className="card-text text-muted mb-3" style={{ fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>הגדרות כלליות של המערכת והרשאות</p>
                <Link
                  to={ROUTES.SYSTEM_SETTINGS}
                  className="btn btn-dark w-100 mt-auto"
                  style={{ backgroundColor: '#4b5563', borderColor: '#4b5563', color: '#ffffff' }}
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
            <div className="card h-100 shadow-sm border-0 dashboard-card" style={{ backgroundColor: '#fff' }}>
              <div className="card-body text-center d-flex flex-column">
                <div className="mb-3 flex-grow-1 d-flex align-items-center justify-content-center">
                  <i className="fas fa-brain dashboard-icon" style={{ color: '#e91e63', fontSize: 'clamp(2rem, 5vw, 3rem)' }} aria-hidden="true"></i>
                </div>
                <h5 className="card-title" style={{ color: '#374151', fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }}>AI חכם</h5>
                <p className="card-text text-muted mb-3" style={{ fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>ניתוח מתקדם וקבלת החלטות מבוססות נתונים</p>
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
            <div className="card h-100 shadow-sm border-0 dashboard-card" style={{ backgroundColor: '#fff' }}>
              <div className="card-body text-center d-flex flex-column">
                <div className="mb-3 flex-grow-1 d-flex align-items-center justify-content-center">
                  <i className="fas fa-file-contract dashboard-icon" style={{ color: '#0d9488', fontSize: 'clamp(2rem, 5vw, 3rem)' }} aria-hidden="true"></i>
                </div>
                <h5 className="card-title" style={{ color: '#374151', fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }}>חוזים ומכתבים</h5>
                <p className="card-text text-muted mb-3" style={{ fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>תבניות חוזים תואמי ועד בית, מכתב נזק, פיגורי תשלום ומחדלים</p>
                <Link to={ROUTES.CONTRACTS_AND_LETTERS} className="btn w-100 mt-auto" style={{ backgroundColor: '#0d9488', color: '#fff', borderColor: '#0d9488' }}>
                  <i className="fas fa-pen-fancy me-2" aria-hidden="true"></i>
                  <span className="d-none d-sm-inline">חוזים ומכתבים</span>
                  <span className="d-sm-none">חוזים</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* סטטיסטיקות מהירות */}
        <div className="row mt-5 g-3">
          <div className="col-12">
            <h3 className="text-center mb-4" style={{ 
              color: '#374151',
              fontSize: 'clamp(1.5rem, 3vw, 2rem)'
            }}>
              <i className="fas fa-chart-line me-2" aria-hidden="true"></i>
              סטטיסטיקות מהירות
            </h3>
          </div>
          <div className="col-6 col-md-3">
            <div className="card text-center border-0 shadow-sm stats-card">
              <div className="card-body">
                <h4 style={{ color: '#6b7280', fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>150</h4>
                <p className="text-muted mb-0" style={{ fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>
                  <i className="fas fa-users me-1" aria-hidden="true"></i>
                  משתמשים פעילים
                </p>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card text-center border-0 shadow-sm stats-card">
              <div className="card-body">
                <h4 style={{ color: '#27ae60', fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>₪45,000</h4>
                <p className="text-muted mb-0" style={{ fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>
                  <i className="fas fa-money-bill-wave me-1" aria-hidden="true"></i>
                  תשלומים החודש
                </p>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card text-center border-0 shadow-sm stats-card">
              <div className="card-body">
                <h4 style={{ color: '#f59e0b', fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>12</h4>
                <p className="text-muted mb-0" style={{ fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>
                  <i className="fas fa-tools me-1" aria-hidden="true"></i>
                  בקשות תחזוקה
                </p>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card text-center border-0 shadow-sm stats-card">
              <div className="card-body">
                <h4 style={{ color: '#6b7280', fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>85%</h4>
                <p className="text-muted mb-0" style={{ fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>
                  <i className="fas fa-percentage me-1" aria-hidden="true"></i>
                  אחוז תפוסה
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CSS מותאם אישית לנגישות ורספונסיביות */}
      <style>{`
        .admin-dashboard {
          min-height: 100vh;
        }
        
        .dashboard-card {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
          cursor: pointer;
        }
        
        .dashboard-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
        }
        
        .stats-card {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        
        .stats-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.1) !important;
        }
        
        .dashboard-icon {
          transition: transform 0.2s ease-in-out;
        }
        
        .dashboard-card:hover .dashboard-icon {
          transform: scale(1.1);
        }

        /* Top action buttons should be consistent on small screens */
        .admin-actions {
          width: 100%;
        }

        @media (max-width: 576px) {
          .admin-actions .admin-action-btn {
            width: 44px;
            height: 44px;
            padding: 0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }

          .admin-actions .admin-action-btn i {
            margin: 0 !important;
          }
        }
        
        @media (max-width: 768px) {
          .dashboard-card {
            margin-bottom: 1rem;
          }
          
          .stats-card {
            margin-bottom: 1rem;
          }
        }
        
        @media (max-width: 576px) {
          .admin-dashboard .container-fluid {
            padding: 1rem;
          }
          
          .dashboard-card .card-body {
            padding: 1rem;
          }
          
          .stats-card .card-body {
            padding: 1rem;
          }
        }
        
        /* נגישות - מיקוד טוב יותר */
        .dashboard-card:focus,
        .stats-card:focus {
          outline: 2px solid #007bff;
          outline-offset: 2px;
        }
        
        .btn:focus {
          outline: 2px solid #007bff;
          outline-offset: 2px;
        }
        
        /* אנימציות חלקות */
        .dashboard-card,
        .stats-card,
        .btn {
          transition: all 0.2s ease-in-out;
        }
        
        /* תמיכה במסכים קטנים */
        @media (max-width: 480px) {
          .dashboard-card .card-title {
            font-size: 1rem !important;
          }
          
          .dashboard-card .card-text {
            font-size: 0.8rem !important;
          }
          
          .stats-card h4 {
            font-size: 1.2rem !important;
          }
          
          .stats-card p {
            font-size: 0.7rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard; 