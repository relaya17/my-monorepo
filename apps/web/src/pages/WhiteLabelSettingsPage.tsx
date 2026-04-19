/**
 * White Label Settings — Admin UI for building branding.
 * Connects to PATCH /api/buildings/branding
 * GET /api/buildings/branding?buildingId=xxx
 */
import React, { useState, useEffect } from 'react';
import { getApiUrl, getApiHeaders } from '../api';
import './WhiteLabelSettingsPage.css';

interface Branding {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  customDomain?: string;
}

const HEX_RE = /^#([A-Fa-f0-9]{6})$/;

function isValidHex(val: string): boolean {
  return !val || HEX_RE.test(val);
}

const WhiteLabelSettingsPage: React.FC = () => {
  const [buildingId, setBuildingId] = useState('');
  const [form, setForm] = useState<Branding>({
    logoUrl: '',
    primaryColor: '#1a56db',
    secondaryColor: '#7e3af2',
    customDomain: '',
  });
  const [original, setOriginal] = useState<Branding | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('buildingId') ?? 'default';
    setBuildingId(stored);
    void loadBranding(stored);
  }, []);

  const loadBranding = async (bid: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(getApiUrl(`buildings/branding?buildingId=${encodeURIComponent(bid)}`), {
        headers: getApiHeaders(),
      });
      if (!res.ok) throw new Error('שגיאה בטעינת הנתונים');
      const data = (await res.json()) as { branding?: Branding };
      const b = data.branding ?? {};
      setOriginal(b);
      setForm({
        logoUrl: b.logoUrl ?? '',
        primaryColor: b.primaryColor ?? '#1a56db',
        secondaryColor: b.secondaryColor ?? '#7e3af2',
        customDomain: b.customDomain ?? '',
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'שגיאה');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.primaryColor && !isValidHex(form.primaryColor)) {
      setError('צבע ראשי חייב להיות בפורמט #RRGGBB');
      return;
    }
    if (form.secondaryColor && !isValidHex(form.secondaryColor)) {
      setError('צבע משני חייב להיות בפורמט #RRGGBB');
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const body: Record<string, string> = {};
      if (form.logoUrl?.trim()) body.logoUrl = form.logoUrl.trim();
      if (form.primaryColor?.trim()) body.primaryColor = form.primaryColor.trim();
      if (form.secondaryColor?.trim()) body.secondaryColor = form.secondaryColor.trim();
      if (form.customDomain?.trim()) body.customDomain = form.customDomain.trim();

      const res = await fetch(getApiUrl('buildings/branding'), {
        method: 'PATCH',
        headers: getApiHeaders(),
        body: JSON.stringify({ ...body, buildingId }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? 'שגיאה בשמירה');
      }
      const data = (await res.json()) as { branding: Branding };
      setOriginal(data.branding);
      setSuccess(true);

      // Apply preview instantly
      applyBrandingToDOM(data.branding);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (original) {
      setForm({
        logoUrl: original.logoUrl ?? '',
        primaryColor: original.primaryColor ?? '#1a56db',
        secondaryColor: original.secondaryColor ?? '#7e3af2',
        customDomain: original.customDomain ?? '',
      });
      setError(null);
    }
  };

  return (
    <div className="container py-4 wl-settings-container" dir="rtl">
      <div className="d-flex align-items-center mb-4 gap-3">
        <h3 className="mb-0 fw-bold">
          <i className="fas fa-paint-brush me-2 text-primary" aria-hidden="true" />
          White Label – מיתוג בניין
        </h3>
      </div>

      <div className="row g-4">
        {/* Form */}
        <div className="col-12 col-lg-7">
          <div className="card shadow-sm">
            <div className="card-header fw-semibold">הגדרות מיתוג</div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              {success && (
                <div className="alert alert-success d-flex align-items-center gap-2">
                  <i className="fas fa-check-circle" aria-hidden="true" />
                  מיתוג עודכן בהצלחה
                </div>
              )}
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border" role="status" aria-label="טוען">
                    <span className="visually-hidden">טוען...</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={(e) => { void handleSave(e); }}>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="wl-logo">לוגו (URL)</label>
                    <input
                      id="wl-logo"
                      type="url"
                      className="form-control"
                      value={form.logoUrl ?? ''}
                      onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                      placeholder="https://cdn.example.com/logo.png"
                      disabled={saving}
                    />
                    <div className="form-text">קישור ישיר לתמונת הלוגו (Cloudinary / S3 מומלץ)</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label" htmlFor="wl-primary">צבע ראשי</label>
                    <div className="input-group">
                      <input
                        id="wl-primary"
                        type="color"
                        className="form-control form-control-color"
                        value={form.primaryColor ?? '#1a56db'}
                        onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                        disabled={saving}
                        aria-label="בחר צבע ראשי"
                      />
                      <input
                        type="text"
                        className="form-control"
                        value={form.primaryColor ?? ''}
                        onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                        placeholder="#1a56db"
                        pattern="^#[A-Fa-f0-9]{6}$"
                        disabled={saving}
                        aria-label="ערך HEX צבע ראשי"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label" htmlFor="wl-secondary">צבע משני</label>
                    <div className="input-group">
                      <input
                        id="wl-secondary"
                        type="color"
                        className="form-control form-control-color"
                        value={form.secondaryColor ?? '#7e3af2'}
                        onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                        disabled={saving}
                        aria-label="בחר צבע משני"
                      />
                      <input
                        type="text"
                        className="form-control"
                        value={form.secondaryColor ?? ''}
                        onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                        placeholder="#7e3af2"
                        pattern="^#[A-Fa-f0-9]{6}$"
                        disabled={saving}
                        aria-label="ערך HEX צבע משני"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label" htmlFor="wl-domain">דומיין מותאם (Custom Domain)</label>
                    <input
                      id="wl-domain"
                      type="text"
                      className="form-control"
                      value={form.customDomain ?? ''}
                      onChange={(e) => setForm({ ...form, customDomain: e.target.value })}
                      placeholder="building123.vantera.co.il"
                      disabled={saving}
                    />
                    <div className="form-text">אופציונלי – צור CNAME אצל ספק הדומיין שלך</div>
                  </div>

                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? (
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                      ) : (
                        <i className="fas fa-save me-2" aria-hidden="true" />
                      )}
                      שמור
                    </button>
                    <button type="button" className="btn btn-outline-secondary" onClick={handleReset} disabled={saving}>
                      <i className="fas fa-undo me-1" aria-hidden="true" />
                      אפס
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Live preview */}
        <div className="col-12 col-lg-5">
          <div className="card shadow-sm">
            <div className="card-header fw-semibold">תצוגה מקדימה</div>
            <div className="card-body wl-preview-body">
              <div
                className="wl-preview-header"
                data-color={form.primaryColor ?? '#1a56db'}
                ref={(el) => { if (el) el.style.backgroundColor = form.primaryColor ?? '#1a56db'; }}
                aria-hidden="true"
              >
                {form.logoUrl ? (
                  <img src={form.logoUrl} alt="לוגו" className="wl-preview-logo" />
                ) : (
                  <span className="wl-preview-logo-placeholder">LOGO</span>
                )}
                <span className="wl-preview-title">שם הבניין</span>
              </div>
              <div
                className="wl-preview-button"
                ref={(el) => { if (el) el.style.backgroundColor = form.secondaryColor ?? '#7e3af2'; }}
                aria-hidden="true"
              >
                כפתור ראשי
              </div>
              {form.customDomain && (
                <div className="wl-preview-domain text-muted small mt-2">
                  <i className="fas fa-globe me-1" aria-hidden="true" />
                  {form.customDomain}
                </div>
              )}
            </div>
          </div>

          <div className="card shadow-sm mt-3">
            <div className="card-header fw-semibold">בניין</div>
            <div className="card-body">
              <div className="text-muted small">
                <i className="fas fa-building me-1" aria-hidden="true" />
                מזהה: <code>{buildingId}</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Apply branding CSS variables to DOM root immediately (no page reload needed) */
function applyBrandingToDOM(branding: Branding): void {
  const root = document.documentElement;
  if (branding.primaryColor) root.style.setProperty('--wl-primary', branding.primaryColor);
  if (branding.secondaryColor) root.style.setProperty('--wl-secondary', branding.secondaryColor);
}

export { applyBrandingToDOM };
export default WhiteLabelSettingsPage;
