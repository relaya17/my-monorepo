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
import Transaction from '../models/transactionModel.js';
import MaintenanceFeedback from '../models/maintenanceFeedbackModel.js';
import RealEstateLead from '../models/realEstateLeadModel.js';
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

/** Global Ledger – דוח תנועות כסף לכל בניין (Transaction per building). */
router.get('/global-ledger', verifySuperAdmin, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const raw = await tenantContext.run({ buildingId: '*' }, async () =>
      Transaction.find({})
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('buildingId type amount category description createdAt')
        .lean()
    );
    const buildingIds = [...new Set((raw as { buildingId?: string }[]).map((r) => r.buildingId).filter(Boolean))];
    const buildingDocs = await Building.find({ buildingId: { $in: buildingIds } }).lean();
    const byId = Object.fromEntries(
      buildingDocs.map((b) => [
        (b as { buildingId: string }).buildingId,
        (b as { committeeName?: string }).committeeName || (b as { address?: string }).address || (b as { buildingId: string }).buildingId,
      ])
    );
    const items = (raw as { buildingId?: string; type?: string; amount?: number; category?: string; description?: string; createdAt?: Date }[]).map((r) => ({
      buildingId: r.buildingId ?? 'default',
      buildingName: byId[r.buildingId ?? ''] ?? r.buildingId ?? '-',
      type: r.type,
      amount: r.amount,
      category: r.category,
      description: r.description,
      createdAt: r.createdAt,
    }));
    const byBuilding = items.reduce(
      (acc, t) => {
        const id = t.buildingId;
        if (!acc[id]) acc[id] = { buildingId: id, buildingName: t.buildingName, totalIncome: 0, totalExpense: 0, transactionCount: 0 };
        if (t.type === 'income') acc[id].totalIncome += t.amount ?? 0;
        else acc[id].totalExpense += t.amount ?? 0;
        acc[id].transactionCount += 1;
        return acc;
      },
      {} as Record<string, { buildingId: string; buildingName: string; totalIncome: number; totalExpense: number; transactionCount: number }>
    );
    res.json({ items: Object.values(byBuilding) });
  } catch (err) {
    res.status(500).json({ error: 'שגיאה בשליפת דוח תנועות' });
  }
});

/** Transparency Ledger – קבלנים מתחת ל־4.2 גלובלית (למנכ"לית) */
router.get('/vendor-alerts', verifySuperAdmin, async (_req: Request, res: Response) => {
  try {
    const THRESHOLD = 4.2;
    const raw = await tenantContext.run({ buildingId: '*' }, async () =>
      MaintenanceFeedback.aggregate([
        { $match: { status: 'submitted', rating: { $exists: true }, contractorName: { $exists: true, $nin: [null, ''] } } },
        { $group: { _id: { contractor: '$contractorName', building: '$buildingId' }, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
        { $match: { avg: { $lt: THRESHOLD }, count: { $gte: 1 } } },
        { $project: { contractorName: '$_id.contractor', buildingId: '$_id.building', avgRating: { $round: ['$avg', 2] }, count: 1, _id: 0 } },
      ])
    );
    res.json({ alerts: raw, threshold: THRESHOLD });
  } catch (err) {
    res.status(500).json({ error: 'שגיאה בשליפת התראות קבלנים' });
  }
});

/** Real Estate Opportunities – Revenue Share Ecosystem. לידים מ-V-One (מכירה/השכרה). */
router.get('/real-estate-leads', verifySuperAdmin, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const status = (req.query.status as string)?.trim();
    const raw = await tenantContext.run({ buildingId: '*' }, async () => {
      const q: Record<string, unknown> = {};
      if (status && ['new', 'in_progress', 'closed'].includes(status)) q.status = status;
      return RealEstateLead.find(q)
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('apartmentNumber residentName residentEmail residentPhone dealType status buildingId createdAt')
        .lean();
    });
    const buildingIds = [...new Set((raw as { buildingId?: string }[]).map((r) => r.buildingId).filter(Boolean))];
    const buildingDocs = await Building.find({ buildingId: { $in: buildingIds } }).lean();
    const byId = Object.fromEntries(
      buildingDocs.map((b) => [
        (b as { buildingId: string }).buildingId,
        (b as { committeeName?: string }).committeeName || (b as { address?: string }).address || (b as { buildingId: string }).buildingId,
      ])
    );
    const items = (raw as { _id?: unknown; apartmentNumber?: string; residentName?: string; residentEmail?: string; residentPhone?: string; dealType?: string; status?: string; buildingId?: string; createdAt?: Date }[]).map((r) => ({
      id: String((r as { _id?: { toString?: () => string } })._id?.toString?.() ?? ''),
      apartmentNumber: r.apartmentNumber ?? '',
      residentName: r.residentName ?? '',
      residentEmail: r.residentEmail ?? '',
      residentPhone: r.residentPhone,
      dealType: r.dealType ?? 'sale',
      status: r.status ?? 'new',
      buildingId: r.buildingId ?? 'default',
      buildingName: byId[r.buildingId ?? ''] ?? r.buildingId ?? '-',
      createdAt: r.createdAt,
    }));
    const countThisMonth = await tenantContext.run({ buildingId: '*' }, async () => {
      const start = new Date();
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      return RealEstateLead.countDocuments({ createdAt: { $gte: start } });
    });
    res.json({ items, countThisMonth });
  } catch (err) {
    console.error('Real estate leads error:', err);
    res.status(500).json({ error: 'שגיאה בשליפת לידים נדל"ן' });
  }
});

/** PATCH real estate lead status */
router.patch('/real-estate-leads/:id', verifySuperAdmin, async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { status } = req.body as { status?: string };
    if (!status || !['new', 'in_progress', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'סטטוס לא תקין (new, in_progress, closed)' });
    }
    const updated = await tenantContext.run({ buildingId: '*' }, async () =>
      RealEstateLead.findByIdAndUpdate(id, { $set: { status, ...(status === 'closed' ? { closedAt: new Date() } : {}) } }, { new: true }).lean()
    );
    if (!updated) return res.status(404).json({ error: 'ליד לא נמצא' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'שגיאה בעדכון ליד' });
  }
});

/** Dashboard מעקב – כמה דיירים הורידו אפליקציה (נרשמו) בכל בניין. LAUNCH_STRATEGY §3 */
router.get('/resident-adoption', verifySuperAdmin, async (_req: Request, res: Response) => {
  try {
    const agg = await User.collection
      .aggregate<{ _id: string; count: number }>([
        { $match: { role: { $in: ['tenant', undefined, null] } } },
        { $group: { _id: '$buildingId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ])
      .toArray();

    const buildingIds = agg.map((r) => r._id).filter(Boolean);
    const buildingDocs = await Building.find({ buildingId: { $in: buildingIds } }).lean();
    const byId = Object.fromEntries(
      buildingDocs.map((b) => [
        (b as { buildingId: string }).buildingId,
        (b as { committeeName?: string }).committeeName || (b as { address?: string }).address || (b as { buildingId: string }).buildingId,
      ])
    );

    const items = agg.map((r) => ({
      buildingId: r._id,
      buildingName: byId[r._id] ?? r._id,
      appDownloadedCount: r.count,
    }));

    const total = items.reduce((s, i) => s + i.appDownloadedCount, 0);
    res.json({ items, total });
  } catch (err) {
    res.status(500).json({ error: 'שגיאה בשליפת מעקב הורדות אפליקציה' });
  }
});

export default router;
