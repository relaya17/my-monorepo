/**
 * Maintenance CRUD and "send to technician" (magic link).
 * AI Peacekeeper: duplicate check on open tickets in last 30 days; similarityHash stored on create.
 */
import crypto from 'crypto';
import express, { Request, Response } from 'express';
import Maintenance from '../models/maintenanceModel.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { tenantContext } from '../middleware/tenantMiddleware.js';
import { generateTechnicianLink } from '../services/technicianAccessService.js';
import { analyzeMaintenancePatterns, runPredictiveMaintenanceAI } from '../services/maintenanceAiService.js';
import { recordDuplicatePrevented } from '../services/buildingStatsService.js';
import { getOrSetCache } from '../utils/cache.js';

const router = express.Router();
const PATTERNS_TTL = 600;
const PREDICTIONS_TTL = 600;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/** Normalize and hash description for AI Peacekeeper (30-day duplicate check). */
function similarityHash(description: string): string {
  const normalized = (description ?? '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
  return crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 24);
}

router.get('/', async (_req: Request, res: Response) => {
  try {
    const list = await Maintenance.find().sort({ createdAt: -1 }).lean();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'שגיאה בשליפת תקלות' });
  }
});

router.get('/patterns', async (_req: Request, res: Response) => {
  try {
    const buildingId = tenantContext.getStore()?.buildingId ?? 'default';
    const insights = await getOrSetCache(
      `patterns:${buildingId}`,
      () => analyzeMaintenancePatterns(buildingId),
      PATTERNS_TTL
    );
    res.json({ insights });
  } catch (err) {
    res.status(500).json({ error: 'שגיאה בניתוח דפוסים' });
  }
});

router.get('/predictions', async (_req: Request, res: Response) => {
  try {
    const buildingId = tenantContext.getStore()?.buildingId ?? 'default';
    const warnings = await getOrSetCache(
      `predictions:${buildingId}`,
      () => runPredictiveMaintenanceAI(buildingId),
      PREDICTIONS_TTL
    );
    res.json({ warnings });
  } catch (err) {
    res.status(500).json({ error: 'שגיאה בחיזוי' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const doc = await Maintenance.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ error: 'תקלה לא נמצאה' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: 'שגיאה' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const buildingId = tenantContext.getStore()?.buildingId ?? 'default';
    const body = req.body as Record<string, unknown>;
    const category = body.category as string | undefined;
    const description = (body.description as string) ?? '';
    const hash = similarityHash(description);

    const thirtyDaysAgo = new Date(Date.now() - THIRTY_DAYS_MS);
    const openDuplicate = await tenantContext.run({ buildingId }, async () => {
      const openStatus = { $in: ['Open', 'In_Progress', 'Waiting_For_Parts'] as const };
      const inLast30Days = { createdAt: { $gte: thirtyDaysAgo } };
      const sameHash = await Maintenance.findOne({
        'aiAnalysis.similarityHash': hash,
        status: openStatus,
        ...inLast30Days,
      }).select('_id').lean();
      if (sameHash) return sameHash;
      if (!category) return null;
      const sameCategory = await Maintenance.findOne({
        category,
        status: openStatus,
        ...inLast30Days,
      }).select('_id').lean();
      return sameCategory;
    });

    if (openDuplicate) {
      recordDuplicatePrevented(buildingId).catch(() => {});
      return res.status(409).json({
        error: 'נמצאה תקלה דומה. האם תרצי להתחבר אליה או לפתוח חדשה?',
        duplicateAlert: true,
        existingId: (openDuplicate as { _id: unknown })._id,
      });
    }

    const doc = await tenantContext.run({ buildingId }, async () =>
      Maintenance.create({
        title: body.title,
        description: body.description,
        category: body.category,
        priority: body.priority ?? 'Medium',
        reporterId: body.reporterId ?? undefined,
        assignedContractor: body.assignedContractor,
        source: body.source ?? 'RESIDENT',
        aiAnalysis: { similarityHash: hash },
      })
    );
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: 'שגיאה ביצירת תקלה' });
  }
});

router.post('/:id/send-technician', authMiddleware, async (req: Request, res: Response) => {
  try {
    const maintenanceId = req.params.id;
    const buildingId = tenantContext.getStore()?.buildingId ?? 'default';
    const phoneNumber = (req.body as { phoneNumber?: string }).phoneNumber;
    const link = await generateTechnicianLink(maintenanceId, buildingId, phoneNumber);
    res.json({ link, message: 'לינק נשלח לטכנאי' });
  } catch (err) {
    res.status(500).json({ error: 'שגיאה ביצירת לינק לטכנאי' });
  }
});

export default router;
