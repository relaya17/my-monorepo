/**
 * Vision routes — NVR/DVR camera event intake + admin VisionLog viewer.
 *
 * Camera pushes events via REST (no RTSP dependency on backend).
 * saveAnomalyToVisionLog() in visionService.ts handles DB + auto-ticket creation.
 *
 * POST /api/vision/event              – camera/agent pushes anomaly event (secured by API key)
 * GET  /api/vision/logs               – admin: list vision log entries
 * PATCH /api/vision/:id/resolve       – admin: mark resolved
 * GET  /api/vision/floor-schedule     – return default sensitive-floor schedule
 */
import { Request, Response, Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { tenantContext } from '../middleware/tenantMiddleware.js';
import { saveAnomalyToVisionLog, type VisionAnomaly } from '../services/visionService.js';
import { DEFAULT_SENSITIVE_SCHEDULE } from '../services/floorAttentionService.js';
import VisionLog, { type VisionLogEventType, type IFloorContext, type IDetectedObject, DetectedObjectClass } from '../models/visionLogModel.js';

const router = Router();
const CAMERA_API_KEY_ENV = process.env.CAMERA_API_KEY ?? '';

const VALID_EVENTS: VisionLogEventType[] = [
  'FLOOD_DETECTION',
  'OBSTRUCTION',
  'UNAUTHORIZED_ENTRY',
  'CHILD_ARRIVAL',
  'PACKAGE_DELIVERY',
  'LOITERING',
];

function getBuildingId(req: Request): string {
  return (req.headers['x-building-id'] as string)?.trim() || req.auth?.buildingId || 'default';
}

/**
 * Authenticate camera devices using an API key header.
 * Camera hardware or NVR agent sends: `x-camera-key: <CAMERA_API_KEY>`
 * Falls back to standard JWT auth middleware for admin clients.
 */
function cameraOrAdminAuth(req: Request, res: Response, next: () => void): void {
  const cameraKey = req.headers['x-camera-key'] as string | undefined;
  if (CAMERA_API_KEY_ENV && cameraKey === CAMERA_API_KEY_ENV) {
    next();
    return;
  }
  authMiddleware(req, res, next);
}

// ─── Validation helpers ───────────────────────────────────────────

function parseFloorContext(raw: unknown): IFloorContext | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const obj = raw as Record<string, unknown>;
  const floorNumber = Number(obj.floorNumber);
  if (!Number.isFinite(floorNumber)) return undefined;
  return {
    floorNumber,
    isSensitive: Boolean(obj.isSensitive),
    floorLabel: typeof obj.floorLabel === 'string' ? obj.floorLabel.trim() : undefined,
  };
}

function parseDetectedObjects(raw: unknown): IDetectedObject[] {
  if (!Array.isArray(raw)) return [];
  const validClasses = new Set<string>(Object.values(DetectedObjectClass));
  return raw
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === 'object' && item !== null
    )
    .filter((item) => validClasses.has(item.objectClass as string))
    .map((item) => ({
      objectClass: item.objectClass as DetectedObjectClass,
      confidence: Number(item.confidence ?? 1),
      boundingBox: Array.isArray(item.boundingBox) && item.boundingBox.length === 4
        ? (item.boundingBox as [number, number, number, number])
        : undefined,
    }));
}

// ─── POST /api/vision/event ───────────────────────────────────────

/** POST /api/vision/event — camera/NVR pushes anomaly */
router.post('/event', cameraOrAdminAuth, async (req: Request, res: Response) => {
  try {
    const buildingId = getBuildingId(req);
    const { cameraId, eventType, confidence, frameUrl, timestamp, floorContext, detectedObjects } = req.body as {
      cameraId?: string;
      eventType?: string;
      confidence?: number;
      frameUrl?: string;
      timestamp?: string;
      floorContext?: unknown;
      detectedObjects?: unknown;
    };

    if (!cameraId?.trim() || !eventType) {
      return res.status(400).json({ error: 'cameraId ו-eventType הם שדות חובה' });
    }
    if (!VALID_EVENTS.includes(eventType as VisionLogEventType)) {
      return res.status(400).json({ error: `eventType חייב להיות אחד מ: ${VALID_EVENTS.join(', ')}` });
    }
    const conf = Number(confidence);
    if (!Number.isFinite(conf) || conf < 0 || conf > 1) {
      return res.status(400).json({ error: 'confidence חייב להיות בין 0 ל-1' });
    }

    const anomaly: VisionAnomaly = {
      eventType: eventType as VisionLogEventType,
      cameraId: cameraId.trim(),
      buildingId,
      confidence: conf,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      frameUrl: frameUrl?.trim(),
      floorContext: parseFloorContext(floorContext),
      detectedObjects: parseDetectedObjects(detectedObjects),
    };

    const result = await saveAnomalyToVisionLog(anomaly);
    res.status(201).json({ ...result, eventType, cameraId });
  } catch {
    res.status(500).json({ error: 'שגיאה בקליטת אירוע המצלמה' });
  }
});

/** GET /api/vision/logs — admin: list logs with pagination */
router.get('/logs', authMiddleware, async (req: Request, res: Response) => {
  try {
    const auth = req.auth;
    if (!auth || auth.type !== 'admin') return res.status(403).json({ error: 'גישה לאדמינים בלבד' });
    const buildingId = getBuildingId(req);
    const limit = Math.min(200, parseInt(req.query.limit as string) || 50);
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const skip = (page - 1) * limit;
    const resolved = req.query.resolved === 'true'
      ? true
      : req.query.resolved === 'false'
        ? false
        : undefined;

    const filter: Record<string, unknown> = {};
    if (resolved !== undefined) filter.resolved = resolved;

    const [logs, total] = await tenantContext.run({ buildingId }, () =>
      Promise.all([
        VisionLog.find(filter).sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
        VisionLog.countDocuments(filter),
      ])
    );

    res.json({ logs, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch {
    res.status(500).json({ error: 'שגיאה בטעינת יומן המצלמות' });
  }
});

/** PATCH /api/vision/:id/resolve — mark event resolved */
router.patch('/:id/resolve', authMiddleware, async (req: Request, res: Response) => {
  try {
    const auth = req.auth;
    if (!auth || auth.type !== 'admin') return res.status(403).json({ error: 'גישה לאדמינים בלבד' });
    const buildingId = getBuildingId(req);
    const log = await tenantContext.run({ buildingId }, () =>
      VisionLog.findById(req.params.id)
    );
    if (!log) return res.status(404).json({ error: 'אירוע לא נמצא' });
    log.resolved = true;
    await log.save();
    res.json({ resolved: true, id: log._id });
  } catch {
    res.status(500).json({ error: 'שגיאה בעדכון האירוע' });
  }
});

/** GET /api/vision/floor-schedule — return default sensitive-floor attention schedule */
router.get('/floor-schedule', authMiddleware, (_req: Request, res: Response) => {
  res.json({ schedule: DEFAULT_SENSITIVE_SCHEDULE });
});

export default router;
