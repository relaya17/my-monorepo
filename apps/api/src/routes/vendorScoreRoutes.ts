/**
 * Vendor Score – ציון צבור לכל קבלן, התראה כש-score < 4.2
 */
import express, { Request, Response } from 'express';
import MaintenanceFeedback from '../models/maintenanceFeedbackModel.js';
import Maintenance from '../models/maintenanceModel.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { tenantContext } from '../middleware/tenantMiddleware.js';
import { logActivityServer } from '../utils/auditLog.js';

const router = express.Router();
const VENDOR_ALERT_THRESHOLD = 4.2;

/** GET /api/vendors/scores – ציוני קבלנים (אדמין/CEO) */
router.get('/scores', authMiddleware, async (req: Request, res: Response) => {
  const auth = (req as Request & { auth?: { type: string; buildingId?: string } }).auth;
  if (!auth || (auth.type !== 'admin' && auth.type !== 'user')) {
    return res.status(403).json({ message: 'גישה מוגבלת' });
  }
  try {
    const buildingId = (req.headers['x-building-id'] as string)?.trim() || (auth as { buildingId?: string }).buildingId || 'default';
    const list = await tenantContext.run({ buildingId }, async () => {
      const agg = await MaintenanceFeedback.aggregate([
        { $match: { buildingId, status: 'submitted', rating: { $exists: true, $gte: 1 } } },
        { $group: { _id: '$contractorName', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
        { $match: { _id: { $exists: true, $nin: [null, ''] } } },
        { $sort: { avgRating: -1 } },
      ]);
      return agg.map((r: { _id: string; avgRating: number; count: number }) => ({
        contractorName: r._id,
        avgRating: Math.round(r.avgRating * 100) / 100,
        count: r.count,
      }));
    });
    res.json(list);
  } catch (err) {
    console.error('Vendor scores error:', err);
    res.status(500).json({ message: 'שגיאה בשרת' });
  }
});

/** GET /api/vendors/alerts – קבלנים מתחת ל-4.2 (למנכ"לית) */
router.get('/alerts', authMiddleware, async (req: Request, res: Response) => {
  const auth = (req as Request & { auth?: { type: string; role?: string; buildingId?: string } }).auth;
  if (!auth || auth.type !== 'admin') {
    return res.status(403).json({ message: 'גישה לאדמינים בלבד' });
  }
  try {
    const buildingId = (req.headers['x-building-id'] as string)?.trim() || (auth as { buildingId?: string }).buildingId || 'default';
    const alerts = await tenantContext.run({ buildingId }, async () => {
      const agg = await MaintenanceFeedback.aggregate([
        { $match: { buildingId, status: 'submitted', rating: { $exists: true }, contractorName: { $exists: true, $nin: [null, ''] } } },
        { $group: { _id: '$contractorName', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
        { $match: { avgRating: { $lt: VENDOR_ALERT_THRESHOLD }, count: { $gte: 1 } } },
      ]);
      return agg.map((r: { _id: string; avgRating: number; count: number }) => ({
        contractorName: r._id,
        avgRating: Math.round(r.avgRating * 100) / 100,
        count: r.count,
        message: `חברת ${r._id} לא עומדת בסטנדרט (${r.avgRating} < ${VENDOR_ALERT_THRESHOLD}). כדאי להחליף.`,
      }));
    });
    res.json({ alerts, threshold: VENDOR_ALERT_THRESHOLD });
  } catch (err) {
    console.error('Vendor alerts error:', err);
    res.status(500).json({ message: 'שגיאה בשרת' });
  }
});

/**
 * POST /api/vendors/purge – חסום קבלן מתחת לסף: מנקה שמו מכל הקריאות הפתוחות.
 * גישה: admin בלבד.
 */
router.post('/purge', authMiddleware, async (req: Request, res: Response) => {
  const auth = req.auth;
  if (!auth || auth.type !== 'admin') {
    return res.status(403).json({ message: 'גישה לאדמינים בלבד' });
  }
  try {
    const buildingId = (req.headers['x-building-id'] as string)?.trim() || auth.buildingId || 'default';
    const { contractorName } = req.body as { contractorName?: string };
    if (!contractorName?.trim()) return res.status(400).json({ error: 'contractorName חובה' });

    // וודא שהקבלן אכן מתחת לסף לפני חסימה
    const agg = await tenantContext.run({ buildingId }, async () =>
      MaintenanceFeedback.aggregate([
        { $match: { buildingId, status: 'submitted', rating: { $exists: true, $gte: 1 }, contractorName } },
        { $group: { _id: '$contractorName', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
      ])
    ) as { _id: string; avgRating: number; count: number }[];

    const score = agg[0];
    if (!score) return res.status(404).json({ error: 'קבלן לא נמצא' });
    if (score.avgRating >= VENDOR_ALERT_THRESHOLD) {
      return res.status(400).json({ error: `הקבלן מעל הסף (${score.avgRating} >= ${VENDOR_ALERT_THRESHOLD}), לא ניתן לחסום` });
    }

    // הסר את הקבלן מכל קריאות השירות הפתוחות בבניין
    const result = await tenantContext.run({ buildingId }, async () =>
      Maintenance.updateMany(
        { buildingId, status: { $in: ['Open', 'In Progress'] }, 'assignedContractor.name': contractorName },
        { $unset: { assignedContractor: '' }, $set: { status: 'Open' } }
      )
    );

    await logActivityServer('VENDOR_AUTO_PURGE', 'MAINTENANCE', {
      buildingId,
      contractorName,
      avgRating: score.avgRating,
      affectedTickets: result.modifiedCount,
    });

    res.json({
      message: `הקבלן ${contractorName} הוסר מ-${result.modifiedCount} קריאות פתוחות`,
      avgRating: score.avgRating,
      affectedTickets: result.modifiedCount,
    });
  } catch (err) {
    console.error('Vendor purge error:', err);
    res.status(500).json({ message: 'שגיאה בחסימת הקבלן' });
  }
});

export default router;
