/**
 * Transaction list (per building, for CEO/reports). Auth + tenant.
 */
import express, { Request, Response } from 'express';
import Transaction from '../models/transactionModel.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { tenantContext } from '../middleware/tenantMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const buildingId = (req.headers['x-building-id'] as string)?.trim() || 'default';
    const type = req.query.type as string | undefined;
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const list = await tenantContext.run({ buildingId }, async () => {
      const q: Record<string, string> = {};
      if (type === 'income' || type === 'expense') q.type = type;
      return Transaction.find(q).sort({ createdAt: -1 }).limit(limit).lean();
    });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'שגיאה בשליפת תנועות' });
  }
});

export default router;
