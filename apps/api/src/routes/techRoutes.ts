/**
 * Technician flow: work order by magic-link token. No tenant header; tenant from token.
 * v3.1: Magic Link endpoints for AI-triggered access (GPS + hash-chain + resident notifications).
 */
import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import Maintenance from '../models/maintenanceModel.js';
import MaintenanceFeedback from '../models/maintenanceFeedbackModel.js';
import { tenantContext } from '../middleware/tenantMiddleware.js';
import { resolveTechnicianToken, invalidateTechnicianToken } from '../services/technicianAccessService.js';
import { createTransaction } from '../services/transactionService.js';
import { recordMaintenanceClosed } from '../services/buildingStatsService.js';
import { ContractorAccessService } from '../services/contractorAccessService.js';
import { createAuditEntry } from '../models/auditLogModel.js';
import { authMiddleware, verifySuperAdmin } from '../middleware/authMiddleware.js';
import { notifyFloorResidents } from '../services/notificationService.js';

const router = express.Router();

/** Rate-limit public magic-link endpoints: 10 req/min per IP */
const magicLinkLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'יותר מדי בקשות — נסה שוב בעוד דקה' },
});

// ─── Haversine helper ─────────────────────────────────────────────

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6_371_000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Magic Link — GET (validate + return task payload) ───────────

router.get('/magic/:token', magicLinkLimiter, async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    if (!token || token.length < 8) return res.status(400).json({ error: 'טוקן לא תקין' });

    const access = await ContractorAccessService.validateToken(token);
    if (!access) return res.status(403).json({ error: 'הקישור פג תוקף או אינו תקין' });

    res.json({ success: true, data: access });
  } catch {
    res.status(500).json({ error: 'שגיאת שרת' });
  }
});

// ─── Magic Link — POST unlock ────────────────────────────────────

interface UnlockBody { userLocation?: { lat: number; lng: number } }

router.post('/magic/:token/unlock', magicLinkLimiter, async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { userLocation } = req.body as UnlockBody;

    const access = await ContractorAccessService.validateToken(token);
    if (!access) return res.status(403).json({ error: 'הקישור פג תוקף' });

    // Server-side GPS guard
    if (access.isGpsRequired && userLocation && access.buildingLat != null && access.buildingLng != null) {
      const dist = haversineMeters(userLocation.lat, userLocation.lng, access.buildingLat, access.buildingLng);
      if (dist > 100) {
        return res.status(403).json({ error: `מרחק ${Math.round(dist)} מ' — נדרש להיות עד 100 מ' מהבניין`, distance: Math.round(dist) });
      }
    }

    // Audit trail
    await createAuditEntry({
      action: 'TECHNICIAN_UNLOCK',
      buildingId: access.buildingId,
      performedBy: access.contractorId ?? 'technician',
      details: { floor: access.floor, floorLabel: access.floorLabel ?? null, location: userLocation ?? null },
    });

    // Proactive notification to residents
    const floorDisplay = access.floorLabel ?? `קומה ${access.floor}`;
    notifyFloorResidents({
      buildingId: access.buildingId,
      floor: access.floor,
      message: {
        he: `עדכון V.One: הטכנאי נכנס לבניין לטיפול בתקלה ב${floorDisplay}.`,
        en: `V.One Update: Technician entered the building for ${floorDisplay} maintenance.`,
      },
      type: 'maintenance',
    });

    res.json({ success: true, message: 'גישה אושרה. הודעה נשלחה לדיירי הקומה.' });
  } catch {
    res.status(500).json({ error: 'שגיאה בפתיחת הגישה' });
  }
});

// ─── Magic Link — POST complete ───────────────────────────────────

interface CompleteBody { notes?: string }

router.post('/magic/:token/complete', magicLinkLimiter, async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { notes } = req.body as CompleteBody;

    const access = await ContractorAccessService.validateToken(token);
    if (!access) return res.status(403).json({ error: 'הקישור לא תקין' });

    await ContractorAccessService.revokeToken(token);
    await createAuditEntry({
      action: 'TECHNICIAN_JOB_COMPLETE',
      buildingId: access.buildingId,
      performedBy: access.contractorId ?? 'technician',
      details: { floor: access.floor, notes: notes?.trim() ?? null },
    });

    res.json({ success: true, message: 'המשימה הושלמה. הקישור בוטל.' });
  } catch {
    res.status(500).json({ error: 'שגיאה בסיום המשימה' });
  }
});

// ─── Generate magic link (admin only) ────────────────────────────

interface GenerateBody {
  buildingId: string; floor: number; floorLabel?: string;
  contractorId?: string; buildingLat?: number; buildingLng?: number;
  isGpsRequired?: boolean; visionLogId?: string; ttlHours?: number;
}

