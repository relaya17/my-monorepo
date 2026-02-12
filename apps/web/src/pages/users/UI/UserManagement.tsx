import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ROUTES from '../../../routs/routes';

const UserManagement: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
    if (!isLoggedIn) {
      navigate('/admin-login');
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate]);

  const goToChangePassword = () => {
    navigate(ROUTES.CHANGE_PASSWORD);
  };

  const goToUsersList = () => {
    navigate(ROUTES.USERS_LIST);
  };

  const goToCreateUser = () => {
    navigate(ROUTES.SIGN_UP);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('adminUsername');
    navigate('/admin-login');
  };

  if (!isAuthenticated) {
    return (
      <div className="container-fluid d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">טוען...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: '#f8f9fa', direction: 'rtl' }}>
      <div className="row">
        <div className="col-12 d-flex justify-content-between align-items-center mb-5">
          <div></div>
                      <h1 className="text-center" style={{ color: '#374151', fontWeight: 'bold', margin: 0 }}>
            <i className="fas fa-users ms-2"></i>
            ניהול משתמשים
          </h1>
          <div className="d-flex align-items-center">
            <button 
              onClick={handleLogout}
              className="btn btn-outline-danger btn-sm"
              title="התנתק"
            >
              <i className="fas fa-sign-out-alt ms-1"></i>
              התנתק
            </button>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-0" style={{ backgroundColor: '#fff' }}>
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="fas fa-list fa-3x" style={{ color: '#3498db' }}></i>
              </div>
                              <h5 className="card-title" style={{ color: '#374151' }}>רשימת משתמשים</h5>
              <p className="card-text text-muted">צפייה וניהול כל המשתמשים במערכת</p>
              <button onClick={goToUsersList} className="btn btn-primary w-100">
                <i className="fas fa-eye ms-2"></i>
                צפייה ברשימה
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-0" style={{ backgroundColor: '#fff' }}>
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="fas fa-user-plus fa-3x" style={{ color: '#27ae60' }}></i>
              </div>
                              <h5 className="card-title" style={{ color: '#374151' }}>הוספת משתמש</h5>
              <p className="card-text text-muted">הוספת משתמש חדש למערכת</p>
              <button onClick={goToCreateUser} className="btn btn-success w-100">
                <i className="fas fa-plus ms-2"></i>
                הוסף משתמש
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-0" style={{ backgroundColor: '#fff' }}>
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="fas fa-key fa-3x" style={{ color: '#e74c3c' }}></i>
              </div>
                              <h5 className="card-title" style={{ color: '#374151' }}>שינוי סיסמה</h5>
              <p className="card-text text-muted">שינוי סיסמת מנהל</p>
              <button onClick={goToChangePassword} className="btn btn-danger w-100">
                <i className="fas fa-edit ms-2"></i>
                שנה סיסמה
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-4">
        <button
          onClick={() => navigate(ROUTES.ADMIN_DASHBOARD)}
          className="btn btn-outline-secondary"
        >
          <i className="fas fa-arrow-right ms-2"></i>
          חזרה ללוח הבקרה
        </button>
      </div>
    </div>
  );
};

export default UserManagement;
