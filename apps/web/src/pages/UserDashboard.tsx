import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ROUTES from '../routs/routes';
// import NavigationBar from './SecondNavbar';

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    // בדיקה אם המשתמש מחובר
    const isLoggedIn = localStorage.getItem('isUserLoggedIn');
    const name = localStorage.getItem('userName');
    const email = localStorage.getItem('userEmail');
    
    if (!isLoggedIn || !name || !email) {
      // אם לא מחובר, מעבר לדף הכניסה
      navigate('/user-login');
      return;
    }
    
    setUserName(name);
    setUserEmail(email);
  }, [navigate]);

  const handleLogout = () => {
    // מחיקת פרטי ההתחברות
    localStorage.removeItem('isUserLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    navigate('/user-login');
  };

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: '#f8f9fa', direction: 'rtl' }}>
      {/* <NavigationBar /> הוסר */}
      <div className="row">
        <div className="col-12 d-flex justify-content-between align-items-center mb-5">
          <div></div>
                      <h1 className="text-center" style={{ color: '#374151', fontWeight: 'bold', margin: 0 }}>
            <i className="fas fa-home ms-2"></i>
            לוח בקרה - אחזקת מבנים
          </h1>
          <div className="d-flex align-items-center">
            <span className="ms-3 text-muted">
              <i className="fas fa-user ms-1"></i>
              שלום, {userName}
            </span>
            <button 
              onClick={handleLogout}
              className="btn btn-outline-danger btn-sm ms-2"
              title="התנתק"
            >
              <i className="fas fa-sign-out-alt ms-1"></i>
              התנתק
            </button>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* תשלומים */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-0" style={{ backgroundColor: '#fff' }}>
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="fas fa-credit-card fa-3x" style={{ color: '#27ae60' }}></i>
              </div>
                              <h5 className="card-title" style={{ color: '#374151' }}>תשלומים</h5>
              <p className="card-text text-muted">צפייה בתשלומים וניהול חשבון</p>
              <Link to={ROUTES.CHECK_OUT} className="btn btn-success w-100">
                <i className="fas fa-chart-line ms-2"></i>
                צפייה בתשלומים
              </Link>
            </div>
          </div>
        </div>

        {/* בקשות תחזוקה */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-0" style={{ backgroundColor: '#fff' }}>
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="fas fa-tools fa-3x" style={{ color: '#9b59b6' }}></i>
              </div>
                              <h5 className="card-title" style={{ color: '#374151' }}>בקשות תחזוקה</h5>
              <p className="card-text text-muted">דיווח על בעיות תחזוקה</p>
              <Link to={ROUTES.REPAIR_TRACKING} className="btn btn-info w-100">
                <i className="fas fa-wrench ms-2"></i>
                דווח על בעיה
              </Link>
            </div>
          </div>
        </div>

        {/* גינון */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-0" style={{ backgroundColor: '#fff' }}>
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="fas fa-seedling fa-3x" style={{ color: '#27ae60' }}></i>
              </div>
                              <h5 className="card-title" style={{ color: '#374151' }}>גינון</h5>
              <p className="card-text text-muted">בקשות גינון ותחזוקת גינות</p>
              <Link to={ROUTES.GARDENING} className="btn btn-success w-100">
                <i className="fas fa-leaf ms-2"></i>
                בקשות גינון
              </Link>
            </div>
          </div>
        </div>



        {/* דירות להשכרה */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-0" style={{ backgroundColor: '#fff' }}>
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="fas fa-key fa-3x" style={{ color: '#f39c12' }}></i>
              </div>
                              <h5 className="card-title" style={{ color: '#374151' }}>דירות להשכרה</h5>
              <p className="card-text text-muted">צפייה בדירות פנויות להשכרה</p>
              <Link to={ROUTES.FOR_RENT} className="btn btn-warning w-100">
                <i className="fas fa-search ms-2"></i>
                דירות להשכרה
              </Link>
            </div>
          </div>
        </div>

        {/* דירות למכירה */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-0" style={{ backgroundColor: '#fff' }}>
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="fas fa-home fa-3x" style={{ color: '#e74c3c' }}></i>
              </div>
                              <h5 className="card-title" style={{ color: '#374151' }}>דירות למכירה</h5>
              <p className="card-text text-muted">צפייה בדירות למכירה</p>
              <Link to={ROUTES.FOR_SALE} className="btn btn-danger w-100">
                <i className="fas fa-tag ms-2"></i>
                דירות למכירה
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* מידע אישי */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="fas fa-user-circle ms-2"></i>
                מידע אישי
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <p><strong>שם:</strong> {userName}</p>
                  <p><strong>אימייל:</strong> {userEmail}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>דירה:</strong> דירה 15, בניין א'</p>
                  <p><strong>תאריך הצטרפות:</strong> 15/01/2024</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* סטטיסטיקות מהירות */}
      <div className="row mt-4">
        <div className="col-12">
                      <h3 className="text-center mb-4" style={{ color: '#374151' }}>סטטיסטיקות אישיות</h3>
        </div>
        <div className="col-md-3">
          <div className="card text-center border-0 shadow-sm">
            <div className="card-body">
              <h4 className="text-success">₪2,500</h4>
              <p className="text-muted mb-0">תשלום החודש</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center border-0 shadow-sm">
            <div className="card-body">
              <h4 style={{ color: '#6b7280' }}>3</h4>
              <p className="text-muted mb-0">בקשות תחזוקה</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center border-0 shadow-sm">
            <div className="card-body">
              <h4 style={{ color: '#f59e0b' }}>2</h4>
              <p className="text-muted mb-0">הודעות חדשות</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center border-0 shadow-sm">
            <div className="card-body">
              <h4 style={{ color: '#6b7280' }}>12</h4>
              <p className="text-muted mb-0">חודשים חבר</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard; 