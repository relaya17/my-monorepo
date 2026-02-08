import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequestJson } from '../api';
import ROUTES from '../routs/routes';

const SelectBuilding: React.FC = () => {
  const navigate = useNavigate();
  const [buildings, setBuildings] = useState<string[]>(['default']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
    if (!isLoggedIn) {
      navigate(ROUTES.ADMIN_LOGIN);
      return;
    }
    (async () => {
      try {
        const { response, data } = await apiRequestJson<{ buildings: string[] }>('buildings');
        if (response.ok && data?.buildings?.length) {
          setBuildings(data.buildings);
        }
      } catch {
        setError('שגיאה בטעינת רשימת הבניינים');
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const handleSelect = (buildingId: string) => {
    localStorage.setItem('buildingId', buildingId);
    navigate(ROUTES.ADMIN_DASHBOARD);
  };

  const currentBuilding = typeof localStorage !== 'undefined' ? localStorage.getItem('buildingId') || 'default' : 'default';

  if (loading) {
    return (
      <div className="container-fluid d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)' }}>
        <div className="text-center" style={{ direction: 'rtl' }}>
          <span className="spinner-border text-primary" role="status" aria-hidden="true" />
          <p className="mt-2 text-muted">טוען בניינים...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="container-fluid d-flex justify-content-center align-items-center"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
      }}
    >
      <div className="card shadow-lg" style={{ maxWidth: '420px', width: '100%' }}>
        <div className="card-body p-5" style={{ direction: 'rtl', textAlign: 'right' }}>
          <div className="text-center mb-4">
            <i className="fas fa-building fa-3x mb-3" style={{ color: '#6b7280' }} aria-hidden="true" />
            <h2 className="card-title" style={{ color: '#2c3e50' }}>
              בחירת בניין
            </h2>
            <p className="text-muted">בחר את הבניין שבו תרצה לעבוד</p>
          </div>

          {error && (
            <div className="alert alert-warning" role="alert">
              <i className="fas fa-exclamation-triangle ms-2" aria-hidden="true" />
              {error}
            </div>
          )}

          <div className="list-group mb-4">
            {buildings.map((id) => (
              <button
                key={id}
                type="button"
                className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${currentBuilding === id ? 'active' : ''}`}
                onClick={() => handleSelect(id)}
                style={{ textAlign: 'right' }}
              >
                <span>
                  <i className="fas fa-building me-2" aria-hidden="true" />
                  {id === 'default' ? 'ברירת מחדל' : id}
                </span>
                {currentBuilding === id && (
                  <i className="fas fa-check" aria-hidden="true" />
                )}
              </button>
            ))}
          </div>

          <div className="text-center">
            <button
              type="button"
              className="btn btn-link text-decoration-none"
              onClick={() => navigate(ROUTES.ADMIN_DASHBOARD)}
            >
              <i className="fas fa-arrow-right me-1" aria-hidden="true" />
              המשך ללוח הבקרה
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectBuilding;
