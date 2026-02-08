import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ROUTES from '../routs/routes';
import { apiRequestJson } from '../api';

const UserLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // ניקוי רווחים מיותרים
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    try {
      const requestBody = JSON.stringify({ email: cleanEmail, password: cleanPassword });
      
      const { response, data } = await apiRequestJson<{ message?: string; user?: { id: string; name: string; email: string } }>('login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: requestBody
      });

      if (response.ok && data?.user) {
        // שמירת סטטוס התחברות
        localStorage.setItem('isUserLoggedIn', 'true');
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userName', data.user.name);
        localStorage.setItem('userId', data.user.id.toString());
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // מעבר לדף המשתמש
        navigate(ROUTES.RESIDENT_HOME);
      } else {
        setError(data?.message || 'אימייל או סיסמה שגויים');
      }
    } catch (error) {
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
            <i className="fas fa-home fa-3x mb-3" style={{ color: '#6b7280' }}></i>
            <h2 className="card-title" style={{ color: '#374151' }}>
              כניסת דייר
            </h2>
            <p className="text-muted">ברוכים הבאים למערכת אחזקת מבנים</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                <i className="fas fa-envelope ms-2"></i>
                כתובת אימייל
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    passwordRef.current?.focus();
                  }
                }}
                placeholder="הזן כתובת אימייל"
                required
                autoComplete="email"
                enterKeyHint="next"
                style={{ textAlign: 'right' }}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="form-label">
                <i className="fas fa-lock ms-2"></i>
                סיסמה
              </label>
              <div className="input-group">
                <input
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="הזן סיסמה"
                  required
                  autoComplete="current-password"
                  enterKeyHint="done"
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
                  <span className="spinner-border spinner-border-sm ms-2" role="status"></span>
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
              פרטי התחברות לדוגמה: resident@example.com / 123456
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

          <hr className="my-4" />
          
          <div className="text-center">
            <p className="text-muted mb-2">אין לך חשבון?</p>
            <button
              className="btn btn-outline-success"
              onClick={() => navigate(ROUTES.SIGN_UP)}
            >
              <i className="fas fa-user-plus ms-2"></i>
              הרשמה לאתר
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin; 