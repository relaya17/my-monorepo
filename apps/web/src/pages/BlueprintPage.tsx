/**
 * Building Blueprint — floor plan viewer.
 * Admin can create blueprints (by URL); all users can view them.
 */
import React, { useEffect, useState } from 'react';
import './BlueprintPage.css';
import { getApiUrl, getApiHeaders } from '../api';

interface Blueprint {
  _id: string;
  name: string;
  fileUrl: string;
  mimeType: string;
  floor: number;
  uploadedByName: string;
  notes?: string;
  createdAt: string;
}

const BlueprintPage: React.FC = () => {
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [selected, setSelected] = useState<Blueprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Admin form state
  const [form, setForm] = useState({
    name: '',
    fileUrl: '',
    mimeType: 'application/pdf',
    floor: 0,
    uploadedByName: '',
    notes: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isAdmin = localStorage.getItem('isAdminLoggedIn') === 'true';

  const loadBlueprints = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(getApiUrl('blueprints'), { headers: getApiHeaders() });
      if (!res.ok) throw new Error('שגיאה בטעינת התוכניות');
      const data = (await res.json()) as Blueprint[];
      setBlueprints(data);
      if (data.length > 0 && !selected) setSelected(data[0]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'שגיאה');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadBlueprints(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      const res = await fetch(getApiUrl('blueprints'), {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({
          name: form.name.trim(),
          fileUrl: form.fileUrl.trim(),
          mimeType: form.mimeType,
          floor: Number(form.floor),
          uploadedByName: form.uploadedByName.trim(),
          notes: form.notes.trim(),
        }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? 'שגיאה ביצירה');
      }
      setShowForm(false);
      setForm({ name: '', fileUrl: '', mimeType: 'application/pdf', floor: 0, uploadedByName: '', notes: '' });
      await loadBlueprints();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'שגיאה');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('למחוק תוכנית זו?')) return;
    try {
      await fetch(getApiUrl(`blueprints/${id}`), {
        method: 'DELETE',
        headers: getApiHeaders(),
      });
      if (selected?._id === id) setSelected(null);
      await loadBlueprints();
    } catch { /* silent */ }
  };

  return (
    <div className="container-fluid py-4" dir="rtl">
      <div className="d-flex align-items-center mb-4 gap-3">
        <h3 className="mb-0 fw-bold">
          <i className="fas fa-drafting-compass me-2 text-primary" aria-hidden="true" />
          תוכניות בניין
        </h3>
        {isAdmin && (
          <button
            type="button"
            className="btn btn-primary btn-sm ms-auto"
            onClick={() => setShowForm(!showForm)}
            aria-label="הוסף תוכנית"
          >
            <i className="fas fa-plus me-1" aria-hidden="true" />
            הוסף תוכנית
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Admin form */}
      {isAdmin && showForm && (
        <div className="card shadow-sm mb-4">
          <div className="card-header">הוספת תוכנית קומה</div>
          <div className="card-body">
            {formError && <div className="alert alert-danger">{formError}</div>}
            <form onSubmit={(e) => { void handleCreate(e); }}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="bp-name">שם התוכנית</label>
                  <input
                    id="bp-name"
                    type="text"
                    className="form-control"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="bp-uploader">שם המעלה</label>
                  <input
                    id="bp-uploader"
                    type="text"
                    className="form-control"
                    value={form.uploadedByName}
                    onChange={(e) => setForm({ ...form, uploadedByName: e.target.value })}
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label" htmlFor="bp-url">קישור לקובץ (Cloudinary/S3)</label>
                  <input
                    id="bp-url"
                    type="url"
                    className="form-control"
                    value={form.fileUrl}
                    onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label" htmlFor="bp-mime">סוג קובץ</label>
                  <select
                    id="bp-mime"
                    className="form-select"
                    value={form.mimeType}
                    onChange={(e) => setForm({ ...form, mimeType: e.target.value })}
                  >
                    <option value="application/pdf">PDF</option>
                    <option value="image/png">PNG</option>
                    <option value="image/jpeg">JPEG</option>
                    <option value="image/svg+xml">SVG</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label" htmlFor="bp-floor">קומה</label>
                  <input
                    id="bp-floor"
                    type="number"
                    className="form-control"
                    value={form.floor}
                    onChange={(e) => setForm({ ...form, floor: Number(e.target.value) })}
                    min={-10}
                    max={100}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label" htmlFor="bp-notes">הערות</label>
                  <input
                    id="bp-notes"
                    type="text"
                    className="form-control"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="אופציונלי"
                  />
                </div>
              </div>
              <div className="d-flex gap-2 mt-3">
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                  ) : null}
                  שמור
                </button>
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowForm(false)}>
                  ביטול
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="row g-4">
        {/* Floor list */}
        <div className="col-12 col-lg-3">
          <div className="list-group">
            {loading && (
              <div className="list-group-item text-center text-muted">
                <div className="spinner-border spinner-border-sm me-2" role="status" aria-label="טוען">
                  <span className="visually-hidden">טוען...</span>
                </div>
                טוען תוכניות...
              </div>
            )}
            {!loading && blueprints.length === 0 && (
              <div className="list-group-item text-muted text-center">אין תוכניות עדיין</div>
            )}
            {blueprints.map((bp) => (
              <div
                key={bp._id}
                className={`list-group-item d-flex align-items-center justify-content-between ${
                  selected?._id === bp._id ? 'active' : ''
                }`}
              >
                <button
                  type="button"
                  className="btn btn-link text-start flex-grow-1 p-0 text-decoration-none text-reset"
                  onClick={() => setSelected(bp)}
                  aria-label={`בחר תוכנית ${bp.name}`}
                >
                  <div className="fw-semibold">{bp.name}</div>
                  <div className="small opacity-75">קומה {bp.floor}</div>
                </button>
                {isAdmin && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger ms-2"
                    onClick={(e) => { e.stopPropagation(); void handleDelete(bp._id); }}
                    aria-label={`מחק ${bp.name}`}
                  >
                    <i className="fas fa-trash" aria-hidden="true" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Viewer */}
        <div className="col-12 col-lg-9">
          {selected ? (
            <div className="card shadow-sm h-100">
              <div className="card-header d-flex align-items-center gap-2">
                <span className="fw-bold">{selected.name}</span>
                <span className="badge bg-secondary">קומה {selected.floor}</span>
                <span className="text-muted small ms-auto">הועלה ע"י {selected.uploadedByName}</span>
              </div>
              <div className="card-body p-0 blueprint-viewer-body">
                {selected.mimeType === 'application/pdf' ? (
                  <iframe
                    src={selected.fileUrl}
                    title={selected.name}
                    className="blueprint-iframe"
                    aria-label={`תוכנית ${selected.name}`}
                  />
                ) : (
                  <img
                    src={selected.fileUrl}
                    alt={selected.name}
                    className="img-fluid blueprint-img"
                  />
                )}
              </div>
              {selected.notes && (
                <div className="card-footer text-muted small">
                  <i className="fas fa-sticky-note me-1" aria-hidden="true" />
                  {selected.notes}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-muted py-5">
              <i className="fas fa-drafting-compass fa-3x mb-3 d-block" aria-hidden="true" />
              בחר תוכנית מהרשימה לצפייה
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlueprintPage;
