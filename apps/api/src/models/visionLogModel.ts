/**
 * AI Vision Logs – for CEO Dashboard & Anomaly Detection.
 * v3.0: floor tracking, object classification, security level.
 * v3.1: hash-chain (SHA-256) — tamper-evident immutable ledger.
 */
import mongoose, { Document, Schema } from 'mongoose';
import { multiTenancyPlugin } from '../utils/multiTenancy.js';
import crypto from 'crypto';

export type VisionLogEventType =
  | 'FLOOD_DETECTION'
  | 'OBSTRUCTION'
  | 'UNAUTHORIZED_ENTRY'
  | 'CHILD_ARRIVAL'
  | 'PACKAGE_DELIVERY'
  | 'LOITERING';

export enum SecurityLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum DetectedObjectClass {
  PERSON_RESIDENT = 'PERSON_RESIDENT',
  PERSON_UNKNOWN = 'PERSON_UNKNOWN',
  PERSON_CHILD = 'PERSON_CHILD',
  VEHICLE = 'VEHICLE',
  PACKAGE = 'PACKAGE',
  WATER = 'WATER',
  FIRE = 'FIRE',
  BLOCKED_EXIT = 'BLOCKED_EXIT',
}

export interface IFloorContext {
  /** קומה (0 = קרקע, 1..N = קומות מגורים) */
  floorNumber: number;
  /** האם קומה מסומנת כרגישה (ילדים, קשישים, VIP) */
  isSensitive: boolean;
  /** שם תיאורי כגון "קומת כניסה" / "קומה 3 — ילדים" */
  floorLabel?: string;
}

export interface IDetectedObject {
  objectClass: DetectedObjectClass;
  confidence: number;
  /** bbox כ-[x, y, w, h] ב-% מרוחב/גובה הפריים – לשימוש עתידי ב-UI */
  boundingBox?: [number, number, number, number];
}

export interface IVisionLog extends Document {
  cameraId: string;
  eventType: VisionLogEventType;
  confidence: number;
  resolved: boolean;
  timestamp: Date;
  thumbnailUrl?: string;
  /** קונטקסט הקומה בה הוצב המצלמה */
  floorContext?: IFloorContext;
  /** אובייקטים שזוהו בפריים */
  detectedObjects: IDetectedObject[];
  /** רמת האבטחה המחושבת עבור אירוע זה */
  securityLevel: SecurityLevel;
  /** מזהה טיקט תחזוקה שנוצר אוטומטית (אם יש) */
  maintenanceTicketId?: string;
  /** Hash-Chain — SHA-256 של ה-hash של האירוע הקודם */
  previousHash: string;
  /** SHA-256 של תוכן האירוע + previousHash */
  hash: string;
  createdAt: Date;
  updatedAt: Date;
}

const floorContextSchema = new Schema<IFloorContext>(
  {
    floorNumber: { type: Number, required: true },
    isSensitive: { type: Boolean, default: false },
    floorLabel: { type: String },
  },
  { _id: false }
);

const detectedObjectSchema = new Schema<IDetectedObject>(
  {
    objectClass: {
      type: String,
      enum: Object.values(DetectedObjectClass),
      required: true,
    },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    boundingBox: { type: [Number], default: undefined },
  },
  { _id: false }
);

const visionLogSchema = new Schema<IVisionLog>(
  {
    cameraId: { type: String, required: true },
    eventType: {
      type: String,
      enum: ['FLOOD_DETECTION', 'OBSTRUCTION', 'UNAUTHORIZED_ENTRY', 'CHILD_ARRIVAL', 'PACKAGE_DELIVERY', 'LOITERING'],
      required: true,
    },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    resolved: { type: Boolean, default: false },
    timestamp: { type: Date, required: true, default: Date.now },
    thumbnailUrl: { type: String },
    floorContext: { type: floorContextSchema, default: undefined },
    detectedObjects: { type: [detectedObjectSchema], default: [] },
    securityLevel: {
      type: String,
      enum: Object.values(SecurityLevel),
      default: SecurityLevel.LOW,
    },
    maintenanceTicketId: { type: String },
    previousHash: { type: String, required: true, default: 'GENESIS' },
    hash: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

visionLogSchema.index({ buildingId: 1, timestamp: -1 });
visionLogSchema.index({ buildingId: 1, resolved: 1 });
visionLogSchema.index({ buildingId: 1, securityLevel: 1, timestamp: -1 });
visionLogSchema.plugin(multiTenancyPlugin);

export const VisionLog = mongoose.model<IVisionLog>('VisionLog', visionLogSchema);
export default VisionLog;

// ─── Chain helpers (exported for use in visionService) ────────────

/** Compute SHA-256 hash for a vision log entry */
export function computeVisionHash(
  entry: Pick<IVisionLog, 'cameraId' | 'eventType' | 'confidence' | 'timestamp' | 'securityLevel'>,
  previousHash: string
): string {
  const payload = JSON.stringify({
    cameraId: entry.cameraId,
    eventType: entry.eventType,
    confidence: entry.confidence,
    timestamp: entry.timestamp instanceof Date ? entry.timestamp.toISOString() : String(entry.timestamp),
    securityLevel: entry.securityLevel,
    previousHash,
  });
  return crypto.createHash('sha256').update(payload).digest('hex');
}

/** Fetch the hash of the most recent VisionLog (GENESIS if none) */
export async function getLastVisionHash(): Promise<string> {
  const last = await VisionLog.collection
    .find({})
    .sort({ createdAt: -1 })
    .limit(1)
    .project({ hash: 1 })
    .toArray();
  return (last[0] as { hash?: string } | undefined)?.hash ?? 'GENESIS';
}

/** Verify the full chain (cross-tenant — CEO use only) */
export async function verifyVisionChain(): Promise<{ valid: boolean; checkedCount: number; brokenAt?: { id: string; index: number } }> {
  const entries = await VisionLog.collection
    .find({})
    .sort({ createdAt: 1 })
    .project({ _id: 1, cameraId: 1, eventType: 1, confidence: 1, timestamp: 1, securityLevel: 1, previousHash: 1, hash: 1 })
    .toArray() as Array<{
      _id: unknown;
      cameraId: string;
      eventType: string;
      confidence: number;
      timestamp: Date;
      securityLevel: string;
      previousHash: string;
      hash: string;
    }>;

  let prevHash = 'GENESIS';
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    // Verify previousHash link
    if (e.previousHash !== prevHash) {
      return { valid: false, checkedCount: i + 1, brokenAt: { id: String(e._id), index: i } };
    }
    // Recompute hash and verify
    const expected = computeVisionHash(
      { cameraId: e.cameraId, eventType: e.eventType as VisionLogEventType, confidence: e.confidence, timestamp: e.timestamp, securityLevel: e.securityLevel as SecurityLevel },
      e.previousHash
    );
    if (expected !== e.hash) {
      return { valid: false, checkedCount: i + 1, brokenAt: { id: String(e._id), index: i } };
    }
    prevHash = e.hash;
  }
  return { valid: true, checkedCount: entries.length };
}
