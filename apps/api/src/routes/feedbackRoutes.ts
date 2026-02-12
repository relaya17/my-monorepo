/**
 * POST /api/feedback – שליחת דירוג אחרי תיקון (V-One Quality Control)
 */
import express, { Request, Response } from 'express';
import MaintenanceFeedback from '../models/maintenanceFeedbackModel.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { tenantContext } from '../middleware/tenantMiddleware.js';
import { analyzeSentiment } from '../utils/sentimentAnalysis.js';

const router = express.Router();

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  const auth = (req as Request & { auth?: { sub: string; type: string; buildingId?: string } }).auth;
  if (!auth || auth.type !== 'user') {
    return res.status(403).json({ message: 'גישה לדיירים בלבד' });
  }
  const body = req.body as { feedbackId?: string; maintenanceId?: string; rating?: number; feedbackText?: string };
  const feedbackId = body.feedbackId;
  const maintenanceId = body.maintenanceId;
  const rating = typeof body.rating === 'number' ? body.rating : undefined;
  const feedbackText = typeof body.feedbackText === 'string' ? body.feedbackText.trim() : undefined;

  if ((!feedbackId && !maintenanceId) || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'נא לשלוח feedbackId או maintenanceId ורייטנג (1-5)' });
  }

  try {
    const buildingId = (req.headers['x-building-id'] as string)?.trim() || (auth as { buildingId?: string }).buildingId || 'default';
    const result = await tenantContext.run({ buildingId }, async () => {
      const q: Record<string, unknown> = { residentId: auth!.sub, status: 'pending' };
      if (feedbackId) q._id = feedbackId;
      else if (maintenanceId) q.maintenanceId = maintenanceId;
      const doc = await MaintenanceFeedback.findOne(q);
      if (!doc) return null;
      doc.rating = rating;
      doc.feedbackText = feedbackText;
      const sentimentScore = feedbackText ? analyzeSentiment(feedbackText) : undefined;
      if (sentimentScore !== undefined) doc.sentimentScore = Math.round(sentimentScore * 100) / 100;
      doc.status = 'submitted';
      await doc.save();
      return doc;
    });
    if (!result) return res.status(404).json({ message: 'בקשת דירוג לא נמצאה או כבר נענתה' });
    res.json({ message: 'תודה! הדירוג שלך עוזר לנו לשמור על הבניין חכם ואיכותי.', rating });
  } catch (err) {
    console.error('Feedback submit error:', err);
    res.status(500).json({ message: 'שגיאה בשרת' });
  }
});

export default router;
