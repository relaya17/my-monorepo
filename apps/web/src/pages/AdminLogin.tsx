import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequestJson } from '../api';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
    const storedUsername = localStorage.getItem('adminUsername');
    if (isLoggedIn && storedUsername) {
      navigate('/admin-dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const cleanUsername = username.trim();
      const cleanPassword = password.trim();
      const { response, data } = await apiRequestJson<{ message?: string; admin?: { username: string; role: string } }>('admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: cleanUsername, password: cleanPassword })
      });

      if (response.ok && data?.admin) {
        // שמירת סטטוס התחברות
        localStorage.setItem('isAdminLoggedIn', 'true');
        localStorage.setItem('adminUsername', data.admin.username);
        localStorage.setItem('adminRole', data.admin.role);
        
        // מעבר לדף האדמין
        navigate('/admin-dashboard');
      } else {
        setError(data?.message || 'שם משתמש או סיסמה שגויים');
      }
    } catch (error) {
      // Admin login error
      setError('שגיאה בהתחברות לשרת');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center" 
         style={{ 
           minHeight: '100vh', 
           background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)' 
         }}>
      <div className="card shadow-lg" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="card-body p-5" style={{ direction: 'rtl', textAlign: 'right' }}>
          <div className="text-center mb-4">
            <i className="fas fa-user-shield fa-3x mb-3" style={{ color: '#6b7280' }}></i>
            <h2 className="card-title" style={{ color: '#2c3e50' }}>
              כניסת מנהל
            </h2>
            <p className="text-muted">הזן פרטי התחברות</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                <i className="fas fa-user ms-2"></i>
                שם משתמש
              </label>
              <input
                type="text"
                className="form-control"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                style={{ textAlign: 'right' }}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="form-label">
                <i className="fas fa-lock ms-2"></i>
                סיסמה
              </label>
              <input
                type="password"
                className="form-control"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="admin123"
                required
                style={{ textAlign: 'right' }}
              />
            </div>

            {error && (
              <div className="alert alert-danger" role="alert">
                <i className="fas fa-exclamation-triangle ms-2"></i>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  מתחבר...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt ms-2"></i>
                  התחבר
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <small className="text-muted">
              <i className="fas fa-info-circle ms-1"></i>
              פרטי התחברות לדוגמה: admin / admin123
            </small>
          </div>

          <div className="text-center mt-3">
            <button
              className="btn btn-link text-decoration-none"
              onClick={() => navigate('/')}
            >
              <i className="fas fa-arrow-left ms-1"></i>
              חזרה לדף הבית
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin; 