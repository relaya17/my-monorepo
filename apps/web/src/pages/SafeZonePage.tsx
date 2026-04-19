/**
 * Safe-Zone – ליווי מצלמות וירטואלי.
 * MVP: דייר (הורים, נשים שחוזרות מאוחר) מבקש ליווי מהכניסה לבניין עד לדלת הדירה.
 * המערכת עוקבת ומוודאת כניסה בשלום.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ROUTES from '../routs/routes';

const SafeZonePage: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'idle' | 'requesting' | 'active' | 'success'>('idle');

  const handleRequestEscort = () => {
    setStatus('requesting');
    setTimeout(() => {
      setStatus('active');
      setTimeout(() => setStatus('success'), 3000);
    }, 1500);
  };

  return (
    <div className="safe-zone-page container py-5" style={{ direction: 'rtl', maxWidth: 560 }}>
      <div className="card shadow-lg border-0">
        <div className="card-header text-center" style={{ backgroundColor: '#00d4aa', color: '#0f172a' }}>
          <h4 className="mb-0">
            <i className="fas fa-shield-alt me-2" aria-hidden="true" />
            Safe-Zone
          </h4>
        </div>
        <div className="card-body p-4">
          <p className="text-muted mb-4">
            ליווי מצלמות וירטואלי מהכניסה לבניין ועד לפתח הדירה. מיועד להורים לילדים ונשים שחוזרות מאוחר – המערכת עוקבת ומוודאת כניסה בשלום.
          </p>

          {status === 'idle' && (
            <button
              type="button"
              className="btn btn-lg w-100"
              style={{ backgroundColor: '#00d4aa', borderColor: '#00d4aa', color: '#0f172a' }}
              onClick={handleRequestEscort}
              aria-label="בקש ליווי מצלמות"
            >
              <i className="fas fa-play me-2" aria-hidden="true" />
              בקש ליווי
            </button>
          )}

          {status === 'requesting' && (
            <div className="text-center py-3">
              <div className="spinner-border text-success" role="status" aria-label="טוען">
                <span className="visually-hidden">מתחבר...</span>
              </div>
              <p className="mt-2 mb-0 text-muted">מתחבר למצלמות הבניין...</p>
            </div>
          )}

          {status === 'active' && (
            <div className="text-center py-3">
              <i className="fas fa-eye fa-2x text-success mb-2" aria-hidden="true" />
              <p className="mb-0 fw-bold">הליווי פעיל</p>
              <p className="small text-muted">מעבירים אותך בבטחה...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-3">
              <i className="fas fa-check-circle fa-2x text-success mb-2" aria-hidden="true" />
              <p className="mb-0 fw-bold">נכנסת בשלום</p>
              <p className="small text-muted">הליווי הושלם.</p>
            </div>
          )}

          <button
            type="button"
            className="btn btn-outline-secondary w-100 mt-3"
            onClick={() => navigate(ROUTES.RESIDENT_HOME)}
          >
            <i className="fas fa-arrow-right me-2" aria-hidden="true" />
            חזרה לדף הבית
          </button>
        </div>
      </div>
    </div>
  );
};

export default SafeZonePage;
