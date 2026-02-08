import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiRequestJson, getBuildingId, setBuildingId } from '../api';
import ROUTES from '../routs/routes';

const FALLBACK_BUILDINGS = ['default'];

const BuildingSelect: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [buildings, setBuildings] = useState<string[]>(FALLBACK_BUILDINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: string })?.from ?? ROUTES.ADMIN_DASHBOARD;

  const loadBuildings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { response, data } = await apiRequestJson<{ buildings?: string[] }>('buildings');
      if (response.ok && Array.isArray(data?.buildings) && data.buildings.length > 0) {
        setBuildings(data.buildings);
      }
    } catch {
      setError('לא ניתן לטעון את רשימת הבניינים');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBuildings();
  }, [loadBuildings]);

  const currentId = getBuildingId();

  const handleSelect = (buildingId: string) => {
    setBuildingId(buildingId);
    navigate(from, { replace: true });
  };

  const buildingLabel = (id: string) => (id === 'default' ? 'בניין ברירת מחדל' : id);

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center p-3"
      style={{ backgroundColor: '#f8f9fa', direction: 'rtl' }}
    >
      <div className="container" style={{ maxWidth: '420px' }}>
        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            <h2 className="h4 mb-3 text-center text-dark">
              <i className="fas fa-building me-2" aria-hidden="true"></i>
              בחירת בניין
            </h2>
            <p className="text-muted text-center small mb-4">
              בחר בניין לניהול. כל הפעולות יתבצעו בהקשר של הבניין הנבחר.
            </p>

            {loading && (
              <div className="text-center py-3">
                <div className="spinner-border text-primary" role="status" aria-label="טוען">
                  <span className="visually-hidden">טוען...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="alert alert-warning small mb-3" role="alert">
                {error}
                <button
                  type="button"
                  className="btn btn-link btn-sm p-0 me-1"
                  onClick={loadBuildings}
                  aria-label="נסה שוב"
                >
                  נסה שוב
                </button>
              </div>
            )}

            {!loading && (
              <div className="d-grid gap-2">
                {buildings.map((id) => (
                  <button
                    key={id}
                    type="button"
                    className={`btn btn-lg ${currentId === id ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => handleSelect(id)}
                    aria-pressed={currentId === id}
                    aria-label={`בחר בניין ${buildingLabel(id)}`}
                  >
                    <i className="fas fa-building me-2" aria-hidden="true"></i>
                    {buildingLabel(id)}
                    {currentId === id && (
                      <i className="fas fa-check me-2" aria-hidden="true" style={{ opacity: 0.9 }}></i>
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 pt-3 border-top text-center">
              <button
                type="button"
                className="btn btn-link text-muted small"
                onClick={() => navigate(ROUTES.ADMIN_DASHBOARD)}
                aria-label="חזרה ללוח הבקרה"
              >
                חזרה ללוח הבקרה
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildingSelect;
