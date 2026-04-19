/**
 * Contractor Dashboard — technician-facing page.
 * Online/Offline toggle, GPS location broadcast, incoming job requests.
 *
 * Endpoints used:
 *   GET    /api/contractors/me
 *   PATCH  /api/contractors/:id/status
 *   PATCH  /api/contractors/:id/location
 */
import React, { useState, useEffect, useCallback } from 'react';
import { getApiUrl, getApiHeaders } from '../api';
import './ContractorDashboardPage.css';

interface ContractorProfile {
  _id: string;
  name: string;
  specialty: string;
  phone?: string;
  isOnline: boolean;
  avgRating: number;
  reviewCount: number;
  lastLat?: number;
  lastLng?: number;
  lastSeenAt?: string;
}

const ContractorDashboardPage: React.FC = () => {
  const [profile, setProfile] = useState<ContractorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [sendingGps, setSendingGps] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(getApiUrl('contractors/me'), { headers: getApiHeaders() });
      if (!res.ok) throw new Error('שגיאה בטעינת הפרופיל');
      const data = await res.json() as { contractor: ContractorProfile };
      setProfile(data.contractor);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'שגיאה');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const toggleStatus = async () => {
    if (!profile) return;
    setToggling(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const newStatus = !profile.isOnline;
      const res = await fetch(getApiUrl(`contractors/${profile._id}/status`), {
        method: 'PATCH',
        headers: getApiHeaders(),
        body: JSON.stringify({ isOnline: newStatus }),
      });
      if (!res.ok) throw new Error('שגיאה בעדכון הסטטוס');
      const data = await res.json() as { contractor: ContractorProfile };
      setProfile(data.contractor);
      setSuccessMsg(newStatus ? 'אתה כעת מקוון ✓' : 'אתה כעת לא מקוון');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'שגיאה');
    } finally {
      setToggling(false);
    }
  };

  const sendLocation = () => {
    if (!profile) return;
    if (!navigator.geolocation) {
      setGpsStatus('הדפדפן לא תומך ב-GPS');
      return;
    }
    setSendingGps(true);
    setGpsStatus('מאתר מיקום...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        void (async () => {
          try {
            const res = await fetch(getApiUrl(`contractors/${profile._id}/location`), {
              method: 'PATCH',
              headers: getApiHeaders(),
              body: JSON.stringify({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
              }),
            });
            if (!res.ok) throw new Error();
            const data = await res.json() as { contractor: ContractorProfile };
            setProfile(data.contractor);
            setGpsStatus(`מיקום עודכן (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
          } catch {
            setGpsStatus('שגיאה בשליחת המיקום');
          } finally {
            setSendingGps(false);
          }
        })();
      },
      () => {
        setGpsStatus('לא ניתן לאתר מיקום — בדוק הרשאות');
        setSendingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" dir="rtl">
        <div className="spinner-border" role="status" aria-label="טוען">
          <span className="visually-hidden">טוען...</span>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="container py-4" dir="rtl">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="container py-4 contractor-dashboard-container" dir="rtl">
      <h3 className="fw-bold mb-4">
        <i className="fas fa-hard-hat me-2 text-warning" aria-hidden="true" />
        לוח בקרה – קבלן
      </h3>

      {error && <div className="alert alert-danger">{error}</div>}
      {successMsg && (
        <div className="alert alert-success d-flex align-items-center gap-2">
          <i className="fas fa-check-circle" aria-hidden="true" />
          {successMsg}
        </div>
      )}

      {profile && (
        <div className="row g-4">
          {/* Profile card */}
          <div className="col-12 col-md-5">
            <div className="card shadow-sm">
              <div className="card-header fw-semibold">פרופיל</div>
              <div className="card-body">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="contractor-avatar" aria-hidden="true">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="fw-bold fs-5">{profile.name}</div>
                    <div className="text-muted small">{profile.specialty}</div>
                    {profile.phone && (
                      <div className="small">
                        <i className="fas fa-phone me-1" aria-hidden="true" />
                        {profile.phone}
                      </div>
                    )}
                  </div>
                </div>

                <div className="d-flex gap-3 align-items-center">
                  <div className="text-center">
                    <div className="fs-4 fw-bold text-warning">
                      {'★'.repeat(Math.round(profile.avgRating))}
                    </div>
                    <div className="small text-muted">{profile.avgRating.toFixed(1)} / 5</div>
                  </div>
                  <div className="text-muted small">({profile.reviewCount} ביקורות)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Status card */}
          <div className="col-12 col-md-7">
            <div className="card shadow-sm">
              <div className="card-header fw-semibold">סטטוס ומיקום</div>
              <div className="card-body">
                {/* Online/Offline toggle */}
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div>
                    <div className="fw-semibold mb-1">זמינות</div>
                    <div className={`badge fs-6 ${profile.isOnline ? 'bg-success' : 'bg-secondary'}`}>
                      <i
                        className={`fas fa-circle me-1 ${profile.isOnline ? '' : 'opacity-50'}`}
                        aria-hidden="true"
                      />
                      {profile.isOnline ? 'מקוון' : 'לא מקוון'}
                    </div>
                  </div>
                  <button
                    className={`btn ${profile.isOnline ? 'btn-outline-danger' : 'btn-success'} contractor-toggle-btn`}
                    onClick={() => void toggleStatus()}
                    disabled={toggling}
                    aria-label={profile.isOnline ? 'כבה זמינות' : 'הפעל זמינות'}
                  >
                    {toggling ? (
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                    ) : (
                      <i className={`fas fa-power-off me-2`} aria-hidden="true" />
                    )}
                    {profile.isOnline ? 'כבה' : 'הפעל'}
                  </button>
                </div>

                {/* GPS */}
                <div>
                  <div className="fw-semibold mb-2">מיקום GPS</div>
                  <button
                    className="btn btn-outline-primary"
                    onClick={sendLocation}
                    disabled={sendingGps}
                    aria-label="שלח מיקום נוכחי"
                  >
                    {sendingGps ? (
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                    ) : (
                      <i className="fas fa-location-arrow me-2" aria-hidden="true" />
                    )}
                    שלח מיקום נוכחי
                  </button>
                  {gpsStatus && (
                    <div className="small text-muted mt-2">
                      <i className="fas fa-info-circle me-1" aria-hidden="true" />
                      {gpsStatus}
                    </div>
                  )}
                  {(profile.lastLat || profile.lastLng) && (
                    <div className="small text-muted mt-1">
                      מיקום אחרון: {profile.lastLat?.toFixed(4)}, {profile.lastLng?.toFixed(4)}
                    </div>
                  )}
                  {profile.lastSeenAt && (
                    <div className="small text-muted">
                      עודכן: {new Date(profile.lastSeenAt).toLocaleString('he-IL')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractorDashboardPage;
