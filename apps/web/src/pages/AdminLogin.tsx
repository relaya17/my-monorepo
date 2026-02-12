import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequestJson, AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, setBuildingId } from '../api';
import ROUTES from '../routs/routes';
import { safeSetItem } from '../utils/safeStorage';
import { useAuth } from '../context/AuthContext';

const AdminLogin: React.FC = () => {
  const { refreshAuth } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerMsg, setRegisterMsg] = useState('');
  const navigate = useNavigate();
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterMsg('');
    if (!username.trim() || !password.trim()) {
      setRegisterMsg('יש להזין שם משתמש וסיסמה');
      return;
    }
    try {
      const { response, data } = await apiRequestJson<{ message?: string }>('admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: password.trim() })
      });
      if (response.ok) {
        setRegisterMsg('אדמין נוצר בהצלחה – כעת ניתן להתחבר');
      } else {
        setRegisterMsg(data?.message || 'שגיאה ברישום');
      }
    } catch {
      setRegisterMsg('שגיאה בהתחברות לשרת');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const cleanUsername = username.trim();
      const cleanPassword = password.trim();
      const { response, data } = await apiRequestJson<{
        message?: string;
        admin?: { username: string; role: string };
        accessToken?: string;
        refreshToken?: string;
      }>('admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUsername, password: cleanPassword })
      });

      if (response.ok && data?.admin) {
        safeSetItem('isAdminLoggedIn', 'true');
        safeSetItem('adminUsername', data.admin.username);
        safeSetItem('adminRole', data.admin.role);
        if (data.accessToken) safeSetItem(AUTH_TOKEN_KEY, data.accessToken);
        if (data.refreshToken) safeSetItem(REFRESH_TOKEN_KEY, data.refreshToken);
        setBuildingId('default');
        refreshAuth();
        navigate(ROUTES.ADMIN_DASHBOARD);
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
              <label htmlFor="admin-username" className="form-label fw-semibold">
                <i className="fas fa-user ms-2" aria-hidden="true"></i>
                שם משתמש
              </label>
              <input
                type="text"
                className="form-control"
                id="admin-username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    passwordRef.current?.focus();
                  }
                }}
                placeholder="הזן שם משתמש (למשל: admin)"
                required
                autoComplete="username"
                enterKeyHint="next"
                aria-label="שם משתמש"
                style={{ textAlign: 'right' }}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="admin-password" className="form-label fw-semibold">
                <i className="fas fa-lock ms-2" aria-hidden="true"></i>
                סיסמה
              </label>
              <div className="input-group">
                <input
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  id="admin-password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="הזן סיסמה"
                  required
                  autoComplete="current-password"
                  enterKeyHint="done"
                  aria-label="סיסמה"
                  style={{ textAlign: 'right' }}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
                  title={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true"></i>
                </button>
              </div>
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
            <small className="text-muted d-block">
              <i className="fas fa-info-circle ms-1" aria-hidden="true"></i>
              השתמש בפרטי ההתחברות שניתנו לך
            </small>
          </div>

          <div className="text-center mt-2">
            <button type="button" className="btn btn-link btn-sm" onClick={() => setShowRegister(!showRegister)}>
              {showRegister ? 'הסתר רישום' : 'רישום אדמין חדש (לבדיקה)'}
            </button>
          </div>
          {showRegister && (
            <div className="mt-3 p-3 border rounded" style={{ direction: 'rtl', textAlign: 'right' }}>
              <form onSubmit={handleRegister}>
                <input className="form-control mb-2" placeholder="שם משתמש (למשל: 2)" value={username} onChange={e => setUsername(e.target.value)} />
                <input type="password" className="form-control mb-2" placeholder="סיסמה" value={password} onChange={e => setPassword(e.target.value)} />
                <button type="submit" className="btn btn-outline-primary btn-sm">הרשם</button>
                {registerMsg && <div className="mt-2 small text-muted">{registerMsg}</div>}
              </form>
            </div>
          )}

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