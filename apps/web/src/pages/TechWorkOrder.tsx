/**
 * TechWorkOrder — Magic Link work order page for technicians.
 *
 * Security: token is validated server-side on every action.
 * GPS: Haversine check (client-side warning), server also validates (100m grace).
 * Dark theme, high-contrast, mobile-first (field use).
 */
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './TechWorkOrder.css';

interface AccessData {
  floor: number;
  floorLabel?: string;
  buildingId: string;
  buildingLat?: number;
  buildingLng?: number;
  isGpsRequired: boolean;
  permissions: string[];
  expiresIn: string;
  contractorId?: string;
}

type PageState = 'loading' | 'ready' | 'unlocked' | 'completed' | 'error' | 'expired';

const API = import.meta.env.VITE_API_URL ?? '';

/** Haversine distance in meters */
function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function TechWorkOrder() {
  const { token } = useParams<{ token: string }>();

  const [pageState, setPageState] = useState<PageState>('loading');
  const [access, setAccess] = useState<AccessData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'pending' | 'ok' | 'far' | 'denied' | 'unsupported'>('pending');
  const [unlocking, setUnlocking] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [notes, setNotes] = useState('');

  // Fetch work order
  useEffect(() => {
    if (!token) { setPageState('error'); setErrorMsg('טוקן חסר'); return; }

    axios.get<{ success: boolean; data: AccessData }>(`${API}/api/tech/magic/${token}`)
      .then(res => {
        setAccess(res.data.data);
        setPageState('ready');
      })
      .catch(err => {
        const msg: string = (err.response?.data as { error?: string })?.error ?? 'קישור לא תקין';
        setErrorMsg(msg);
        setPageState('expired');
      });
  }, [token]);

  // GPS watch
  useEffect(() => {
    if (pageState !== 'ready' || !access?.isGpsRequired) return;
    if (!navigator.geolocation) { setGpsStatus('unsupported'); return; }

    const id = navigator.geolocation.watchPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLat(lat);
        setUserLng(lng);
        if (access.buildingLat != null && access.buildingLng != null) {
          const d = haversineMeters(lat, lng, access.buildingLat, access.buildingLng);
          setDistance(Math.round(d));
          setGpsStatus(d <= 50 ? 'ok' : 'far');
        } else {
          setGpsStatus('ok'); // no building coords — skip check
        }
      },
      () => setGpsStatus('denied'),
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 15_000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [pageState, access]);

  const isUnlockDisabled =
    unlocking ||
    (access?.isGpsRequired && gpsStatus !== 'ok' && gpsStatus !== 'unsupported');

  const handleUnlock = useCallback(async () => {
    if (!token || isUnlockDisabled) return;
    setUnlocking(true);
    try {
      const body = userLat != null && userLng != null ? { userLocation: { lat: userLat, lng: userLng } } : {};
      await axios.post(`${API}/api/tech/magic/${token}/unlock`, body);
      setPageState('unlocked');
    } catch (err) {
      const msg: string = (err as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'שגיאה בפתיחת הגישה';
      setErrorMsg(msg);
    } finally {
      setUnlocking(false);
    }
  }, [token, isUnlockDisabled, userLat, userLng]);

  const handleComplete = useCallback(async () => {
    if (!token) return;
    setCompleting(true);
    try {
      await axios.post(`${API}/api/tech/magic/${token}/complete`, { notes });
      setPageState('completed');
    } catch {
      setErrorMsg('שגיאה בסיום המשימה');
    } finally {
      setCompleting(false);
    }
  }, [token, notes]);

  // ── Render states ─────────────────────────────────────────────────

  if (pageState === 'loading') {
    return (
      <div
        data-testid="security-handshake"
        className="vow-screen vow-dark d-flex flex-column align-items-center justify-content-center"
      >
        <div
          className="spinner-grow text-primary mb-4"
          role="status"
          style={{ width: '3.5rem', height: '3.5rem' }}
          aria-hidden="true"
        />
        <h4 className="text-primary fw-semibold mb-1" style={{ letterSpacing: '0.03em' }}>
          מבצע אימות קריפטוגרפי...
        </h4>
        <p className="text-secondary small mb-0">Vantera Secure Gateway</p>
        <p className="text-muted" style={{ fontSize: '0.7rem', marginTop: '0.5rem', opacity: 0.5 }}>
          V.One Security Handshake
        </p>
      </div>
    );
  }

  if (pageState === 'expired' || pageState === 'error') {
    return (
      <div className="vow-screen vow-dark d-flex align-items-center justify-content-center">
        <div className="text-center p-4" data-testid="work-order-error">
          <div className="mb-3 vow-icon-xl">🔒</div>
          <h2 className="text-danger fw-bold">קישור לא תקין</h2>
          <p className="text-secondary">{errorMsg}</p>
        </div>
      </div>
    );
  }

  if (pageState === 'completed') {
    return (
      <div className="vow-screen vow-dark d-flex align-items-center justify-content-center">
        <div className="text-center p-4">
          <div className="mb-3 vow-icon-xl">✅</div>
          <h2 className="text-success fw-bold">המשימה הושלמה</h2>
          <p className="text-secondary">תודה! הקישור בוטל.</p>
        </div>
      </div>
    );
  }

  if (!access) return null;

  const floorDisplay = access.floorLabel ?? `קומה ${access.floor}`;

  return (
    <div className="vow-screen vow-dark p-3" dir="rtl" data-testid="work-order-content">
      {/* Header */}
      <div className="d-flex align-items-center gap-2 mb-4">
        <span className="vow-icon-lg">🔑</span>
        <div>
          <h1 className="h4 text-white fw-bold mb-0">V.One Work Order</h1>
          <small className="text-secondary">מערכת Vantera — גישה לטכנאי</small>
        </div>
        <span className="ms-auto badge bg-success">פעיל · {access.expiresIn}</span>
      </div>

      {/* Task card */}
      <div className="card bg-dark border-secondary text-white mb-3">
        <div className="card-body">
          <h2 className="h5 mb-3">📋 פרטי המשימה</h2>
          <div className="row g-2">
            <div className="col-6">
              <div className="text-secondary small">קומה</div>
              <div className="fw-bold">{floorDisplay}</div>
            </div>
            <div className="col-6">
              <div className="text-secondary small">בניין</div>
              <div className="fw-bold vow-building-id">{access.buildingId}</div>
            </div>
          </div>
          <hr className="border-secondary my-2" />
          <div className="text-secondary small mb-1">הרשאות:</div>
          <div className="d-flex flex-wrap gap-1">
            {access.permissions.map(p => (
              <span key={p} className="badge bg-secondary vow-perm-badge">{p}</span>
            ))}
          </div>
        </div>
      </div>

      {/* GPS status */}
      {access.isGpsRequired && (
        <div className={`alert ${gpsStatus === 'ok' ? 'alert-success' : gpsStatus === 'far' ? 'alert-warning' : 'alert-danger'} py-2 mb-3`}>
          {gpsStatus === 'pending' && <span>⏳ מאמת מיקום GPS...</span>}
          {gpsStatus === 'ok' && <span>✅ מיקום אומת — {distance != null ? `${distance} מ' מהבניין` : 'קרוב לבניין'}</span>}
          {gpsStatus === 'far' && <span>⚠️ מרחק {distance} מ' מהבניין — נדרש להיות עד 50 מ'</span>}
          {gpsStatus === 'denied' && <span>❌ GPS נדחה — יש לאפשר גישה למיקום בהגדרות הדפדפן</span>}
          {gpsStatus === 'unsupported' && <span>⚠️ GPS אינו נתמך במכשיר זה</span>}
        </div>
      )}

      {/* Error */}
      {errorMsg && (
        <div className="alert alert-danger py-2 mb-3">{errorMsg}</div>
      )}

      {/* Actions */}
      {pageState === 'ready' && (
        <button
          className="btn btn-primary btn-lg w-100 mb-3 py-3 fw-bold vow-btn-unlock"
          onClick={() => void handleUnlock()}
          disabled={isUnlockDisabled}
        >
          {unlocking ? (
            <><span className="spinner-border spinner-border-sm me-2" />מאמת...</>
          ) : (
            '🚪 אשר כניסה לבניין'
          )}
        </button>
      )}

      {pageState === 'unlocked' && (
        <div>
          <div className="alert alert-success mb-3">
            <strong>✅ גישה אושרה!</strong> הדיירים עודכנו על הכניסה.
          </div>
          <div className="mb-3">
            <label className="form-label text-white">הערות סיום (אופציונלי)</label>
            <textarea
              className="form-control bg-dark text-white border-secondary"
              rows={3}
              placeholder="תיאור העבודה, חלקים שהוחלפו..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
          <button
            className="btn btn-success btn-lg w-100 py-3 fw-bold vow-btn-complete"
            onClick={() => void handleComplete()}
            disabled={completing}
          >
            {completing ? (
              <><span className="spinner-border spinner-border-sm me-2" />שולח...</>
            ) : (
              '✔ סמן כהושלם'
            )}
          </button>
        </div>
      )}

    </div>
  );
}
