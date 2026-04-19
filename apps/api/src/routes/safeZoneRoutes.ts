/**
 * Safe-Zone routes — virtual camera escort sessions.
 * POST /api/safe-zone/request  – resident requests escort (auth)
 * GET  /api/safe-zone/active   – get current active session for resident
 * GET  /api/safe-zone          – admin: list all sessions
 * PATCH /api/safe-zone/:id/activate  – system/admin activates cameras
 * PATCH /api/safe-zone/:id/complete  – mark arrival at apartment (success)
 * PATCH /api/safe-zone/:id/fail      – mark failed/aborted
 */
import { Request, Response, Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { tenantContext } from '../middleware/tenantMiddleware.js';
import SafeZoneSession from '../models/safeZoneSessionModel.js';

const router = Router();

function getBuildingId(req: Request): string {
  return (req.headers['x-building-id'] as string)?.trim() || req.auth?.buildingId || 'default';
}

/** Request escort */
router.post('/request', authMiddleware, async (req: Request, res: Response) => {
  try {
    const buildingId = getBuildingId(req);
    const { residentName, apartmentNumber, note } = req.body as {
      residentName?: string;
      apartmentNumber?: string;
      note?: string;
    };
    if (!residentName?.trim() || !apartmentNumber?.trim()) {
      return res.status(400).json({ error: 'שם דייר ומספר דירה הם שדות חובה' });
    }

    // Cancel any existing active sessions for this resident
    await tenantContext.run({ buildingId }, () =>
      SafeZoneSession.updateMany(
        { residentId: req.auth!.sub, status: { $in: ['requested', 'active'] } },
        { status: 'failed' }
      )
    );

    const session = await tenantContext.run({ buildingId }, () =>
      SafeZoneSession.create({
        residentId: req.auth!.sub,
        residentName: residentName.trim(),
        apartmentNumber: apartmentNumber.trim(),
        note: note?.trim(),
        status: 'requested',
        requestedAt: new Date(),
      })
    );

    res.status(201).json(session);
  } catch {
    res.status(500).json({ error: 'שגיאה בבקשת הליווי' });
  }
});

/** Get current active session for authenticated resident */
router.get('/active', authMiddleware, async (req: Request, res: Response) => {
  try {
    const buildingId = getBuildingId(req);
    const session = await tenantContext.run({ buildingId }, () =>
      SafeZoneSession.findOne({
        residentId: req.auth!.sub,
        status: { $in: ['requested', 'active'] },
      }).sort({ createdAt: -1 })
    );
    res.json(session ?? null);
  } catch {
    res.status(500).json({ error: 'שגיאה בטעינת הסשן' });
  }
});

/** List sessions (admin) */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const auth = req.auth;
    if (!auth || auth.type !== 'admin') return res.status(403).json({ error: 'גישה לאדמינים בלבד' });
    const buildingId = getBuildingId(req);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 50);
    const sessions = await tenantContext.run({ buildingId }, () =>
      SafeZoneSession.find().sort({ createdAt: -1 }).limit(limit).lean()
    );
    res.json(sessions);
  } catch {
    res.status(500).json({ error: 'שגיאה בטעינת הסשנים' });
  }
});

/** Activate escort (cameras online) */
router.patch('/:id/activate', authMiddleware, async (req: Request, res: Response) => {
  try {
    const buildingId = getBuildingId(req);
    const session = await tenantContext.run({ buildingId }, () =>
      SafeZoneSession.findById(req.params.id)
    );
    if (!session) return res.status(404).json({ error: 'סשן לא נמצא' });
    if (session.status !== 'requested') return res.status(400).json({ error: 'הסשן כבר פעיל או הסתיים' });
    session.status = 'active';
    session.activatedAt = new Date();
    await session.save();
    res.json(session);
  } catch {
    res.status(500).json({ error: 'שגיאה בהפעלת הסשן' });
  }
});

/** Mark arrival — escort completed */
router.patch('/:id/complete', authMiddleware, async (req: Request, res: Response) => {
  try {
    const buildingId = getBuildingId(req);
    const session = await tenantContext.run({ buildingId }, () =>
      SafeZoneSession.findById(req.params.id)
    );
    if (!session) return res.status(404).json({ error: 'סשן לא נמצא' });
    session.status = 'completed';
    session.completedAt = new Date();
    await session.save();
    res.json(session);
  } catch {
    res.status(500).json({ error: 'שגיאה בסיום הסשן' });
  }
});

/** Mark failed / abort */
router.patch('/:id/fail', authMiddleware, async (req: Request, res: Response) => {
  try {
    const buildingId = getBuildingId(req);
    const session = await tenantContext.run({ buildingId }, () =>
      SafeZoneSession.findById(req.params.id)
    );
    if (!session) return res.status(404).json({ error: 'סשן לא נמצא' });
    session.status = 'failed';
    await session.save();
    res.json(session);
  } catch {
    res.status(500).json({ error: 'שגיאה בביטול הסשן' });
  }
});

export default router;
