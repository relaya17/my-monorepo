/**
 * Floor Attention Service — v3.0
 *
 * Business logic for dynamic security level computation:
 * - CRITICAL: unknown person on sensitive floor (children/elderly/VIP)
 * - HIGH:     unknown person / loitering anywhere after hours
 * - MEDIUM:   child arrival on sensitive floor during expected hours → track, not alert
 * - LOW:      everything else (package delivery, known residents)
 *
 * M&A ready: pure functions, zero side-effects, fully typed.
 */

import {
  SecurityLevel,
  DetectedObjectClass,
  VisionLogEventType,
  type IFloorContext,
  type IDetectedObject,
} from '../models/visionLogModel.js';

// ─── Types ────────────────────────────────────────────────────────

export interface AttentionInput {
  eventType: VisionLogEventType;
  floorContext?: IFloorContext;
  detectedObjects: IDetectedObject[];
  /** UTC hour (0-23) at the time of the event */
  hourUtc: number;
  /** Optional: building's UTC offset in hours — defaults to Israel (UTC+3) */
  buildingUtcOffset?: number;
}

export interface AttentionResult {
  securityLevel: SecurityLevel;
  reason: string;
}

// ─── Time helpers ─────────────────────────────────────────────────

/**
 * Returns true when current local hour falls in the "children return" window
 * (typically 12:00–17:00 local time in Israeli buildings).
 */
function isChildArrivalWindow(hourUtc: number, utcOffset: number): boolean {
  const localHour = (hourUtc + utcOffset + 24) % 24;
  return localHour >= 12 && localHour <= 17;
}

/**
 * Returns true when current local hour is outside normal activity hours (22:00–06:00).
 */
function isAfterHours(hourUtc: number, utcOffset: number): boolean {
  const localHour = (hourUtc + utcOffset + 24) % 24;
  return localHour >= 22 || localHour < 6;
}

// ─── Object presence helpers ──────────────────────────────────────

function hasUnknownPerson(objects: IDetectedObject[]): boolean {
  return objects.some(
    (o) =>
      o.objectClass === DetectedObjectClass.PERSON_UNKNOWN &&
      o.confidence >= 0.6
  );
}

function hasChild(objects: IDetectedObject[]): boolean {
  return objects.some(
    (o) =>
      o.objectClass === DetectedObjectClass.PERSON_CHILD &&
      o.confidence >= 0.55
  );
}

function hasKnownResident(objects: IDetectedObject[]): boolean {
  return objects.some(
    (o) =>
      o.objectClass === DetectedObjectClass.PERSON_RESIDENT &&
      o.confidence >= 0.7
  );
}

// ─── Core computation ─────────────────────────────────────────────

/**
 * Compute the appropriate security level for a vision event.
 *
 * Priority order (highest wins):
 * 1. CRITICAL – unknown person on sensitive floor at any time
 * 2. HIGH     – unknown person after hours / LOITERING / UNAUTHORIZED_ENTRY
 * 3. MEDIUM   – child arrival on sensitive floor during expected window
 *              OR unknown person on non-sensitive floor during day
 * 4. LOW      – package, known resident, or low-confidence detection
 */
