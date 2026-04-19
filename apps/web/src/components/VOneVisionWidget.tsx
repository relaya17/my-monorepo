/**
 * VOneVisionWidget — real-time security alert toast.
 *
 * Polls GET /api/vision/logs every POLL_INTERVAL_MS and dispatches
 * new alerts to the visionSlice. Falls back gracefully when the user
 * is not authenticated (no poll, no UI).
 *
 * Design: Bootstrap 5 toast positioned bottom-end.
 * No inline styles — all presentation via VOneVisionWidget.css.
 */
import React, { useCallback, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../redux/store';
import { addAlert, resolveAlert, dismissLastAlert } from '../redux/slice/visionSlice';
import type { VisionAlert, VisionSecurityLevel } from '../redux/slice/visionSlice';
import './VOneVisionWidget.css';

// ─── Polling config ───────────────────────────────────────────────

const POLL_INTERVAL_MS = 30_000; // 30 s (adjust once Socket.io is wired)
const MAX_RECENT = 50; // fetch only the latest N events

// ─── Type for raw API response item ──────────────────────────────

interface RawVisionLog {
  _id: string;
  cameraId: string;
  buildingId: string;
  eventType: string;
  confidence: number;
  resolved: boolean;
  timestamp: string;
  thumbnailUrl?: string;
  securityLevel?: string;
  floorContext?: {
    floorNumber: number;
    isSensitive: boolean;
    floorLabel?: string;
  };
  detectedObjects?: Array<{ objectClass: string; confidence: number }>;
}

// ─── Helpers ──────────────────────────────────────────────────────

function toAlertType(eventType: string, objects: RawVisionLog['detectedObjects']): VisionAlert['type'] {
  if (eventType === 'CHILD_ARRIVAL') return 'child';
  if (eventType === 'PACKAGE_DELIVERY') return 'package';
  if (eventType === 'FLOOD_DETECTION') return 'flood';
  if (eventType === 'OBSTRUCTION') return 'obstruction';
  if (eventType === 'LOITERING') return 'loitering';
  if (eventType === 'UNAUTHORIZED_ENTRY') return 'stranger';
  // Fall back to object analysis
  if (objects?.some((o) => o.objectClass === 'PERSON_UNKNOWN')) return 'stranger';
  if (objects?.some((o) => o.objectClass === 'PERSON_CHILD')) return 'child';
  if (objects?.some((o) => o.objectClass === 'PERSON_RESIDENT')) return 'resident';
  return 'resident';
}

function toSecurityLevel(raw?: string): VisionSecurityLevel {
  if (raw === 'CRITICAL') return 'CRITICAL';
  if (raw === 'HIGH') return 'HIGH';
  if (raw === 'MEDIUM') return 'MEDIUM';
  return 'LOW';
}

function fromRaw(log: RawVisionLog): VisionAlert {
  return {
    id: log._id,
    visionLogId: log._id,
    floor: log.floorContext?.floorNumber ?? 0,
    floorLabel: log.floorContext?.floorLabel,
    type: toAlertType(log.eventType, log.detectedObjects),
    securityLevel: toSecurityLevel(log.securityLevel),
    cameraId: log.cameraId,
    buildingId: log.buildingId,
    reason: `${log.eventType} — confidence ${Math.round(log.confidence * 100)}%`,
    timestamp: log.timestamp,
    thumbnailUrl: log.thumbnailUrl,
    resolved: log.resolved,
  };
}

// ─── Component ────────────────────────────────────────────────────

const VOneVisionWidget: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { lastAlert, activeAlerts } = useSelector((state: RootState) => state.vision);
  const seenIds = useRef<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const poll = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return; // not authenticated — skip poll
      const res = await fetch(`/api/vision/logs?limit=${MAX_RECENT}&resolved=false`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = (await res.json()) as { logs: RawVisionLog[] };
      for (const log of data.logs) {
        if (!seenIds.current.has(log._id) && !log.resolved) {
          seenIds.current.add(log._id);
          dispatch(addAlert(fromRaw(log)));
        }
      }
    } catch {
      // Network errors are non-fatal — widget fails silently
    }
  }, [dispatch]);

  useEffect(() => {
    void poll();
    timerRef.current = setInterval(() => void poll(), POLL_INTERVAL_MS);
    return () => {
      if (timerRef.current !== null) clearInterval(timerRef.current);
    };
  }, [poll]);

  const handleDismiss = () => {
    dispatch(dismissLastAlert());
  };

  const handleResolve = async (id: string) => {
    dispatch(resolveAlert(id));
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      await fetch(`/api/vision/${id}/resolve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // optimistic — already removed from UI
    }
  };

  if (!lastAlert) return null;

  const isCriticalOrHigh = lastAlert.securityLevel === 'CRITICAL' || lastAlert.securityLevel === 'HIGH';
  const levelClass = lastAlert.securityLevel.toLowerCase();
  const unreadCount = activeAlerts.filter((a) => !a.resolved).length;

  return (
    <div className="vone-widget-container" role="region" aria-label="התראות אבטחה בזמן אמת">
      <div
        className={`vone-toast vone-toast--${levelClass}`}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        {/* Header */}
        <div className="vone-toast__header">
          <span className={`vone-toast__dot vone-toast__dot--${levelClass}`} aria-hidden="true" />
          <strong className="vone-toast__title">V.One Security Monitor</strong>
          {unreadCount > 1 && (
            <span className="vone-toast__badge">{unreadCount}</span>
          )}
          <time className="vone-toast__time" dateTime={lastAlert.timestamp}>
            {new Date(lastAlert.timestamp).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
          </time>
          <button
            type="button"
            className="vone-toast__close"
            aria-label="סגור התראה"
            onClick={handleDismiss}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="vone-toast__body">
          {lastAlert.type === 'child' && (
            <p className="vone-toast__message">
              <span aria-hidden="true">🏠</span>{' '}
              <strong>עדכון משפחתי:</strong> הילד הגיע בבטחה ל
              {lastAlert.floorLabel ?? `קומה ${lastAlert.floor}`}.
            </p>
          )}
          {lastAlert.type === 'stranger' && (
            <p className="vone-toast__message">
              <span aria-hidden="true">⚠️</span>{' '}
              <strong>התראת אבטחה:</strong> זוהה אדם לא מוכר ב
              {lastAlert.floorLabel ?? `קומה ${lastAlert.floor}`}. תשומת לב נדרשת.
            </p>
          )}
          {lastAlert.type === 'flood' && (
            <p className="vone-toast__message">
              <span aria-hidden="true">💧</span>{' '}
              <strong>התראת נזילה:</strong> זוהתה נזילה ב
              {lastAlert.floorLabel ?? `קומה ${lastAlert.floor}`}.
            </p>
          )}
          {lastAlert.type === 'loitering' && (
            <p className="vone-toast__message">
              <span aria-hidden="true">👁️</span>{' '}
              <strong>שהייה חשודה:</strong> מעקב פעיל ב
              {lastAlert.floorLabel ?? `קומה ${lastAlert.floor}`}.
            </p>
          )}
          {(lastAlert.type === 'resident' ||
            lastAlert.type === 'package' ||
            lastAlert.type === 'obstruction') && (
            <p className="vone-toast__message">
              זיהוי נוכחות ב{lastAlert.floorLabel ?? `קומה ${lastAlert.floor}`}.
            </p>
          )}

          {/* Thumbnail */}
          {lastAlert.thumbnailUrl && (
            <img
              src={lastAlert.thumbnailUrl}
              alt={`צילום מצלמה — ${lastAlert.cameraId}`}
              className="vone-toast__thumb"
            />
          )}

          {/* Actions for critical/high */}
          {isCriticalOrHigh && (
            <div className="vone-toast__actions">
              <button
                type="button"
                className="vone-toast__btn-resolve"
                onClick={() => void handleResolve(lastAlert.id)}
              >
                סמן כטופל
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VOneVisionWidget;
