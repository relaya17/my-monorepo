/**
 * Routes for super-admin (CEO) – activity stream, global stats, global search, vision logs (Anomaly Feed). Protected by verifySuperAdmin.
 */
import express, { Request, Response } from 'express';
import { AuditLog } from '../models/auditLogModel.js';
import Payment from '../models/paymentModel.js';
import Building from '../models/buildingModel.js';
import BuildingStats from '../models/buildingStatsModel.js';
import User from '../models/userModel.js';
import VisionLog from '../models/visionLogModel.js';
import { tenantContext } from '../middleware/tenantMiddleware.js';
import { verifySuperAdmin } from '../middleware/authMiddleware.js';
import { getOrSetCache } from '../utils/cache.js';
import { runMonthlyReconciliation } from '../services/reconciliationService.js';

const router = express.Router();
const GLOBAL_STATS_TTL = 300;

router.get('/activity-stream', verifySuperAdmin, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const page = Math.max(1, Number(req.query.page) || 1);
    const skip = (page - 1) * limit;

    const logs = await AuditLog.find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await AuditLog.countDocuments();
    res.json({ logs, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: 'שגיאה בשליפת יומן הפעילות' });
  }
});

router.get('/global-stats', verifySuperAdmin, async (_req: Request, res: Response) => {
  try {
    const data = await getOrSetCache(
      'global-stats',
      async () => {
        const [totalRevenueResult, activeBuildings, impactAgg] = await Promise.all([
          Payment.collection.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]).toArray(),
          Building.countDocuments(),
          BuildingStats.aggregate([
            { $group: { _id: null, totalMoneySaved: { $sum: '$moneySavedByAI' }, preventedFailures: { $sum: '$preventedFailuresCount' } } },
          ]).then((r) => r[0] ?? { totalMoneySaved: 0, preventedFailures: 0 }),
        ]);
        const totalRevenue = totalRevenueResult[0]?.total ?? 0;
        return {
          totalRevenue,
          activeBuildings,
          totalMoneySaved: impactAgg.totalMoneySaved ?? 0,
          preventedFailures: impactAgg.preventedFailures ?? 0,
        };
      },
      GLOBAL_STATS_TTL
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'שגיאה בשליפת סטטיסטיקות גלובליות' });
  }
});

/** Anomaly Feed for CEO Dashboard – VisionLog across all buildings (no tenant filter). */
router.get('/vision-logs', verifySuperAdmin, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const raw = await VisionLog.collection
      .find({})
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
    const list = raw.map((d: { _id: unknown; buildingId?: string; cameraId?: string; eventType?: string; confidence?: number; resolved?: boolean; timestamp?: Date; thumbnailUrl?: string }) => ({
      id: String(d._id),
      buildingId: d.buildingId,
      cameraId: d.cameraId,
      eventType: d.eventType,
      confidence: d.confidence,
      resolved: d.resolved,
      timestamp: d.timestamp,
      thumbnailUrl: d.thumbnailUrl,
    }));
    res.json({ items: list });
  } catch (err) {
    res.status(500).json({ error: 'שגיאה בשליפת לוגי Vision' });
  }
});

router.get('/search', verifySuperAdmin, async (req: Request, res: Response) => {
  try {
    const q = String(req.query.q ?? '').trim();
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    if (!q) return res.status(400).json({ error: 'חסר פרמטר חיפוש q' });

    const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const num = Number(q);
    const isNum = !Number.isNaN(num);

    const [users, buildings, payments] = await Promise.all([
      tenantContext.run({ buildingId: '*' }, async () =>
        User.find({
          $or: [
            { name: re },
            { email: re },
            { apartmentNumber: re },
          ],
        })
          .select('-password')
          .limit(limit)
          .lean()
      ),
      Building.find({
        $or: [
          { address: re },
          { buildingNumber: re },
          { committeeName: re },
        ],
      })
        .limit(limit)
        .lean(),
      tenantContext.run({ buildingId: '*' }, async () =>
        Payment.find(
          isNum ? { amount: num } : { payer: re }
        )
          .limit(limit)
          .lean()
      ),
    ]);

    res.json({ users, buildings, payments });
  } catch (err) {
    res.status(500).json({ error: 'שגיאה בחיפוש' });
  }
});

router.get('/reconcile', verifySuperAdmin, async (req: Request, res: Response) => {
  try {
    const buildingId = String(req.query.buildingId ?? '').trim();
    if (!buildingId) return res.status(400).json({ error: 'חסר buildingId' });
    const monthParam = req.query.month as string | undefined;
    const month = monthParam ? new Date(monthParam + '-01') : undefined;
    if (month !== undefined && Number.isNaN(month.getTime())) return res.status(400).json({ error: 'תאריך חודש לא תקין (YYYY-MM)' });
    const result = await runMonthlyReconciliation(buildingId, month);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'שגיאה בפיוס' });
  }
});

export default router;
