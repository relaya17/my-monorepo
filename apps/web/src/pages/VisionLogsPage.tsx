/**
 * Vision Logs — admin viewer for camera anomaly events.
 * Supports filtering by resolved status + per-row resolve action.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { getApiUrl, getApiHeaders } from '../api';
import './VisionLogsPage.css';

type EventType = 'FLOOD_DETECTION' | 'OBSTRUCTION' | 'UNAUTHORIZED_ENTRY';

interface VisionLogEntry {
  _id: string;
  cameraId: string;
  eventType: EventType;
  confidence: number;
  resolved: boolean;
  timestamp: string;
  thumbnailUrl?: string;
}

interface ApiResponse {
  logs: VisionLogEntry[];
  total: number;
  totalPages: number;
}

const EVENT_LABELS: Record<EventType, string> = {
  FLOOD_DETECTION: 'גילוי הצפה',
  OBSTRUCTION: 'חסימת מעבר',
  UNAUTHORIZED_ENTRY: 'כניסה לא מורשית',
};

const EVENT_BADGE: Record<EventType, string> = {
  FLOOD_DETECTION: 'badge bg-primary',
  OBSTRUCTION: 'badge bg-warning text-dark',
  UNAUTHORIZED_ENTRY: 'badge bg-danger',
};

const VisionLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<VisionLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [resolvedFilter, setResolvedFilter] = useState<'all' | 'true' | 'false'>('false');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const buildingId = localStorage.getItem('buildingId') ?? 'default';

  const fetchLogs = useCallback(async (p: number, rf: 'all' | 'true' | 'false') => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(p), limit: '20' });
      if (rf !== 'all') params.set('resolved', rf);
      const res = await fetch(
        getApiUrl(`vision/logs?${params.toString()}`),
        { headers: { ...getApiHeaders(), 'x-building-id': buildingId } }
      );
      if (!res.ok) throw new Error('שגיאה בטעינת הנתונים');
      const data = await res.json() as ApiResponse;
      setLogs(data.logs);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'שגיאה');
    } finally {
      setLoading(false);
    }
  }, [buildingId]);

  useEffect(() => {
    void fetchLogs(page, resolvedFilter);
  }, [fetchLogs, page, resolvedFilter]);

  const handleResolve = async (id: string) => {
    setResolvingId(id);
    try {
      const res = await fetch(
        getApiUrl(`vision/${id}/resolve`),
        { method: 'PATCH', headers: { ...getApiHeaders(), 'x-building-id': buildingId } }
      );
      if (!res.ok) throw new Error('שגיאה בעדכון');
      await fetchLogs(page, resolvedFilter);
    } catch {
      setError('שגיאה בסימון כפתור');
    } finally {
      setResolvingId(null);
    }
  };

  const handleFilterChange = (val: 'all' | 'true' | 'false') => {
    setResolvedFilter(val);
    setPage(1);
  };

  return (
    <div className="container py-4 vision-logs-container" dir="rtl">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h3 className="mb-0 fw-bold">
          <i className="fas fa-video me-2 text-danger" aria-hidden="true" />
          יומן מצלמות – Vision Feed
        </h3>
        <span className="badge bg-secondary fs-6">{total} אירועים</span>
      </div>

      {/* Filters */}
      <div className="d-flex gap-2 mb-3 flex-wrap">
        <button
          className={`btn btn-sm ${resolvedFilter === 'false' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => handleFilterChange('false')}
        >
          פתוחים
        </button>
        <button
          className={`btn btn-sm ${resolvedFilter === 'true' ? 'btn-success' : 'btn-outline-success'}`}
          onClick={() => handleFilterChange('true')}
        >
          סגורים
        </button>
        <button
          className={`btn btn-sm ${resolvedFilter === 'all' ? 'btn-secondary' : 'btn-outline-secondary'}`}
          onClick={() => handleFilterChange('all')}
        >
          הכל
        </button>
        <button
          className="btn btn-sm btn-outline-secondary ms-auto"
          onClick={() => void fetchLogs(page, resolvedFilter)}
          disabled={loading}
          aria-label="רענן"
        >
          <i className="fas fa-sync-alt" aria-hidden="true" />
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status" aria-label="טוען">
            <span className="visually-hidden">טוען...</span>
          </div>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center text-muted py-5">
          <i className="fas fa-check-circle fa-3x mb-3 d-block text-success" aria-hidden="true" />
          אין אירועים להצגה
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-hover align-middle vision-table">
              <thead className="table-light">
                <tr>
                  <th>מצלמה</th>
                  <th>סוג אירוע</th>
                  <th>ביטחון</th>
                  <th>תאריך</th>
                  <th>סטטוס</th>
                  <th>פעולה</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} className={log.resolved ? 'table-light text-muted' : ''}>
                    <td>
                      <code className="small">{log.cameraId}</code>
                    </td>
                    <td>
                      <span className={EVENT_BADGE[log.eventType] ?? 'badge bg-secondary'}>
                        {EVENT_LABELS[log.eventType] ?? log.eventType}
                      </span>
                    </td>
                    <td>
                      <div className="vision-confidence-bar">
                        <div
                          className="vision-confidence-fill"
                          ref={(el) => { if (el) el.style.width = `${Math.round(log.confidence * 100)}%`; }}
                          aria-label={`ביטחון: ${Math.round(log.confidence * 100)}%`}
                        />
                      </div>
                      <span className="small">{Math.round(log.confidence * 100)}%</span>
                    </td>
                    <td className="small">
                      {new Date(log.timestamp).toLocaleString('he-IL')}
                    </td>
                    <td>
                      {log.resolved ? (
                        <span className="badge bg-success">סגור</span>
                      ) : (
                        <span className="badge bg-danger">פתוח</span>
                      )}
                    </td>
                    <td>
                      {!log.resolved && (
                        <button
                          className="btn btn-sm btn-outline-success"
                          onClick={() => void handleResolve(log._id)}
                          disabled={resolvingId === log._id}
                          aria-label={`סמן כטופל: ${log.cameraId}`}
                        >
                          {resolvingId === log._id ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                          ) : (
                            <i className="fas fa-check" aria-hidden="true" />
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav aria-label="ניווט דפים">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(page - 1)} disabled={page === 1}>
                    &raquo;
                  </button>
                </li>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                  return (
                    <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => setPage(p)}>{p}</button>
                    </li>
                  );
                })}
                <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
                    &laquo;
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </div>
  );
};

export default VisionLogsPage;
