/**
 * /api/user/* – סטטוס דייר, מחיקת חשבון (GDPR Right to be Forgotten)
 */
import express, { Request, Response } from 'express';
import User from '../models/userModel.js';
import Building from '../models/buildingModel.js';
import Payment from '../models/paymentModel.js';
import Maintenance from '../models/maintenanceModel.js';
import MaintenanceFeedback from '../models/maintenanceFeedbackModel.js';
import VisionLog from '../models/visionLogModel.js';
import BuildingStats from '../models/buildingStatsModel.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { tenantContext } from '../middleware/tenantMiddleware.js';
import { anonymizeUserAndDeleteSessions } from '../services/gdprDeletionService.js';

const router = express.Router();

/** First name from full name (Hebrew or space-separated) */
function getFirstName(fullName: string): string {
  const trimmed = (fullName || '').trim();
  if (!trimmed) return '';
  const parts = trimmed.split(/\s+/);
  return parts[0] || trimmed;
}

router.get('/status', authMiddleware, async (req: Request, res: Response) => {
  const auth = (req as Request & { auth?: { sub: string; type: string; buildingId?: string; email?: string } }).auth;
  if (!auth || auth.type !== 'user') {
    return res.status(403).json({ message: 'גישה לדיירים בלבד' });
  }
  try {
    const buildingId = (req.headers['x-building-id'] as string)?.trim() || (auth as { buildingId?: string }).buildingId || 'default';
    const result = await tenantContext.run({ buildingId }, async () => {
      const user = await User.findById(auth.sub).select('name email apartmentNumber buildingId').lean();
      if (!user) return null;
      const u = user as { name?: string; email?: string; apartmentNumber?: string; buildingId?: string };
      const building = await Building.findOne({ buildingId: buildingId }).lean();
      const b = building as { address?: string; committeeName?: string } | null;
      const buildingName = b?.committeeName || b?.address || buildingId;
      const lastPayment = await Payment.findOne({ userId: auth.sub, status: 'paid' })
        .sort({ createdAt: -1 })
        .lean();
      const p = lastPayment as { amount?: number; createdAt?: Date } | undefined;
      const openTickets = await Maintenance.find({ reporterId: auth.sub, isDeleted: { $ne: true }, status: { $in: ['Open', 'In_Progress'] } })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title category status priority createdAt')
        .lean();
      const pendingFeedbacksRaw = await MaintenanceFeedback.find({ residentId: auth.sub, status: 'pending' })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();
      const maintenanceIds = (pendingFeedbacksRaw as { maintenanceId?: unknown }[])
        .map((f) => f.maintenanceId)
        .filter(Boolean);
      const maintenances = maintenanceIds.length
        ? await Maintenance.find({ _id: { $in: maintenanceIds } }).select('title').lean()
        : [];
      const maintMap = new Map(
        (maintenances as { _id?: unknown; title?: string }[]).map((m) => [String(m._id), m.title ?? 'תקלה'])
      );
      const pendingFeedbacks = (pendingFeedbacksRaw as { _id?: unknown; maintenanceId?: unknown }[]).map((f) => ({
        id: String((f._id as { toString?: () => string })?.toString?.() ?? ''),
        maintenanceId: String((f.maintenanceId as { toString?: () => string })?.toString?.() ?? ''),
        title: maintMap.get(String(f.maintenanceId)) ?? 'תקלה',
      }));

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const [openCount, urgentOpen, visionAlerts, stats] = await Promise.all([
        Maintenance.countDocuments({ reporterId: auth.sub, isDeleted: { $ne: true }, status: { $in: ['Open', 'In_Progress'] } }),
        Maintenance.findOne({ isDeleted: { $ne: true }, status: { $in: ['Open', 'In_Progress'] }, priority: 'Urgent', category: { $in: ['Plumbing', 'Electrical'] } }).select('_id').lean(),
        VisionLog.find({ resolved: false, timestamp: { $gte: sevenDaysAgo } }).sort({ timestamp: -1 }).limit(5).select('eventType cameraId timestamp').lean(),
        BuildingStats.findOne({ buildingId }).select('moneySavedByAI').lean(),
      ]);
      const recentVisionAlerts = (visionAlerts as { eventType?: string; cameraId?: string; timestamp?: Date }[]).map((v) => ({
        eventType: v.eventType,
        cameraId: v.cameraId,
        timestamp: v.timestamp,
      }));

      return {
        firstName: getFirstName(u.name ?? ''),
        name: u.name ?? '',
        email: u.email ?? '',
        apartmentNumber: u.apartmentNumber ?? '',
        buildingId,
        buildingName,
        buildingAddress: b?.address ?? '',
        paymentStatus: p ? 'paid' : 'unknown',
        lastPaymentAmount: p?.amount,
        lastPaymentDate: p?.createdAt,
        openTicketsCount: openCount,
        openTickets: openTickets.map((t: { _id?: unknown; title?: string; category?: string; status?: string; priority?: string; createdAt?: Date }) => ({
          id: String((t as { _id?: { toString?: () => string } })._id?.toString?.() ?? ''),
          title: t.title,
          category: t.category,
          status: t.status,
          priority: t.priority,
          createdAt: t.createdAt,
        })),
        pendingFeedbacks,
        emergencyDetected: !!urgentOpen,
        recentVisionAlerts,
        moneySaved: (stats as { moneySavedByAI?: number } | null)?.moneySavedByAI ?? 0,
      };
    });
    if (!result) return res.status(404).json({ message: 'משתמש לא נמצא' });
    res.json(result);
  } catch (err) {
    console.error('User status error:', err);
    res.status(500).json({ message: 'שגיאה בשרת' });
  }
});

/** DELETE /api/user/account – GDPR Right to be Forgotten (COMPLIANCE_CHECKLIST) */
router.delete('/account', authMiddleware, async (req: Request, res: Response) => {
  const auth = (req as Request & { auth?: { sub: string; type: string; buildingId?: string } }).auth;
  if (!auth || auth.type !== 'user') {
    return res.status(403).json({ message: 'גישה לדיירים בלבד' });
  }
  try {
    const buildingId = (req.headers['x-building-id'] as string)?.trim() || auth.buildingId || 'default';
    const result = await anonymizeUserAndDeleteSessions(auth.sub, buildingId);
    if (!result.success) {
      return res.status(404).json({ message: result.message });
    }
    res.status(200).json({ message: 'חשבונך הוסר. הנתונים האישיים עברו אנונימיזציה.' });
  } catch (err) {
    console.error('GDPR deletion error:', err);
    res.status(500).json({ message: 'שגיאה במחיקת החשבון' });
  }
});

export default router;
