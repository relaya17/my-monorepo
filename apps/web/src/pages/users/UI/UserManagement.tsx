import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ROUTES from '../../../routs/routes';

const UserManagement: React.FC = () => {
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // בדיקה אם המשתמש מחובר כאדמין
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
    if (!isLoggedIn) {
      navigate('/admin-login');
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdminPassword(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'admin123') {
      setIsAuthenticated(true);
    } else {
      alert('סיסמה שגויה');
    }
  };

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
      <div className="container-fluid d-flex justify-content-center align-items-center" 
           style={{ 
             minHeight: '100vh', 
             background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
             direction: 'rtl'
           }}>
        <div className="card shadow-lg" style={{ maxWidth: '400px', width: '100%' }}>
          <div className="card-body p-5" style={{ textAlign: 'right' }}>
            <div className="text-center mb-4">
              <i className="fas fa-users fa-3x mb-3" style={{ color: '#6b7280' }}></i>
              <h2 className="card-title" style={{ color: '#ffffff' }}>
                ניהול משתמשים
              </h2>
              <p className="text-muted">הזן סיסמת מנהל</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="adminPassword" className="form-label">
                  <i className="fas fa-lock ms-2"></i>
                  סיסמת מנהל
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="adminPassword"
                  value={adminPassword}
                  onChange={handlePasswordChange}
                  placeholder="הזן סיסמת מנהל"
                  required
                  style={{ textAlign: 'right' }}
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">
                <i className="fas fa-sign-in-alt ms-2"></i>
                התחבר
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: '#f8f9fa', direction: 'rtl' }}>
      <div className="row">
        <div className="col-12 d-flex justify-content-between align-items-center mb-5">
          <div></div>
                      <h1 className="text-center" style={{ color: '#ffffff', fontWeight: 'bold', margin: 0 }}>
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
                              <h5 className="card-title" style={{ color: '#ffffff' }}>רשימת משתמשים</h5>
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
                              <h5 className="card-title" style={{ color: '#ffffff' }}>הוספת משתמש</h5>
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
                              <h5 className="card-title" style={{ color: '#ffffff' }}>שינוי סיסמה</h5>
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
