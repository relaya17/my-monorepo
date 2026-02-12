/**
 * דף דיווח תקלה – טופס ייעודי לדיירים
 * Locale-aware: US gets Dishwasher, Garbage Disposal; dates/units per locale
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequestJson } from '../api';
import { safeGetItem } from '../utils/safeStorage';
import { useLocale } from '../i18n/useLocale';
import { useTranslation } from '../i18n/useTranslation';
import ROUTES from '../routs/routes';
import './ReportFaultPage.css';

const BASE_CATEGORIES = [
  { value: 'Plumbing', labelHe: 'אינסטלציה', labelEn: 'Plumbing', icon: 'fa-faucet' },
  { value: 'Electrical', labelHe: 'חשמל', labelEn: 'Electrical', icon: 'fa-bolt' },
  { value: 'Elevator', labelHe: 'מעלית', labelEn: 'Elevator', icon: 'fa-arrow-up' },
  { value: 'Cleaning', labelHe: 'ניקיון', labelEn: 'Cleaning', icon: 'fa-broom' },
  { value: 'Security', labelHe: 'אבטחה', labelEn: 'Security', icon: 'fa-shield-alt' },
];

/** US-only: common in American apartments */
const US_APPLIANCES = [
  { value: 'Dishwasher', labelHe: 'מדיח כלים', labelEn: 'Dishwasher', icon: 'fa-blender' },
  { value: 'GarbageDisposal', labelHe: 'טוחן אשפה', labelEn: 'Garbage Disposal', icon: 'fa-recycle' },
];

const OTHER_CATEGORY = { value: 'Other', labelHe: 'אחר', labelEn: 'Other', icon: 'fa-tools' };

const PRIORITIES = [
  { value: 'Low', label: 'נמוך' },
  { value: 'Medium', label: 'בינוני' },
  { value: 'High', label: 'גבוה' },
  { value: 'Urgent', label: 'דחוף' },
];

const ReportFaultPage: React.FC = () => {
  const navigate = useNavigate();
  const { locale, flags } = useLocale();
  const { lang } = useTranslation();
  const isRtl = lang === 'he' || lang === 'ar';

  const CATEGORIES = [
    ...BASE_CATEGORIES,
    ...(flags.americanAppliances ? US_APPLIANCES : []),
    OTHER_CATEGORY,
  ].map((c) => ({ value: c.value, label: isRtl ? c.labelHe : c.labelEn, icon: c.icon }));
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Plumbing');
  const [priority, setPriority] = useState('Medium');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [needAuth, setNeedAuth] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const isUser = localStorage.getItem('isUserLoggedIn') === 'true';
    if (!token || !isUser) setNeedAuth(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { response, data } = await apiRequestJson<{ _id?: string; error?: string; duplicateAlert?: boolean }>('maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim() || 'דיווח תקלה',
          description: description.trim(),
          category,
          priority,
          source: 'RESIDENT',
          reporterId: safeGetItem('userId') || undefined,
        }),
      });
      if (response.ok) {
        setSuccess(true);
        setTitle('');
        setDescription('');
      } else {
        setError((data as { error?: string })?.error ?? 'שגיאה בשליחת הדיווח');
      }
    } catch {
      setError('שגיאה בחיבור לשרת');
    } finally {
      setSubmitting(false);
    }
  };

  if (needAuth) {
    return (
      <div className="report-fault-page">
        <div className="report-fault-card">
          <h2>נדרשת התחברות</h2>
          <p>כדי לדווח על תקלה, יש להתחבר תחילה כדייר.</p>
          <button type="button" className="btn btn-primary" onClick={() => navigate(ROUTES.USER_LOGIN)}>
            התחבר
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="report-fault-page">
      <div className="report-fault-card">
        <h2>
          <i className="fas fa-tools me-2" aria-hidden />
          דיווח תקלה
        </h2>
        <p className="report-fault-intro">תארו את התקלה ונוכל לטפל בה במהירות.</p>

        {success ? (
          <div className="alert alert-success">
            <i className="fas fa-check-circle me-2" />
            הדיווח נשלח בהצלחה! צוות התחזוקה יטופל בכך.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="category" className="form-label">
                סוג התקלה
              </label>
              <select
                id="category"
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="priority" className="form-label">
                רמת דחיפות
              </label>
              <select
                id="priority"
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="title" className="form-label">
                כותרת קצרה
              </label>
              <input
                id="title"
                type="text"
                className="form-control"
                placeholder="למשל: נזילה בכיור המטבח"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="form-label">
                תיאור מפורט *
              </label>
              <textarea
                id="description"
                className="form-control"
                rows={4}
                placeholder="תארו את התקלה בפירוט..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="alert alert-danger mb-3" role="alert">
                {error}
              </div>
            )}
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={submitting || !description.trim()}>
                {submitting ? 'שולח...' : 'שלח דיווח'}
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(ROUTES.RESIDENT_HOME)}>
                חזרה
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportFaultPage;
