/**
 * CEO Dashboard מאוחד – סטטיסטיקות גלובליות, מעקב הורדות, יומן פעילות, Anomaly Feed.
 * מוצג רק ל-super-admin.
 */
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ROUTES from '../routs/routes';
import { apiRequestJson } from '../api';
import { safeGetItem } from '../utils/safeStorage';

type GlobalStats = { totalRevenue?: number; activeBuildings?: number; totalMoneySaved?: number; preventedFailures?: number };
type AdoptionItem = { buildingId: string; buildingName: string; appDownloadedCount: number };
type AdoptionData = { items: AdoptionItem[]; total: number };
type AuditLog = { _id?: string; timestamp?: string; action?: string; [k: string]: unknown };
type ActivityData = { logs: AuditLog[]; total: number; page: number; totalPages: number };
type VisionItem = { id: string; buildingId?: string; eventType?: string; timestamp?: string; resolved?: boolean };
type VisionData = { items: VisionItem[] };

const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [adoption, setAdoption] = useState<AdoptionData | null>(null);
  const [activity, setActivity] = useState<ActivityData | null>(null);
  const [vision, setVision] = useState<VisionData | null>(null);
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
        const [statsRes, adoptionRes, activityRes, visionRes] = await Promise.all([
          apiRequestJson<GlobalStats>('super-admin/global-stats'),
          apiRequestJson<AdoptionData>('super-admin/resident-adoption'),
          apiRequestJson<ActivityData>('super-admin/activity-stream?limit=10'),
          apiRequestJson<VisionData>('super-admin/vision-logs?limit=10'),
        ]);

        if (statsRes.response.ok) setStats(statsRes.data ?? null);
        if (adoptionRes.response.ok) setAdoption(adoptionRes.data ?? null);
        if (activityRes.response.ok) setActivity(activityRes.data ?? null);
        if (visionRes.response.ok) setVision(visionRes.data ?? null);

        if (!statsRes.response.ok && statsRes.response.status === 403) setError('אין הרשאה');
      } catch {
        setError('שגיאה בחיבור לשרת');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [navigate]);

  return (
    <div style={{ minHeight: '100vh', direction: 'rtl', padding: '2rem', backgroundColor: '#f8f9fa' }}>
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

        {!loading && !error && (
          <>
            {/* סטטיסטיקות גלובליות */}
            <div className="row g-3 mb-4">
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
            </div>

            <div className="row g-4">
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

              {/* Anomaly Feed */}
              <div className="col-lg-6">
                <div className="card shadow-sm h-100">
                  <div className="card-header">
                    <strong>Anomaly Feed (Vision)</strong>
                  </div>
                  <div className="card-body">
                    {(vision?.items ?? []).length === 0 ? (
                      <p className="text-muted mb-0">אין אירועים</p>
                    ) : (
                      <ul className="list-unstyled mb-0">
                        {vision?.items?.slice(0, 5).map((v) => (
                          <li key={v.id} className="py-2 border-bottom small">
                            <span className="text-muted">{v.buildingId}</span> – {v.eventType}
                            {v.timestamp && <span className="ms-1">({new Date(v.timestamp).toLocaleDateString()})</span>}
                          </li>
                        ))}
                      </ul>
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
