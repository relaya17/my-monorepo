/**
 * Dashboard מעקב – כמה דיירים הורידו אפליקציה (נרשמו) בכל בניין.
 * מוצג רק ל-super-admin.
 */
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ROUTES from '../routs/routes';
import { apiRequestJson } from '../api';
import { safeGetItem } from '../utils/safeStorage';

type Item = { buildingId: string; buildingName: string; appDownloadedCount: number };

const ResidentAdoptionPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const isAdmin = safeGetItem('isAdminLoggedIn');
    const role = safeGetItem('adminRole');
    if (!isAdmin || role !== 'super-admin') {
      navigate(ROUTES.ADMIN_DASHBOARD);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const { response, data } = await apiRequestJson<{ items?: Item[]; total?: number }>(
          'super-admin/resident-adoption'
        );
        if (response.ok && data) {
          setItems(data.items ?? []);
          setTotal(data.total ?? 0);
        } else {
          setError('שגיאה בטעינת הנתונים');
        }
      } catch {
        setError('שגיאה בחיבור לשרת');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  return (
    <div style={{ minHeight: '100vh', direction: 'rtl', padding: '2rem', backgroundColor: '#f8f9fa' }}>
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>
            <i className="fas fa-mobile-alt me-2" aria-hidden="true" />
            מעקב הורדות אפליקציה
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
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h5 className="card-title">סה"כ דיירים שנרשמו</h5>
                <p className="display-6 text-primary mb-0">{total}</p>
              </div>
            </div>
            <div className="card shadow-sm">
              <div className="card-header" style={{ backgroundColor: '#fff' }}>
                <strong>לפי בניין</strong>
              </div>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>בניין</th>
                      <th>מזהה</th>
                      <th className="text-end">דיירים נרשמו</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center text-muted py-4">
                          אין נתונים
                        </td>
                      </tr>
                    ) : (
                      items.map((r) => (
                        <tr key={r.buildingId}>
                          <td>{r.buildingName}</td>
                          <td><code>{r.buildingId}</code></td>
                          <td className="text-end">{r.appDownloadedCount}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResidentAdoptionPage;