router.post('/magic/generate', authMiddleware, async (req: Request, res: Response) => {
  try {
    const auth = req.auth;
    if (!auth || (auth.type !== 'admin' && auth.type !== 'super-admin')) {
      return res.status(403).json({ error: 'גישה לאדמינים בלבד' });
    }
    const body = req.body as GenerateBody;
    if (!body.buildingId?.trim() || body.floor == null) {
      return res.status(400).json({ error: 'buildingId ו-floor הם שדות חובה' });
    }
    const ttlMs = Math.min(body.ttlHours ?? 2, 24) * 60 * 60 * 1000;
    const { token, url } = await ContractorAccessService.generateLink({
      buildingId: body.buildingId.trim(),
      floor: body.floor,
      floorLabel: body.floorLabel,
      contractorId: body.contractorId,
      buildingLat: body.buildingLat,
      buildingLng: body.buildingLng,
      isGpsRequired: body.isGpsRequired ?? true,
      visionLogId: body.visionLogId,
      ttlMs,
    });
    res.status(201).json({ token, url, ttlMs });
  } catch {
    res.status(500).json({ error: 'שגיאה ביצירת קישור' });
  }
});

// ─── List active magic links (super-admin) ────────────────────────

router.get('/magic/links', verifySuperAdmin, async (_req: Request, res: Response) => {
  try {
    const { MagicLink } = await import('../models/magicLinkModel.js');
    const links = await MagicLink.find({ isActive: true, expiresAt: { $gt: new Date() } })
      .sort({ createdAt: -1 }).limit(50).select('-tokenHash').lean();
    res.json({ links });
  } catch {
    res.status(500).json({ error: 'שגיאה בשליפת קישורים' });
  }
});

router.get('/work-order/:token', async (req: Request, res: Response) => {
  const token = req.params.token;
  if (!token) return res.status(400).json({ error: 'Missing token' });
  const payload = await resolveTechnicianToken(token);
  if (!payload) return res.status(404).json({ error: 'Link expired or invalid' });
  const { maintenanceId, buildingId } = payload;
  const doc = await tenantContext.run({ buildingId }, async () =>
    Maintenance.findById(maintenanceId).lean()
  );
  if (!doc) return res.status(404).json({ error: 'Work order not found' });
  res.json(doc);
});

router.patch('/work-order/:token', async (req: Request, res: Response) => {
  const token = req.params.token;
  if (!token) return res.status(400).json({ error: 'Missing token' });
  const payload = await resolveTechnicianToken(token);
  if (!payload) return res.status(404).json({ error: 'Link expired or invalid' });
  const { maintenanceId, buildingId } = payload;
  const body = req.body as Record<string, unknown>;
  const update: Record<string, unknown> = {};
  if (body.status !== undefined) update.status = body.status;
  if (body.technicianNotes !== undefined) update.technicianNotes = body.technicianNotes;
  if (body.beforeImageUrl !== undefined) update.beforeImageUrl = body.beforeImageUrl;
  if (body.afterImageUrl !== undefined) update.afterImageUrl = body.afterImageUrl;
  if (body.locationVerified !== undefined) update.locationVerified = body.locationVerified;
  if (body.actualCost !== undefined) update.actualCost = body.actualCost;
  if (body.partsReplaced !== undefined) update.partsReplaced = body.partsReplaced;
  if (body.locationProof !== undefined) update.locationProof = body.locationProof;
  if (body.status === 'Resolved' || body.status === 'Closed') {
    update.resolvedAt = new Date();
  }
  const updated = await tenantContext.run({ buildingId }, async () =>
    Maintenance.findByIdAndUpdate(maintenanceId, { $set: update }, { new: true }).lean()
  );
  if (!updated) return res.status(404).json({ error: 'Work order not found' });
    if (updated.status === 'Resolved' || updated.status === 'Closed') {
    await invalidateTechnicianToken(token);
    recordMaintenanceClosed(buildingId, (updated as { actualCost?: number }).actualCost).catch(() => {});
    const cost = (updated as { actualCost?: number }).actualCost;
    const category = (updated as { category?: string }).category;
    const title = (updated as { title?: string }).title;
    if (typeof cost === 'number' && cost > 0) {
      await createTransaction(buildingId, {
        type: 'expense',
        amount: cost,
        relatedMaintenanceId: maintenanceId,
        category: category ?? 'Other',
        description: title ?? 'Maintenance',
      }).catch(() => {});
    }
    const reporterId = (updated as { reporterId?: { toString?: () => string } }).reporterId;
    const contractorName = (updated as { assignedContractor?: { name?: string } }).assignedContractor?.name;
    if (reporterId) {
      await tenantContext.run({ buildingId }, async () => {
        const existing = await MaintenanceFeedback.findOne({ maintenanceId, residentId: reporterId });
        if (!existing) {
          await MaintenanceFeedback.create({
            maintenanceId,
            residentId: reporterId,
            status: 'pending',
            contractorName: contractorName || undefined,
          });
        }
      }).catch((err) => console.error('MaintenanceFeedback create error:', err));
    }
  }
  res.json(updated);
});

export default router;
