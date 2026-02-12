/**
 * Vendor Score – ציון צבור לכל קבלן, התראה כש-score < 4.2
 */
import express, { Request, Response } from 'express';
import MaintenanceFeedback from '../models/maintenanceFeedbackModel.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { tenantContext } from '../middleware/tenantMiddleware.js';

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

export default router;
