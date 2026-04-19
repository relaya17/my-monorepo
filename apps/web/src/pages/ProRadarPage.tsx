/**
 * Pro-Radar — real-time map of online contractors sorted by distance.
 * Uses contractor GPS coords + browser Geolocation API for distance calc.
 */
import React, { useEffect, useState, useCallback } from 'react';
import './ProRadarPage.css';
import { getApiUrl, getApiHeaders } from '../api';

interface Contractor {
  _id: string;
  name: string;
  specialty: string;
  phone?: string;
  isOnline: boolean;
  lastLat?: number;
  lastLng?: number;
  lastSeenAt?: string;
  avgRating: number;
  ratingCount: number;
}

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatLastSeen(iso?: string): string {
  if (!iso) return 'לא ידוע';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'עכשיו';
  if (mins < 60) return `לפני ${mins} דק'`;
  return `לפני ${Math.floor(mins / 60)} שע'`;
}

const SPECIALTIES = ['הכל', 'electrician', 'plumber', 'cleaning', 'locksmith', 'carpenter', 'ac', 'other'];
const SPECIALTY_LABELS: Record<string, string> = {
  'הכל': 'הכל',
  electrician: 'חשמלאי',
  plumber: 'אינסטלטור',
  cleaning: 'ניקיון',
  locksmith: 'סגן',
  carpenter: 'נגר',
  ac: 'מזגנים',
  other: 'אחר',
};

const ProRadarPage: React.FC = () => {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [specialty, setSpecialty] = useState('הכל');
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { setUserLat(pos.coords.latitude); setUserLng(pos.coords.longitude); },
        () => { /* GPS denied — just show list without distance */ }
      );
    }
  }, []);

  const loadContractors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const sp = specialty !== 'הכל' ? `&specialty=${encodeURIComponent(specialty)}` : '';
      const res = await fetch(getApiUrl(`contractors?isOnline=true${sp}`), {
        headers: getApiHeaders(),
      });
      if (!res.ok) throw new Error('שגיאה בטעינת הנתונים');
      const data = (await res.json()) as Contractor[];
      setContractors(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'שגיאה');
    } finally {
      setLoading(false);
    }
  }, [specialty]);

  useEffect(() => { void loadContractors(); }, [loadContractors]);

  const withDistance = contractors
    .map((c) => ({
      ...c,
      distKm:
        userLat && userLng && c.lastLat && c.lastLng
          ? distanceKm(userLat, userLng, c.lastLat, c.lastLng)
          : null,
    }))
    .sort((a, b) => {
      if (a.distKm !== null && b.distKm !== null) return a.distKm - b.distKm;
      if (a.distKm !== null) return -1;
      if (b.distKm !== null) return 1;
      return 0;
    });

  return (
    <div className="container py-4" dir="rtl">
      <div className="d-flex align-items-center mb-4 gap-3">
        <h3 className="mb-0 fw-bold">
          <i className="fas fa-radar me-2 text-primary" aria-hidden="true" />
          Pro-Radar
        </h3>
        <span className="badge bg-success">{contractors.length} זמינים</span>
        <button
          type="button"
          className="btn btn-sm btn-outline-primary ms-auto"
          onClick={() => { void loadContractors(); }}
          disabled={loading}
          aria-label="רענן"
        >
          <i className="fas fa-sync-alt" aria-hidden="true" />
        </button>
      </div>

      {/* Specialty filter */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        {SPECIALTIES.map((sp) => (
          <button
            key={sp}
            type="button"
            className={`btn btn-sm ${specialty === sp ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setSpecialty(sp)}
          >
            {SPECIALTY_LABELS[sp] ?? sp}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" aria-label="טוען">
            <span className="visually-hidden">טוען...</span>
          </div>
        </div>
      )}

      {!loading && withDistance.length === 0 && (
        <div className="text-center text-muted py-5">
          <i className="fas fa-satellite-dish fa-3x mb-3 d-block" aria-hidden="true" />
          אין בעלי מקצוע זמינים כרגע
        </div>
      )}

      <div className="row g-3">
        {withDistance.map((c) => (
          <div key={c._id} className="col-12 col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body">
                <div className="d-flex align-items-start justify-content-between mb-2">
                  <div>
                    <h5 className="card-title mb-1 fw-bold">{c.name}</h5>
                    <span className="badge bg-primary text-white">
                      {SPECIALTY_LABELS[c.specialty] ?? c.specialty}
                    </span>
                  </div>
                  <span className="badge bg-success">
                    <i className="fas fa-circle me-1 pro-radar-dot" aria-hidden="true" />
                    זמין
                  </span>
                </div>

                <div className="text-muted small mb-2">
                  <i className="fas fa-clock me-1" aria-hidden="true" />
                  נראה {formatLastSeen(c.lastSeenAt)}
                </div>

                {c.distKm !== null && (
                  <div className="text-muted small mb-2">
                    <i className="fas fa-location-arrow me-1" aria-hidden="true" />
                    {c.distKm < 1
                      ? `${Math.round(c.distKm * 1000)} מטר ממך`
                      : `${c.distKm.toFixed(1)} ק"מ ממך`}
                  </div>
                )}

                {c.avgRating > 0 && (
                  <div className="mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <i
                        key={i}
                        className={`fas fa-star${i < Math.round(c.avgRating) ? '' : '-o'} text-warning`}
                        aria-hidden="true"
                      />
                    ))}
                    <span className="text-muted small ms-1">({c.ratingCount})</span>
                  </div>
                )}

                {c.phone && (
                  <a
                    href={`tel:${c.phone}`}
                    className="btn btn-sm btn-outline-primary w-100 mt-2"
                    aria-label={`התקשר ל${c.name}`}
                  >
                    <i className="fas fa-phone me-1" aria-hidden="true" />
                    {c.phone}
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProRadarPage;
