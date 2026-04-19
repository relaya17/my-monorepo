/**
 * CEO Dashboard מאוחד – סטטיסטיקות גלובליות, מעקב הורדות, יומן פעילות, Anomaly Feed,
 * Security Pulse (Vision KPIs + critical events table).
 * מוצג רק ל-super-admin.
 */
import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ROUTES from '../routs/routes';
import { apiRequestJson } from '../api';
import { safeGetItem } from '../utils/safeStorage';
import ChainAuditor from '../components/ChainAuditor';
import './SuperAdminDashboard.css';

/** Play subtle alert sound for new Real Estate lead (demo). */
function playNewLeadSound(): void {
  try {
    const ctx = typeof AudioContext !== 'undefined' ? new AudioContext() : null;
    if (ctx) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch {
    /* ignore */
  }
}

type GlobalStats = { totalRevenue?: number; activeBuildings?: number; totalMoneySaved?: number; preventedFailures?: number };
type AdoptionItem = { buildingId: string; buildingName: string; appDownloadedCount: number };
type AdoptionData = { items: AdoptionItem[]; total: number };
type AuditLog = { _id?: string; timestamp?: string; action?: string; [k: string]: unknown };
type ActivityData = { logs: AuditLog[]; total: number; page: number; totalPages: number };
type VisionItem = { id: string; buildingId?: string; cameraId?: string; eventType?: string; timestamp?: string; resolved?: boolean; thumbnailUrl?: string; confidence?: number };
type VisionData = { items: VisionItem[] };
type LedgerBuilding = { buildingId: string; buildingName: string; totalIncome: number; totalExpense: number; transactionCount: number };
type LedgerData = { items: LedgerBuilding[] };
type VendorAlert = { contractorName?: string; buildingId?: string; avgRating?: number; count?: number };
type VendorAlertsData = { alerts: VendorAlert[]; threshold?: number };
type RealEstateLeadItem = { id: string; apartmentNumber: string; residentName: string; residentEmail: string; residentPhone?: string; dealType: string; status: string; buildingId: string; buildingName: string; createdAt?: string };
type RealEstateData = { items: RealEstateLeadItem[]; countThisMonth?: number };

interface SecurityPulseStats {
  totalEvents: number;
  unrecognizedStrangers: number;
  childrenArrivals: number;
  criticalAlerts: number;
}
interface SecurityCriticalEvent {
  id: string;
  buildingId: string;
  buildingName: string;
  floor: number;
  floorLabel?: string;
  type: string;
  securityLevel: string;
  cameraId: string;
  timestamp: string;
  resolved: boolean;
}
type SecurityPulseData = { stats: SecurityPulseStats; recentCriticalEvents: SecurityCriticalEvent[] };

const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [adoption, setAdoption] = useState<AdoptionData | null>(null);
  const [activity, setActivity] = useState<ActivityData | null>(null);
  const [vision, setVision] = useState<VisionData | null>(null);
  const [ledger, setLedger] = useState<LedgerData | null>(null);
  const [vendorAlerts, setVendorAlerts] = useState<VendorAlertsData | null>(null);
  const [realEstateLeads, setRealEstateLeads] = useState<RealEstateData | null>(null);
  const [securityPulse, setSecurityPulse] = useState<SecurityPulseData | null>(null);
  const [newLeadToast, setNewLeadToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const isAdmin = safeGetItem('isAdminLoggedIn');
    const role = safeGetItem('adminRole');
    if (!isAdmin || role !== 'super-admin') {
      navigate(ROUTES.ADMIN_DASHBOARD);
      return;
    }

    const fetchAll = async () => {
      setLoading(true);
      setError('');
      try {
        const [statsRes, adoptionRes, activityRes, visionRes, ledgerRes, vendorRes, realEstateRes, pulseRes] = await Promise.all([
          apiRequestJson<GlobalStats>('super-admin/global-stats'),
          apiRequestJson<AdoptionData>('super-admin/resident-adoption'),
          apiRequestJson<ActivityData>('super-admin/activity-stream?limit=10'),
          apiRequestJson<VisionData>('super-admin/vision-logs?limit=20'),
          apiRequestJson<LedgerData>('super-admin/global-ledger?limit=50'),
          apiRequestJson<VendorAlertsData>('super-admin/vendor-alerts'),
          apiRequestJson<RealEstateData>('super-admin/real-estate-leads?limit=20'),
          apiRequestJson<SecurityPulseData>('super-admin/global-security-pulse'),
        ]);

        if (statsRes.response.ok) setStats(statsRes.data ?? null);
        if (adoptionRes.response.ok) setAdoption(adoptionRes.data ?? null);
        if (activityRes.response.ok) setActivity(activityRes.data ?? null);
        if (visionRes.response.ok) setVision(visionRes.data ?? null);
        if (ledgerRes.response.ok) setLedger(ledgerRes.data ?? null);
        if (vendorRes.response.ok) setVendorAlerts(vendorRes.data ?? null);
        if (realEstateRes.response.ok) setRealEstateLeads(realEstateRes.data ?? null);
        if (pulseRes.response.ok) setSecurityPulse(pulseRes.data ?? null);

        if (!statsRes.response.ok && statsRes.response.status === 403) setError('אין הרשאה');
      } catch {
        setError('שגיאה בחיבור לשרת');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [navigate]);

  const prevLeadCountRef = useRef(0);
  useEffect(() => {
    if (!realEstateLeads?.items?.length || loading) return;
    const count = realEstateLeads.items.length;
    if (count > prevLeadCountRef.current && prevLeadCountRef.current > 0) {
      playNewLeadSound();
      const latest = realEstateLeads.items[0];
      setNewLeadToast(latest ? `ליד חדש – דירה ${latest.apartmentNumber || '?'} (${latest.dealType === 'rent' ? 'השכרה' : 'מכירה'})` : 'ליד נדל"ן חדש');
      setTimeout(() => setNewLeadToast(null), 6000);
    }
    prevLeadCountRef.current = count;
  }, [realEstateLeads?.items?.length, loading, realEstateLeads?.items]);

  const fetchRealEstateLeads = async () => {
    try {
      const { response, data } = await apiRequestJson<RealEstateData>('super-admin/real-estate-leads?limit=20');
      if (response.ok && data) setRealEstateLeads(data);
    } catch {
      /* ignore */
    }
  };
  useEffect(() => {
    const isAdmin = safeGetItem('isAdminLoggedIn');
    const role = safeGetItem('adminRole');
    if (!isAdmin || role !== 'super-admin') return;
    const interval = setInterval(fetchRealEstateLeads, 30000);
    return () => clearInterval(interval);
  }, []);

  const newestNewLead = realEstateLeads?.items?.find((l) => l.status === 'new');
  const countThisMonth = realEstateLeads?.countThisMonth ?? 0;

  return (
    <div className="super-admin-dashboard">
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>
            <i className="fas fa-crown me-2" aria-hidden="true" />
            לוח CEO
          </h1>
          <Link to={ROUTES.ADMIN_DASHBOARD} className="btn btn-outline-secondary">
            <i className="fas fa-arrow-right me-1" aria-hidden="true" />
            חזרה
          </Link>
        </div>

        {loading && <p className="text-muted">טוען...</p>}
        {error && <div className="alert alert-danger">{error}</div>}
        {newLeadToast && (
          <div
            className="alert alert-success d-flex align-items-center shadow position-fixed top-0 start-50 translate-middle-x mt-3 super-admin-toast"
            role="alert"
          >
            <i className="fas fa-bell me-2" aria-hidden />
            {newLeadToast}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* CEO Verification – 4 מוקדים */}
            <div className="card shadow-sm mb-4 border-primary">
              <div className="card-header bg-primary text-white">
                <strong>צ'קליסט אימות מנכ"לית – ארבעת המוקדים</strong>
              </div>
              <div className="card-body">
                <div className="row g-2">
                  <div className="col-md-6">
                    <Link to={ROUTES.REPORT_FAULT} className="text-decoration-none">
                      <div className="p-2 rounded bg-light border">
                        <strong>1. AI Peacekeeper</strong>
                        <small className="d-block text-muted">תקלה דומה → "התחבר לתקלה קיימת"</small>
                      </div>
                    </Link>
                  </div>
                  <div className="col-md-6">
                    <a href="#pulse" className="text-decoration-none">
                      <div className="p-2 rounded bg-light border">
                        <strong>2. The CEO View</strong>
                        <small className="d-block text-muted">Pulse • Anomaly Feed • Global Ledger (למעלה)</small>
                      </div>
                    </a>
                  </div>
                  <div className="col-md-6">
                    <Link to={ROUTES.REPAIR_TRACKING} className="text-decoration-none">
                      <div className="p-2 rounded bg-light border">
                        <strong>3. Technician Evidence</strong>
                        <small className="d-block text-muted">Evidence • הקלטה → מלאי</small>
                      </div>
                    </Link>
                  </div>
                  <div className="col-md-6">
                    <div className="p-2 rounded bg-light border">
                      <strong>4. Vision Control</strong>
                      <small className="d-block text-muted">לווין + מצלמה (Roadmap)</small>
                    </div>
                  </div>
                </div>
                <div className="mt-2 p-2 bg-light rounded small">
                  <strong>צ'קליסט לפני עלייה:</strong>
                  <ul className="mb-0 mt-1">
                    <li><strong>SSL</strong> – וידוא המנעול הירוק (HTTPS) בדפדפן</li>
                    <li><strong>טשטוש פנים</strong> – AI Vision מטשטש פנים בצילומים</li>
                    <li><strong>נחיתה &lt;2s</strong> – דף /landing נטען תוך פחות מ־2 שניות</li>
                  </ul>
                  <Link to={ROUTES.CEO_PRE_LAUNCH} className="btn btn-sm btn-outline-primary mt-2">
                    <i className="fas fa-clipboard-check me-1" aria-hidden />
                    פרטים והנחיות
                  </Link>
                </div>
              </div>
            </div>

            {/* סטטיסטיקות גלובליות */}
            <div className="row g-3 mb-4" id="pulse">
              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center">
                    <p className="text-muted mb-1">הכנסות כוללות</p>
                    <h4 className="text-primary">₪{Number(stats?.totalRevenue ?? 0).toLocaleString()}</h4>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center">
                    <p className="text-muted mb-1">בניינים פעילים</p>
                    <h4 className="text-success">{stats?.activeBuildings ?? 0}</h4>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center">
                    <p className="text-muted mb-1">חיסכון AI (₪)</p>
                    <h4 className="text-info">{Number(stats?.totalMoneySaved ?? 0).toLocaleString()}</h4>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center">
                    <p className="text-muted mb-1">תקלות שמונעו</p>
                    <h4 className="text-warning">{stats?.preventedFailures ?? 0}</h4>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-lg-2">
                <div className="card border-success shadow-sm h-100 super-admin-partner-card">
                  <div className="card-body text-center py-3">
                    <p className="text-muted mb-1 small">Partner Commission</p>
                    <h4 className="text-success mb-0">₪{countThisMonth * 10}</h4>
                    <small className="text-muted d-block mt-1">{countThisMonth} לידים × $10</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-4">
              {/* ── Chain Auditor — Hash-Chain Integrity ── */}
              <div className="col-12">
                <ChainAuditor />
              </div>

              {/* ── Security Pulse — CEO Bird's Eye View ── */}
              <div className="col-12">
                <div className="card shadow-sm border-danger">
                  <div className="card-header bg-danger bg-opacity-10 d-flex align-items-center gap-2">
                    <span className="super-admin-pulse-dot" aria-hidden="true" />
                    <strong>Security Pulse – מבט על בזמן אמת</strong>
                    {(securityPulse?.stats.criticalAlerts ?? 0) > 0 && (
                      <span className="badge bg-danger ms-auto">
                        {securityPulse?.stats.criticalAlerts} התראות פעילות
                      </span>
                    )}
                  </div>
                  <div className="card-body">
                    {/* KPI row */}
                    <div className="row g-3 mb-3">
                      <div className="col-6 col-md-3">
                        <div className="card border-0 bg-light text-center py-2">
                          <p className="text-muted small mb-1">סה"כ אירועים</p>
                          <h4 className="mb-0">{securityPulse?.stats.totalEvents ?? 0}</h4>
                        </div>
                      </div>
                      <div className="col-6 col-md-3">
                        <div className="card border-0 bg-danger bg-opacity-10 text-center py-2">
                          <p className="text-muted small mb-1">זרים שזוהו</p>
                          <h4 className="mb-0 text-danger">{securityPulse?.stats.unrecognizedStrangers ?? 0}</h4>
                        </div>
                      </div>
                      <div className="col-6 col-md-3">
                        <div className="card border-0 bg-success bg-opacity-10 text-center py-2">
                          <p className="text-muted small mb-1">הגעת ילדים</p>
                          <h4 className="mb-0 text-success">{securityPulse?.stats.childrenArrivals ?? 0}</h4>
                        </div>
                      </div>
                      <div className="col-6 col-md-3">
                        <div className="card border-0 bg-warning bg-opacity-10 text-center py-2">
                          <p className="text-muted small mb-1">התראות קריטיות</p>
                          <h4 className="mb-0 text-warning">{securityPulse?.stats.criticalAlerts ?? 0}</h4>
                        </div>
                      </div>
                    </div>

                    {/* Critical events table */}
                    {(securityPulse?.recentCriticalEvents ?? []).length === 0 ? (
                      <p className="text-muted mb-0 small">אין אירועי HIGH/CRITICAL פעילים – הכל תקין ✓</p>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-sm table-hover align-middle mb-0">
                          <thead className="table-light">
                            <tr>
                              <th>בניין</th>
                              <th>קומה</th>
                              <th>סוג אירוע</th>
                              <th>רמת אבטחה</th>
                              <th>מצלמה</th>
                              <th>זמן</th>
                              <th>סטטוס</th>
                            </tr>
                          </thead>
                          <tbody>
                            {securityPulse?.recentCriticalEvents.slice(0, 15).map((ev) => (
                              <tr key={ev.id}>
                                <td><strong>{ev.buildingName}</strong></td>
                                <td>{ev.floorLabel ?? `קומה ${ev.floor}`}</td>
                                <td>
                                  <span className={`badge ${ev.type === 'unauthorized_entry' || ev.type === 'loitering' ? 'bg-danger' : 'bg-secondary'}`}>
                                    {ev.type}
                                  </span>
                                </td>
                                <td>
                                  <span className={`badge ${ev.securityLevel === 'CRITICAL' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                                    {ev.securityLevel}
                                  </span>
                                </td>
                                <td className="text-muted small">{ev.cameraId}</td>
                                <td className="text-muted small">
                                  {new Date(ev.timestamp).toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' })}
                                </td>
                                <td>
                                  {ev.resolved
                                    ? <span className="text-success small">✓ טופל</span>
                                    : <span className="text-warning small">● בטיפול</span>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Transparency Ledger – קבלנים מתחת ל־סטנדרט */}
              <div className="col-lg-6">
                <div className="card shadow-sm h-100 border-warning">
                  <div className="card-header bg-warning bg-opacity-25">
                    <strong>Transparency Ledger – קבלנים מתחת ל־{(vendorAlerts?.threshold ?? 4.2).toFixed(1)}</strong>
                  </div>
                  <div className="card-body">
                    {(vendorAlerts?.alerts ?? []).length === 0 ? (
                      <p className="text-muted mb-0">אין התראות – כל הקבלנים עומדים בסטנדרט</p>
                    ) : (
                      <ul className="list-unstyled mb-0">
                        {vendorAlerts?.alerts?.slice(0, 8).map((v, i) => (
                          <li key={i} className="py-1 border-bottom small">
                            <strong>{v.contractorName ?? '-'}</strong>
                            {v.buildingId && <span className="text-muted"> • בניין {v.buildingId}</span>}
                            {' '}— ציון {v.avgRating ?? '-'} ({v.count ?? 0} משובים)
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* מעקב הורדות */}
              <div className="col-lg-6">
                <div className="card shadow-sm h-100">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <strong>מעקב הורדות אפליקציה</strong>
                    <Link to={ROUTES.RESIDENT_ADOPTION} className="btn btn-sm btn-outline-primary">
                      להרחבה
                    </Link>
                  </div>
                  <div className="card-body">
                    <p className="mb-2">סה"כ דיירים: <strong>{adoption?.total ?? 0}</strong></p>
                    <ul className="list-unstyled mb-0">
                      {(adoption?.items ?? []).slice(0, 5).map((r) => (
                        <li key={r.buildingId} className="d-flex justify-content-between py-1 border-bottom">
                          <span>{r.buildingName}</span>
                          <span>{r.appDownloadedCount}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Anomaly Feed – VisionLog עם thumbnail */}
              <div className="col-lg-6">
                <div className="card shadow-sm h-100">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <strong>Anomaly Feed (Vision)</strong>
                    {vision?.items && vision.items.length > 0 && (
                      <span className="badge bg-danger">Visual Evidence</span>
                    )}
                  </div>
                  <div className="card-body">
                    {(vision?.items ?? []).length === 0 ? (
                      <p className="text-muted mb-0">אין אירועים – כש-Vision AI יזהה חריגות (נזילה, חסימה, כניסה) יופיעו כאן</p>
                    ) : (
                      <div className="d-flex flex-column gap-2">
                        {vision?.items?.slice(0, 10).map((v) => (
                          <div
                            key={v.id}
                            className={`d-flex align-items-start gap-2 p-2 rounded ${!v.resolved ? 'bg-danger bg-opacity-10 border border-danger border-opacity-25' : 'bg-light'}`}
                          >
                            {v.thumbnailUrl ? (
                              <img
                                src={v.thumbnailUrl}
                                alt=""
                                className="rounded flex-shrink-0 super-admin-thumbnail"
                              />
                            ) : (
                              <div
                                className="d-flex align-items-center justify-content-center rounded flex-shrink-0 bg-secondary bg-opacity-25 text-muted super-admin-thumbnail-placeholder"
                              >
                                <i className="fas fa-video fa-sm" aria-hidden />
                              </div>
                            )}
                            <div className="flex-grow-1 small">
                              <div className="d-flex justify-content-between">
                                <span className="fw-semibold">{v.eventType ?? 'אירוע'}</span>
                                {!v.resolved && <span className="badge bg-warning text-dark">פתוח</span>}
                              </div>
                              <div className="text-muted">
                                בניין: {v.buildingId ?? '-'}
                                {v.cameraId && ` • מצלמה: ${v.cameraId}`}
                                {v.confidence != null && ` • ביטחון: ${Math.round((v.confidence ?? 0) * 100)}%`}
                              </div>
                              {v.timestamp && (
                                <div className="text-muted">{new Date(v.timestamp).toLocaleString('he-IL')}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* NEW REAL ESTATE OPPORTUNITY – התראה אדומה מהבהבת (דמו) */}
              {newestNewLead && (
                <div className="col-12">
                  <div
                    className="alert alert-danger d-flex align-items-center justify-content-between mb-0 animate__animated animate__pulse super-admin-alert"
                    role="alert"
                  >
                    <strong>
                      <i className="fas fa-bell me-2" aria-hidden />
                      NEW REAL ESTATE OPPORTUNITY – UNIT {newestNewLead.apartmentNumber || '?'}
                    </strong>
                    <span className="badge bg-danger">{newestNewLead.residentName} • {newestNewLead.dealType === 'rent' ? 'השכרה' : 'מכירה'}</span>
                  </div>
                </div>
              )}

              {/* Real Estate Opportunities – Revenue Share Ecosystem */}
              <div className="col-12">
                <div className="card shadow-sm border-success">
                  <div className="card-header bg-success bg-opacity-10 d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <strong>
                      <i className="fas fa-home me-1" aria-hidden />
                      Real Estate Opportunities – לידים חמים
                    </strong>
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-success">{countThisMonth} החודש</span>
                      <span className="badge bg-secondary">Partner Commission: ₪{countThisMonth * 10}</span>
                    </div>
                  </div>
                  <div className="card-body">
                    {(realEstateLeads?.items ?? []).length === 0 ? (
                      <p className="text-muted mb-0">
                        כשדייר יאמר ל-V-One "רוצה למכור" או "להשכיר" – הליד יופיע כאן. הליד מועבר למנהל הנכס + חיוב $10/10₪.
                      </p>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>דירה</th>
                              <th>דייר</th>
                              <th>סוג</th>
                              <th>סטטוס</th>
                              <th>בניין</th>
                              <th>צור קשר</th>
                            </tr>
                          </thead>
                          <tbody>
                            {realEstateLeads?.items?.slice(0, 15).map((l) => (
                              <tr key={l.id}>
                                <td>{l.apartmentNumber || '-'}</td>
                                <td>{l.residentName}</td>
                                <td>
                                  <span className={`badge ${l.dealType === 'rent' ? 'bg-info' : 'bg-primary'}`}>
                                    {l.dealType === 'rent' ? 'השכרה' : 'מכירה'}
                                  </span>
                                </td>
                                <td>
                                  <span className={`badge ${l.status === 'new' ? 'bg-warning' : l.status === 'closed' ? 'bg-secondary' : 'bg-info'}`}>
                                    {l.status === 'new' ? 'חדש' : l.status === 'closed' ? 'נסגר' : 'בטיפול'}
                                  </span>
                                </td>
                                <td>{l.buildingName}</td>
                                <td>
                                  <a href={`mailto:${l.residentEmail}?subject=${encodeURIComponent(`בניין ${l.buildingName} – ${l.dealType === 'rent' ? 'השכרה' : 'מכירה'}`)}`} className="btn btn-sm btn-outline-primary me-1" title="שלח מייל">
                                    <i className="fas fa-envelope" aria-hidden />
                                  </a>
                                  {l.residentPhone ? (
                                    <a href={`https://wa.me/${l.residentPhone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-success" title="WhatsApp">
                                      <i className="fab fa-whatsapp" aria-hidden />
                                    </a>
                                  ) : null}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Global Ledger – תנועות כסף לכל בניין */}
              <div className="col-12">
                <div className="card shadow-sm">
                  <div className="card-header">
                    <strong>Global Ledger – תנועות כסף לכל בניין</strong>
                  </div>
                  <div className="card-body">
                    {(ledger?.items ?? []).length === 0 ? (
                      <p className="text-muted mb-0">אין תנועות – תנועות יתווספו כשההכנסות/הוצאות יירשמו במערכת</p>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>בניין</th>
                              <th>הכנסות (₪)</th>
                              <th>הוצאות (₪)</th>
                              <th>יתרה</th>
                              <th>מספר תנועות</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ledger?.items?.map((b) => (
                              <tr key={b.buildingId}>
                                <td>{b.buildingName}</td>
                                <td className="text-success">₪{Number(b.totalIncome).toLocaleString()}</td>
                                <td className="text-danger">₪{Number(b.totalExpense).toLocaleString()}</td>
                                <td className={b.totalIncome - b.totalExpense >= 0 ? 'text-success' : 'text-danger'}>
                                  ₪{(b.totalIncome - b.totalExpense).toLocaleString()}
                                </td>
                                <td>{b.transactionCount ?? 0}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* יומן פעילות */}
              <div className="col-12">
                <div className="card shadow-sm">
                  <div className="card-header">
                    <strong>יומן פעילות (10 אחרונים)</strong>
                  </div>
                  <div className="card-body">
                    {(activity?.logs ?? []).length === 0 ? (
                      <p className="text-muted mb-0">אין רשומות</p>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>זמן</th>
                              <th>פעולה</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activity?.logs?.map((log, i) => (
                              <tr key={log._id ?? i}>
                                <td className="small">{log.timestamp ? new Date(log.timestamp).toLocaleString() : '-'}</td>
                                <td>{String(log.action ?? JSON.stringify(log)).slice(0, 80)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
