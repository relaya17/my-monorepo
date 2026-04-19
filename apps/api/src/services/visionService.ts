/**
 * Vision Processing Pipeline – VISION_SATELLITE_SPEC, VISION_SATELLITE_BOT_FLOW
 *
 * - v3.1: hash-chain (SHA-256) — tamper-evident immutable ledger.
 *   Every VisionLog entry stores the hash of the previous entry (previousHash)
 *   and its own SHA-256 (hash), forming a blockchain-style audit trail.
 */
import VisionLog, {
  type VisionLogEventType,
  type IFloorContext,
  type IDetectedObject,
  computeVisionHash,
  getLastVisionHash,
} from '../models/visionLogModel.js';
import Maintenance from '../models/maintenanceModel.js';
import { tenantContext } from '../middleware/tenantMiddleware.js';
import { computeSecurityLevel } from './floorAttentionService.js';
import crypto from 'crypto';

// Re-export for backward compatibility with existing consumers
export type VisionEventType = VisionLogEventType;

export interface VisionAnomaly {
  eventType: VisionEventType;
  cameraId: string;
  buildingId: string;
  confidence: number;
  timestamp: Date;
  frameUrl?: string;
  /** v3.0: optional floor context */
  floorContext?: IFloorContext;
  /** v3.0: objects detected in this frame */
  detectedObjects?: IDetectedObject[];
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function similarityHash(description: string): string {
  const normalized = (description ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
  return crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 24);
}

function eventToCategory(eventType: VisionEventType): 'Plumbing' | 'Security' | 'Other' {
  if (eventType === 'FLOOD_DETECTION') return 'Plumbing';
  if (eventType === 'UNAUTHORIZED_ENTRY') return 'Security';
  return 'Other';
}

function eventToTitle(eventType: VisionEventType, cameraId: string): string {
  const cam = cameraId || 'מצלמה';
  if (eventType === 'FLOOD_DETECTION') return `נזילה זוהתה – ${cam} (AI Vision)`;
  if (eventType === 'OBSTRUCTION') return `חסימה זוהתה – ${cam} (AI Vision)`;
  if (eventType === 'UNAUTHORIZED_ENTRY') return `כניסה לא מורשית – ${cam} (AI Vision)`;
  return `אנומליה – ${cam} (AI Vision)`;
}

/**
 * Save anomaly to VisionLog and optionally create Maintenance ticket (Peacekeeper dedup).
 * v3.0: attaches securityLevel computed by floorAttentionService.
 * v3.1: computes SHA-256 hash-chain entry before saving.
 */
export async function saveAnomalyToVisionLog(anomaly: VisionAnomaly): Promise<{ visionLogId: string; ticketCreated: boolean; securityLevel: string }> {
  const { buildingId, cameraId, eventType, confidence, timestamp, frameUrl, floorContext, detectedObjects = [] } = anomaly;

  const ts = timestamp ?? new Date();

  const { securityLevel } = computeSecurityLevel({
    eventType,
    floorContext,
    detectedObjects,
    hourUtc: ts.getUTCHours(),
  });

  // Hash-chain: fetch previous hash BEFORE entering tenantContext to avoid cross-tenant race conditions
  const previousHash = await getLastVisionHash();
  const chainHash = computeVisionHash(
    { cameraId, eventType, confidence, timestamp: ts, securityLevel },
    previousHash
  );

  const result = await tenantContext.run({ buildingId }, async () => {
    const visionLog = await VisionLog.create({
      cameraId,
      eventType,
      confidence,
      timestamp: ts,
      thumbnailUrl: frameUrl,
      resolved: false,
      floorContext: floorContext ?? undefined,
      detectedObjects,
      securityLevel,
      previousHash,
      hash: chainHash,
    });
    const visionLogId = String(visionLog._id);

    const desc = eventToTitle(eventType, cameraId);
    const hash = similarityHash(desc);
    const thirtyDaysAgo = new Date(Date.now() - THIRTY_DAYS_MS);
    const openDuplicate = await Maintenance.findOne({
      'aiAnalysis.similarityHash': hash,
      status: { $in: ['Open', 'In_Progress', 'Waiting_For_Parts'] },
      createdAt: { $gte: thirtyDaysAgo },
    })
      .select('_id')
      .lean();

    if (openDuplicate) return { visionLogId, ticketCreated: false };

    await Maintenance.create({
      title: desc,
      description: `זוהה אוטומטית ע"י AI Vision. מצלמה: ${cameraId}. סוג: ${eventType}.`,
      category: eventToCategory(eventType),
      priority: eventType === 'FLOOD_DETECTION' ? 'High' : 'Medium',
      source: 'AI_VISION',
      aiAnalysis: { similarityHash: hash, detectedAnomaly: eventType },
      eventId: visionLog._id,
    });
    return { visionLogId, ticketCreated: true, securityLevel };
  });
  return result;
}

/**
 * Process a single frame – integration point for CV provider.
 * When CV (YOLO / AWS Rekognition / OpenCV) detects anomaly:
 *   const anomaly: VisionAnomaly = { eventType, cameraId, buildingId, confidence, timestamp, frameUrl };
 *   await saveAnomalyToVisionLog(anomaly);
 *   return anomaly;
 * Anonymize faces (GDPR) before sending to CV.
 */
export async function processFrame(
  _frameBuffer: Buffer,
  _cameraId: string,
  _buildingId: string
): Promise<VisionAnomaly | null> {
  // TODO: Send to CV provider
  // TODO: Anonymize faces before processing
  return null;
}

/**
 * Start listening to RTSP stream – stub.
 */
export async function startStreamListener(
  _rtspUrl: string,
  _cameraId: string,
  _buildingId: string,
  _intervalSeconds: number = 10
): Promise<() => void> {
  // TODO: FFmpeg / node-rtsp-stream to capture frames
  // TODO: Call processFrame for each frame
  return () => {};
}
