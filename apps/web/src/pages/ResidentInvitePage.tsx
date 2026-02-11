/**
 * הזמנת דיירים – שליחת מייל onboarding לרשימה.
 * POST /api/residents/invite-bulk
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ROUTES from '../routs/routes';
import { getApiUrl, getApiHeaders, getBuildingId, buildingLabel } from '../api';
import { safeGetItem } from '../utils/safeStorage';

type ResidentRow = { name: string; email: string; apartment: string };

const ResidentInvitePage: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<ResidentRow[]>([{ name: '', email: '', apartment: '' }]);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<{ sent?: number; total?: number; failed?: number }>({});

  const buildingId = getBuildingId();

  const addRow = () => setRows((r) => [...r, { name: '', email: '', apartment: '' }]);
  const removeRow = (i: number) => setRows((r) => r.filter((_, idx) => idx !== i));
  const updateRow = (i: number, field: keyof ResidentRow, val: string) =>
    setRows((r) => r.map((x, idx) => (idx === i ? { ...x, [field]: val } : x)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isAdmin = safeGetItem('isAdminLoggedIn');
    if (!isAdmin) {
      navigate(ROUTES.ADMIN_LOGIN);
      return;
    }

    const residents = rows
      .map((r) => ({ name: r.name.trim(), email: r.email.trim(), apartment: r.apartment.trim() }))
      .filter((r) => r.email && r.email.includes('@'));

    if (residents.length === 0) {
      setStatus('error');
      setResult({});
      return;
    }

    setStatus('sending');
    setResult({});
    try {
      const res = await fetch(getApiUrl('residents/invite-bulk'), {
        method: 'POST',
        headers: { ...getApiHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ residents }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus('success');
        setResult({ sent: data.sent, total: data.total, failed: data.failed });
        setRows([{ name: '', email: '', apartment: '' }]);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', direction: 'rtl', padding: '2rem', backgroundColor: '#f8f9fa' }}>
      <div className="container" style={{ maxWidth: '700px' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>
            <i className="fas fa-envelope me-2" aria-hidden="true" />
            הזמנת דיירים – שליחת מייל Welcome
          </h1>
          <Link to={ROUTES.ADMIN_DASHBOARD} className="btn btn-outline-secondary">
            <i className="fas fa-arrow-right me-1" aria-hidden="true" />
            חזרה
          </Link>
        </div>

        <p className="text-muted mb-4">
          בניין: <strong>{buildingLabel(buildingId)}</strong> – המיילים יישלחו עם קישור להורדת האפליקציה.
        </p>

        <form onSubmit={handleSubmit} className="card shadow-sm">
          <div className="card-body">
            {rows.map((r, i) => (
              <div key={i} className="row g-2 mb-2 align-items-end">
                <div className="col-md-3">
                  <label className="form-label small">שם</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="ישראל ישראלי"
                    value={r.name}
                    onChange={(e) => updateRow(i, 'name', e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label small">אימייל *</label>
                  <input
                    type="email"
                    className="form-control form-control-sm"
                    placeholder="email@example.com"
                    value={r.email}
                    onChange={(e) => updateRow(i, 'email', e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label small">דירה</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="12"
                    value={r.apartment}
                    onChange={(e) => updateRow(i, 'apartment', e.target.value)}
                  />
                </div>
                <div className="col-md-2">
                  {rows.length > 1 ? (
                    <button type="button" className="btn btn-outline-danger btn-sm w-100" onClick={() => removeRow(i)}>
                      <i className="fas fa-trash" aria-hidden="true" />
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
            <div className="mt-2">
              <button type="button" className="btn btn-outline-primary btn-sm" onClick={addRow}>
                <i className="fas fa-plus me-1" aria-hidden="true" />
                הוסף שורה
              </button>
            </div>
            {status === 'success' && (
              <div className="alert alert-success mt-3 mb-0">
                {result.sent} מיילים נשלחו בהצלחה
                {result.failed ? ` (${result.failed} נכשלו)` : ''}
              </div>
            )}
            {status === 'error' && (
              <div className="alert alert-danger mt-3 mb-0">
                שגיאה בשליחה. וודא שיש אימיילים תקינים.
              </div>
            )}
            <div className="mt-4">
              <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
                {status === 'sending' ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                    שולח...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane me-2" aria-hidden="true" />
                    שלח מיילי הזמנה
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        <p className="text-muted small mt-3">
          דרוש RESEND_API_KEY ב־API. המייל מכיל קישור להורדת האפליקציה והפעלת חשבון.
        </p>
      </div>
    </div>
  );
};

export default ResidentInvitePage;
