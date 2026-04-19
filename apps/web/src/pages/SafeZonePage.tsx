/**
 * Safe-Zone – ליווי מצלמות וירטואלי.
 * MVP: דייר (הורים, נשים שחוזרות מאוחר) מבקש ליווי מהכניסה לבניין עד לדלת הדירה.
 * המערכת יוצרת session ב-DB ועוקבת אחר הסטטוס.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ROUTES from '../routs/routes';
import { getApiUrl, getApiHeaders } from '../api';
import './SafeZonePage.css';

interface Session {
  _id: string;
  status: 'requested' | 'active' | 'completed' | 'failed';
}

const SafeZonePage: React.FC = () => {
  const navigate = useNavigate();
  const [residentName, setResidentName] = useState('');
  const [apartmentNumber, setApartmentNumber] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequestEscort = async () => {
    if (!residentName.trim() || !apartmentNumber.trim()) {
      setError('נא למלא שם ומספר דירה');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(getApiUrl('safe-zone/request'), {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({
          residentName: residentName.trim(),
          apartmentNumber: apartmentNumber.trim(),
        }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? 'שגיאה בבקשת הליווי');
      }
      const data = (await res.json()) as Session;
      setSession(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'שגיאה בבקשת הליווי');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(getApiUrl(`safe-zone/${session._id}/complete`), {
        method: 'PATCH',
        headers: getApiHeaders(),
      });
      if (!res.ok) throw new Error('שגיאה בסיום הליווי');
      const data = (await res.json()) as Session;
      setSession(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'שגיאה בסיום הליווי');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!session) return;
    setLoading(true);
    try {
      await fetch(getApiUrl(`safe-zone/${session._id}/fail`), {
        method: 'PATCH',
        headers: getApiHeaders(),
      });
    } catch { /* silent */ }
    setSession(null);
    setLoading(false);
  };

  return (
    <div className="safe-zone-page container py-5">
      <div className="card shadow-lg border-0">
        <div className="card-header text-center safe-zone-header">
          <h4 className="mb-0">
            <i className="fas fa-shield-alt me-2" aria-hidden="true" />
            Safe-Zone
          </h4>
        </div>
        <div className="card-body p-4">
          <p className="text-muted mb-4">
            ליווי מצלמות וירטואלי מהכניסה לבניין ועד לפתח הדירה. מיועד להורים לילדים ונשים שחוזרות מאוחר – המערכת עוקבת ומוודאת כניסה בשלום.
          </p>

          {error && (
            <div className="alert alert-danger" role="alert">{error}</div>
          )}

          {!session && (
            <div className="mb-3">
              <div className="mb-3">
                <label className="form-label" htmlFor="sz-name">שמך המלא</label>
                <input
                  id="sz-name"
                  type="text"
                  className="form-control"
                  value={residentName}
                  onChange={(e) => setResidentName(e.target.value)}
                  placeholder="ישראל ישראלי"
                  disabled={loading}
                />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="sz-apt">מספר דירה</label>
                <input
                  id="sz-apt"
                  type="text"
                  className="form-control"
                  value={apartmentNumber}
                  onChange={(e) => setApartmentNumber(e.target.value)}
                  placeholder="15"
                  disabled={loading}
                />
              </div>
              <button
                type="button"
                className="btn btn-lg w-100 safe-zone-btn"
                onClick={() => { void handleRequestEscort(); }}
                disabled={loading}
                aria-label="בקש ליווי מצלמות"
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                ) : (
                  <i className="fas fa-play me-2" aria-hidden="true" />
                )}
                בקש ליווי
              </button>
            </div>
          )}

          {session?.status === 'requested' && (
            <div className="text-center py-3">
              <div className="spinner-border text-success" role="status" aria-label="ממתין">
                <span className="visually-hidden">ממתין...</span>
              </div>
              <p className="mt-2 mb-0 text-muted">הבקשה נשלחה – מתחבר למצלמות הבניין...</p>
              <button
                type="button"
                className="btn btn-sm btn-outline-danger mt-3"
                onClick={() => { void handleComplete(); }}
                disabled={loading}
              >
                <i className="fas fa-check me-1" aria-hidden="true" />
                הגעתי בשלום
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary mt-3 ms-2"
                onClick={() => { void handleCancel(); }}
                disabled={loading}
              >
                ביטול
              </button>
            </div>
          )}

          {session?.status === 'active' && (
            <div className="text-center py-3">
              <i className="fas fa-eye fa-2x text-success mb-2" aria-hidden="true" />
              <p className="mb-0 fw-bold">הליווי פעיל</p>
              <p className="small text-muted">המצלמות עוקבות – לחץ כשהגעת לדלת</p>
              <button
                type="button"
                className="btn btn-success mt-3"
                onClick={() => { void handleComplete(); }}
                disabled={loading}
              >
                <i className="fas fa-check me-2" aria-hidden="true" />
                הגעתי בשלום
              </button>
            </div>
          )}

          {session?.status === 'completed' && (
            <div className="text-center py-3">
              <i className="fas fa-check-circle fa-2x text-success mb-2" aria-hidden="true" />
              <p className="mb-0 fw-bold">נכנסת בשלום</p>
              <p className="small text-muted">הליווי הושלם. הבניין מאובטח.</p>
              <button
                type="button"
                className="btn btn-outline-primary mt-3"
                onClick={() => { setSession(null); setResidentName(''); setApartmentNumber(''); }}
              >
                ליווי חדש
              </button>
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
