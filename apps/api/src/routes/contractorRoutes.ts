/**
 * Contractor routes — CRUD + Online/Offline Toggle + GPS update.
 * GET  /api/contractors          – list (filter: specialty, isOnline)
 * GET  /api/contractors/me       – get own profile (contractor)
 * POST /api/contractors          – create (admin)
 * PATCH /api/contractors/:id/status – toggle online/offline (contractor self or admin)
 * PATCH /api/contractors/:id/location – update GPS (contractor)
 * PATCH /api/contractors/:id/block    – block contractor (admin)
 * DELETE /api/contractors/:id    – delete (admin)
 */
import { Request, Response, Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { tenantContext } from '../middleware/tenantMiddleware.js';
import Contractor from '../models/contractorModel.js';

const router = Router();

function getBuildingId(req: Request): string {
  return (req.headers['x-building-id'] as string)?.trim() || req.auth?.buildingId || 'default';
}

/** Get own contractor profile (contractor self) */
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const auth = req.auth;
    if (!auth) return res.status(401).json({ error: 'לא מורשה' });
    const buildingId = getBuildingId(req);
    // Match by sub (userId from JWT) stored as externalId on contractor doc
    const contractor = await tenantContext.run({ buildingId }, () =>
      Contractor.findOne({ externalId: auth.sub }).lean()
    );
    if (!contractor) return res.status(404).json({ error: 'פרופיל קבלן לא נמצא' });
    res.json({ contractor });
  } catch {
    res.status(500).json({ error: 'שגיאה בטעינת הפרופיל' });
  }
});

/** List contractors */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const buildingId = getBuildingId(req);
    const filter: Record<string, unknown> = {};
    if (req.query.specialty) filter.specialty = req.query.specialty;
    if (req.query.isOnline !== undefined) filter.isOnline = req.query.isOnline === 'true';
    if (req.query.isBlocked !== undefined) filter.isBlocked = req.query.isBlocked === 'true';

    const contractors = await tenantContext.run({ buildingId }, () =>
      Contractor.find(filter).sort({ isOnline: -1, name: 1 }).lean()
    );
    res.json(contractors);
  } catch {
    res.status(500).json({ error: 'שגיאה בטעינת הקבלנים' });
  }
});

/** Create contractor (admin only) */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const auth = req.auth;
    if (!auth || auth.type !== 'admin') return res.status(403).json({ error: 'גישה לאדמינים בלבד' });

    const buildingId = getBuildingId(req);
    const { name, phone, email, specialty } = req.body as {
      name?: string; phone?: string; email?: string; specialty?: string;
    };
    if (!name?.trim() || !phone?.trim() || !specialty?.trim()) {
      return res.status(400).json({ error: 'name, phone ו-specialty הם שדות חובה' });
    }

    const contractor = await tenantContext.run({ buildingId }, () =>
      Contractor.create({ name: name.trim(), phone: phone.trim(), email, specialty: specialty.trim() })
    );
    res.status(201).json(contractor);
  } catch {
    res.status(500).json({ error: 'שגיאה ביצירת הקבלן' });
  }
});

/** Toggle online/offline */
router.patch('/:id/status', authMiddleware, async (req: Request, res: Response) => {
  try {
    const buildingId = getBuildingId(req);
    const { isOnline } = req.body as { isOnline?: boolean };
    if (typeof isOnline !== 'boolean') return res.status(400).json({ error: 'isOnline חייב להיות boolean' });

    const contractor = await tenantContext.run({ buildingId }, () =>
      Contractor.findByIdAndUpdate(
        req.params.id,
        { isOnline, lastSeenAt: new Date() },
        { new: true }
      )
    );
    if (!contractor) return res.status(404).json({ error: 'קבלן לא נמצא' });
    res.json({ contractor });
  } catch {
    res.status(500).json({ error: 'שגיאה בעדכון הסטטוס' });
  }
});

/** Update GPS location */
router.patch('/:id/location', authMiddleware, async (req: Request, res: Response) => {
  try {
    const buildingId = getBuildingId(req);
    const { lat, lng } = req.body as { lat?: number; lng?: number };
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ error: 'lat ו-lng חובה' });
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ error: 'קואורדינטות לא תקינות' });
    }

    const contractor = await tenantContext.run({ buildingId }, () =>
      Contractor.findByIdAndUpdate(req.params.id, { lastLat: lat, lastLng: lng, lastSeenAt: new Date() }, { new: true })
    );
    if (!contractor) return res.status(404).json({ error: 'קבלן לא נמצא' });
    res.json({ contractor });
  } catch {
    res.status(500).json({ error: 'שגיאה בעדכון המיקום' });
  }
});

/** Block/unblock contractor (admin only) */
router.patch('/:id/block', authMiddleware, async (req: Request, res: Response) => {
  try {
    const auth = req.auth;
    if (!auth || auth.type !== 'admin') return res.status(403).json({ error: 'גישה לאדמינים בלבד' });

    const buildingId = getBuildingId(req);
    const { isBlocked, reason } = req.body as { isBlocked?: boolean; reason?: string };
    if (typeof isBlocked !== 'boolean') return res.status(400).json({ error: 'isBlocked חובה' });

    const contractor = await tenantContext.run({ buildingId }, () =>
      Contractor.findByIdAndUpdate(
        req.params.id,
        { isBlocked, blockedReason: isBlocked ? (reason ?? 'חסימה ידנית') : undefined, isOnline: isBlocked ? false : undefined },
        { new: true }
      )
    );
    if (!contractor) return res.status(404).json({ error: 'קבלן לא נמצא' });
    res.json(contractor);
  } catch {
    res.status(500).json({ error: 'שגיאה בחסימת הקבלן' });
  }
});

/** Delete contractor (admin only) */
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const auth = req.auth;
    if (!auth || auth.type !== 'admin') return res.status(403).json({ error: 'גישה לאדמינים בלבד' });

    const buildingId = getBuildingId(req);
    const result = await tenantContext.run({ buildingId }, () =>
      Contractor.findByIdAndDelete(req.params.id)
    );
    if (!result) return res.status(404).json({ error: 'קבלן לא נמצא' });
    res.json({ message: 'הקבלן נמחק' });
  } catch {
    res.status(500).json({ error: 'שגיאה במחיקת הקבלן' });
  }
});

export default router;
