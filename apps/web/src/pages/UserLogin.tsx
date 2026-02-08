import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ROUTES from '../routs/routes';
import { apiRequestJson, getBuildingId, setBuildingId } from '../api';
import { safeSetItem } from '../utils/safeStorage';

type Step = 'building' | 'login';

const UserLogin: React.FC = () => {
  const [step, setStep] = useState<Step>('building');
  const [buildings, setBuildings] = useState<{ buildingId: string; address: string; buildingNumber: string; committeeName?: string }[]>([]);
  const [buildingsLoading, setBuildingsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const passwordRef = useRef<HTMLInputElement>(null);

  const loadBuildings = useCallback(async () => {
    setBuildingsLoading(true);
    try {
      const { response, data } = await apiRequestJson<{ buildings?: { buildingId: string; address: string; buildingNumber: string; committeeName?: string }[] }>('buildings');
      if (response.ok && Array.isArray(data?.buildings) && data.buildings.length > 0) {
        setBuildings(data.buildings);
      } else {
        setBuildings([{ buildingId: 'default', address: 'בניין ברירת מחדל', buildingNumber: '' }]);
      }
    } catch {
      setBuildings([{ buildingId: 'default', address: 'בניין ברירת מחדל', buildingNumber: '' }]);
    } finally {
      setBuildingsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBuildings();
  }, [loadBuildings]);

  const currentBuildingId = getBuildingId();

  const handleSelectBuilding = (buildingId: string) => {
    setBuildingId(buildingId);
    setStep('login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    try {
      const { response, data } = await apiRequestJson<{ message?: string; user?: { id: string; name: string; email: string } }>('login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
      });

      if (response.ok && data?.user) {
        safeSetItem('isUserLoggedIn', 'true');
        safeSetItem('userEmail', data.user.email);
        safeSetItem('userName', data.user.name);
        safeSetItem('userId', data.user.id.toString());
        safeSetItem('user', JSON.stringify(data.user));
        navigate(ROUTES.RESIDENT_HOME);
      } else {
        setError(data?.message || 'אימייל או סיסמה שגויים');
      }
    } catch {
      setError('שגיאה בהתחברות לשרת');
    }
    setIsLoading(false);
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center"
         style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)' }}>
      <div className="card shadow-lg" style={{ maxWidth: '420px', width: '100%' }}>
        <div className="card-body p-5" style={{ direction: 'rtl', textAlign: 'right' }}>
          <div className="text-center mb-4">
            <i className="fas fa-home fa-3x mb-3" style={{ color: '#6b7280' }}></i>
            <h2 className="card-title" style={{ color: '#374151' }}>
              כניסת דייר
            </h2>
            <p className="text-muted">ברוכים הבאים למערכת אחזקת מבנים</p>
          </div>

          {step === 'building' && (
            <>
              <p className="text-muted small mb-3">בחר את הבניין שלך לפני ההתחברות</p>
              {buildingsLoading ? (
                <div className="text-center py-3">
                  <div className="spinner-border text-primary" role="status" aria-label="טוען" />
                </div>
              ) : (
                <div className="d-grid gap-2 mb-4">
                  {buildings.map((b, i) => (
                    <button
                      key={b.buildingId ? `${b.buildingId}-${i}` : `building-${i}`}
                      type="button"
                      className={`btn btn-lg ${currentBuildingId === b.buildingId ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => handleSelectBuilding(b.buildingId)}
                    >
                      <i className="fas fa-building me-2"></i>
                      {b.address} {b.buildingNumber ? `מס׳ ${b.buildingNumber}` : ''}
                      {b.committeeName && <small className="d-block opacity-75">{b.committeeName}</small>}
                    </button>
                  ))}
                </div>
              )}
              <button type="button" className="btn btn-link w-100" onClick={() => navigate('/')}>
                <i className="fas fa-arrow-left me-1"></i> חזרה לדף הבית
              </button>
            </>
          )}

          {step === 'login' && (
            <>
              <div className="alert alert-light small mb-3" role="status">
                <i className="fas fa-building me-2"></i>
                בניין נבחר. <button type="button" className="btn btn-link btn-sm p-0" onClick={() => setStep('building')}>שנה בניין</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label"><i className="fas fa-envelope ms-2"></i> כתובת אימייל</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); passwordRef.current?.focus(); } }}
                    placeholder="הזן כתובת אימייל"
                    required
                    autoComplete="email"
                    style={{ textAlign: 'right' }}
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="password" className="form-label"><i className="fas fa-lock ms-2"></i> סיסמה</label>
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
                      style={{ textAlign: 'right' }}
                    />
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}>
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>
                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="fas fa-exclamation-triangle ms-2"></i> {error}
                  </div>
                )}
                <div className="text-end mb-2">
                  <button type="button" className="btn btn-link btn-sm p-0 text-decoration-none" onClick={() => navigate(ROUTES.FORGOT_PASSWORD)}>
                    שכחתי סיסמה
                  </button>
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
                  {isLoading ? <><span className="spinner-border spinner-border-sm me-2" role="status"></span>מתחבר...</> : <><i className="fas fa-sign-in-alt ms-2"></i>התחבר</>}
                </button>
              </form>
              <div className="text-center mt-4">
                <small className="text-muted">פרטי התחברות לדוגמה: resident@example.com / 123456</small>
              </div>
              <div className="text-center mt-3">
                <button type="button" className="btn btn-link text-decoration-none" onClick={() => navigate('/')}>
                  <i className="fas fa-arrow-left ms-1"></i> חזרה לדף הבית
                </button>
              </div>
              <hr className="my-4" />
              <div className="text-center">
                <p className="text-muted mb-2">אין לך חשבון?</p>
                <button type="button" className="btn btn-outline-success" onClick={() => navigate(ROUTES.SIGN_UP)}>
                  <i className="fas fa-user-plus ms-2"></i> הרשמה לאתר
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
