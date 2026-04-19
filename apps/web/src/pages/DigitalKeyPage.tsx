/**
 * Digital Key — generate one-time access tokens for contractors.
 * Shows QR-style code (text-based) + expiry countdown.
 */
import React, { useState, useEffect } from 'react';
import './DigitalKeyPage.css';
import { getApiUrl, getApiHeaders } from '../api';

interface GeneratedKey {
  _id: string;
  token: string;
  expiresAt: string;
  purpose: string;
  apartmentNumber: string;
  ttlHours: number;
}

function msToHMS(ms: number): string {
  if (ms <= 0) return 'פג תוקף';
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1_000);
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const DigitalKeyPage: React.FC = () => {
  const [residentName, setResidentName] = useState('');
  const [apartmentNumber, setApartmentNumber] = useState('');
  const [purpose, setPurpose] = useState('');
  const [ttlHours, setTtlHours] = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedKey, setGeneratedKey] = useState<GeneratedKey | null>(null);
  const [remaining, setRemaining] = useState<number>(0);

  // Countdown timer
  useEffect(() => {
    if (!generatedKey) return;
    const interval = setInterval(() => {
      const ms = new Date(generatedKey.expiresAt).getTime() - Date.now();
      setRemaining(ms);
      if (ms <= 0) clearInterval(interval);
    }, 1000);
    setRemaining(new Date(generatedKey.expiresAt).getTime() - Date.now());
    return () => clearInterval(interval);
  }, [generatedKey]);

  const handleGenerate = async () => {
    if (!residentName.trim() || !apartmentNumber.trim() || !purpose.trim()) {
      setError('כל השדות חובה');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(getApiUrl('digital-key/generate'), {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({
          residentName: residentName.trim(),
          apartmentNumber: apartmentNumber.trim(),
          purpose: purpose.trim(),
          ttlHours,
        }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? 'שגיאה ביצירת המפתח');
      }
      const data = (await res.json()) as GeneratedKey;
      setGeneratedKey(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'שגיאה');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!generatedKey) return;
    try {
      await fetch(getApiUrl(`digital-key/${generatedKey._id}/revoke`), {
        method: 'DELETE',
        headers: getApiHeaders(),
      });
    } catch { /* silent */ }
    setGeneratedKey(null);
  };

  return (
    <div className="container py-4 digital-key-container" dir="rtl">
      <h3 className="fw-bold mb-2">
        <i className="fas fa-key me-2 text-warning" aria-hidden="true" />
        מפתח דיגיטלי
      </h3>
      <p className="text-muted mb-4">
        צור קוד גישה חד-פעמי לבעל מקצוע – בתוקף עד {ttlHours} שעות, נצרב עם השימוש.
      </p>

      {error && <div className="alert alert-danger">{error}</div>}

      {!generatedKey ? (
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label" htmlFor="dk-name">שמך המלא</label>
              <input
                id="dk-name"
                type="text"
                className="form-control"
                value={residentName}
                onChange={(e) => setResidentName(e.target.value)}
                placeholder="ישראל ישראלי"
                disabled={loading}
              />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="dk-apt">מספר דירה</label>
              <input
                id="dk-apt"
                type="text"
                className="form-control"
                value={apartmentNumber}
                onChange={(e) => setApartmentNumber(e.target.value)}
                placeholder="15"
                disabled={loading}
              />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="dk-purpose">מטרת הגישה</label>
              <input
                id="dk-purpose"
                type="text"
                className="form-control"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="כניסה לתיקון ברז"
                disabled={loading}
              />
            </div>
            <div className="mb-4">
              <label className="form-label" htmlFor="dk-ttl">
                תוקף (שעות): {ttlHours}
              </label>
              <input
                id="dk-ttl"
                type="range"
                className="form-range"
                min={1}
                max={24}
                value={ttlHours}
                onChange={(e) => setTtlHours(Number(e.target.value))}
                disabled={loading}
              />
            </div>
            <button
              type="button"
              className="btn btn-warning w-100 fw-bold"
              onClick={() => { void handleGenerate(); }}
              disabled={loading}
              aria-label="צור מפתח"
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
              ) : (
                <i className="fas fa-key me-2" aria-hidden="true" />
              )}
              צור מפתח
            </button>
          </div>
        </div>
      ) : (
        <div className="card shadow-lg border-warning">
          <div className="card-header bg-warning text-dark fw-bold text-center">
            <i className="fas fa-key me-2" aria-hidden="true" />
            קוד גישה חד-פעמי
          </div>
          <div className="card-body text-center">
            <div
              className="display-3 fw-bold letter-spacing-2 py-3 bg-light rounded mb-3 user-select-all digital-key-code"
              aria-label={`קוד גישה: ${generatedKey.token}`}
            >
              {generatedKey.token}
            </div>
            <p className="mb-1 text-muted small">
              <i className="fas fa-home me-1" aria-hidden="true" />
              דירה {generatedKey.apartmentNumber}
            </p>
            <p className="mb-1 text-muted small">
              <i className="fas fa-info-circle me-1" aria-hidden="true" />
              {generatedKey.purpose}
            </p>
            <div className={`fs-5 fw-bold mt-3 ${remaining > 0 ? 'text-success' : 'text-danger'}`}>
              <i className="fas fa-clock me-1" aria-hidden="true" />
              {msToHMS(remaining)}
            </div>
            <p className="text-muted small mt-1">זמן שנותר לפקיעת תוקף</p>

            <div className="d-flex gap-2 justify-content-center mt-3">
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={() => { void handleRevoke(); }}
                aria-label="בטל מפתח"
              >
                <i className="fas fa-ban me-1" aria-hidden="true" />
                בטל מפתח
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setGeneratedKey(null)}
                aria-label="צור מפתח חדש"
              >
                <i className="fas fa-plus me-1" aria-hidden="true" />
                מפתח חדש
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalKeyPage;
