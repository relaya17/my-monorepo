/**
 * Resident Invite – bulk invite + onboarding email (LAUNCH_STRATEGY Webhook).
 * POST /api/residents/invite-bulk – שולח מייל welcome לכל דייר חדש.
 */
import { Request, Response, Router } from 'express';
import Building from '../models/buildingModel.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { sendOnboardingEmail } from '../services/emailService.js';
import { logger } from '../utils/logger.js';

const router = Router();

/** POST /invite-bulk – רשימת דיירים לשליחת מייל onboarding */
router.post('/invite-bulk', authMiddleware, async (req: Request, res: Response) => {
  if (!req.auth || req.auth.type !== 'admin') {
    return res.status(403).json({ error: 'Forbidden', hebrew: 'נדרשת הרשאת אדמין' });
  }

  const body = req.body as { residents?: Array<{ name?: string; email?: string; apartment?: string }>; buildingId?: string };
  const residents = Array.isArray(body.residents) ? body.residents : [];
  const buildingId = (req.headers['x-building-id'] as string) || body.buildingId || req.auth.buildingId || 'default';

  if (residents.length === 0) {
    return res.status(400).json({ message: 'Missing residents array', hebrew: 'נא לשלוח רשימת דיירים' });
  }

  const validResidents = residents
    .map((r) => ({
      name: String(r?.name ?? '').trim(),
      email: String(r?.email ?? '').trim().toLowerCase(),
      apartment: String(r?.apartment ?? '').trim(),
    }))
    .filter((r) => r.email && r.email.includes('@'));

  if (validResidents.length === 0) {
    return res.status(400).json({ message: 'No valid emails in residents array', hebrew: 'לא נמצאו כתובות אימייל תקינות' });
  }

  try {
    const buildingDoc = await Building.findOne({ buildingId }).lean();
    const buildingName =
      (buildingDoc && (buildingDoc as { committeeName?: string }).committeeName) ||
      (buildingDoc && (buildingDoc as { address?: string }).address) ||
      buildingId;

    let sent = 0;
    const errors: string[] = [];

    for (const r of validResidents) {
      const ok = await sendOnboardingEmail(r.email, buildingName);
      if (ok) sent++;
      else errors.push(r.email);
    }

    logger.info('[ResidentInvite] Bulk invite', { buildingId, total: validResidents.length, sent, failed: errors.length });
    res.status(200).json({
      success: true,
      message: `${sent} מיילים נשלחו בהצלחה`,
      sent,
      total: validResidents.length,
      failed: errors.length,
      failedEmails: errors.length > 0 ? errors.slice(0, 10) : undefined,
    });
  } catch (err) {
    logger.error('[ResidentInvite] Error', { err });
    res.status(500).json({ message: 'Error sending invites', hebrew: 'שגיאה בשליחת המיילים' });
  }
});

export default router;