export function computeSecurityLevel(input: AttentionInput): AttentionResult {
  const {
    eventType,
    floorContext,
    detectedObjects,
    hourUtc,
    buildingUtcOffset = 3, // Israel Standard Time
  } = input;

  const isSensitiveFloor = floorContext?.isSensitive ?? false;
  const floorLabel = floorContext?.floorLabel ?? `קומה ${floorContext?.floorNumber ?? '?'}`;
  const afterHours = isAfterHours(hourUtc, buildingUtcOffset);
  const childWindow = isChildArrivalWindow(hourUtc, buildingUtcOffset);

  // ── CRITICAL ──────────────────────────────────────────────────
  if (isSensitiveFloor && hasUnknownPerson(detectedObjects)) {
    return {
      securityLevel: SecurityLevel.CRITICAL,
      reason: `אדם לא מזוהה זוהה ב${floorLabel} (קומה רגישה)`,
    };
  }

  if (eventType === 'UNAUTHORIZED_ENTRY') {
    return {
      securityLevel: SecurityLevel.CRITICAL,
      reason: 'כניסה לא מורשית — אירוע קריטי',
    };
  }

  // ── HIGH ──────────────────────────────────────────────────────
  if (afterHours && hasUnknownPerson(detectedObjects)) {
    return {
      securityLevel: SecurityLevel.HIGH,
      reason: `אדם לא מזוהה זוהה בשעות לא שגרתיות ב${floorLabel}`,
    };
  }

  if (eventType === 'LOITERING') {
    return {
      securityLevel: SecurityLevel.HIGH,
      reason: `שהייה חשודה זוהתה ב${floorLabel}`,
    };
  }

  if (eventType === 'FLOOD_DETECTION') {
    return {
      securityLevel: SecurityLevel.HIGH,
      reason: `נזילה / הצפה זוהתה ב${floorLabel} — דורשת טיפול מיידי`,
    };
  }

  // ── MEDIUM ────────────────────────────────────────────────────
  if (isSensitiveFloor && hasChild(detectedObjects) && childWindow) {
    return {
      securityLevel: SecurityLevel.MEDIUM,
      reason: `זיהוי ילד/ים ב${floorLabel} בשעות חזרה מהלימודים — מעקב פעיל`,
    };
  }

  if (hasUnknownPerson(detectedObjects)) {
    return {
      securityLevel: SecurityLevel.MEDIUM,
      reason: `אדם לא מזוהה ב${floorLabel} בשעות רגילות — מעקב`,
    };
  }

  if (eventType === 'OBSTRUCTION') {
    return {
      securityLevel: SecurityLevel.MEDIUM,
      reason: `חסימה זוהתה ב${floorLabel} — עלולה לפגוע בפינוי חירום`,
    };
  }

  // ── LOW ───────────────────────────────────────────────────────
  if (hasKnownResident(detectedObjects)) {
    return {
      securityLevel: SecurityLevel.LOW,
      reason: `דייר מזוהה ב${floorLabel}`,
    };
  }

  if (eventType === 'PACKAGE_DELIVERY') {
    return {
      securityLevel: SecurityLevel.LOW,
      reason: `חבילה זוהתה ב${floorLabel}`,
    };
  }

  return {
    securityLevel: SecurityLevel.LOW,
    reason: `אירוע ${eventType} ב${floorLabel} — סיווג ברירת מחדל`,
  };
}

// ─── Sensitive-floor schedule optimizer ──────────────────────────

export interface FloorScheduleRule {
  floorNumber: number;
  floorLabel: string;
  /** Hours (local) during which this floor requires elevated attention */
  attentionHours: ReadonlyArray<number>;
}

/**
 * Returns true when the given floor should currently receive elevated monitoring.
 * Used by the NVR scheduler to increase polling frequency.
 */
export function isFloorAttentionActive(
  rule: FloorScheduleRule,
  hourUtc: number,
  utcOffset: number = 3
): boolean {
  const localHour = (hourUtc + utcOffset + 24) % 24;
  return rule.attentionHours.includes(localHour);
}

/**
 * Default sensitive-floor schedule for Israeli residential buildings.
 * Lobbies & playgrounds → morning + afternoon.
 * Parking → evening.
 */
export const DEFAULT_SENSITIVE_SCHEDULE: FloorScheduleRule[] = [
  {
    floorNumber: 0,
    floorLabel: 'כניסה ראשית',
    attentionHours: [7, 8, 12, 13, 14, 15, 16, 17, 22, 23],
  },
  {
    floorNumber: -1,
    floorLabel: 'חניון / מרתף',
    attentionHours: [18, 19, 20, 21, 22, 23, 0],
  },
];
