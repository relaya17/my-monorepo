/**
 * Digital Key routes — one-time time-limited access tokens for contractors.
 * POST /api/digital-key/generate   – resident generates token (auth)
 * GET  /api/digital-key/mine       – list my active keys
 * POST /api/digital-key/verify     – contractor verifies + consumes token (auth)
 * DELETE /api/digital-key/:id/revoke – resident revokes key
 */
import { Request, Response, Router } from 'express';
import crypto from 'crypto';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { tenantContext } from '../middleware/tenantMiddleware.js';
import DigitalKey from '../models/digitalKeyModel.js';

const router = Router();

const DEFAULT_TTL_HOURS = 4;

function getBuildingId(req: Request): string {
  return (req.headers['x-building-id'] as string)?.trim() || req.auth?.buildingId || 'default';
}

function generateToken(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase(); // e.g. "A3F2C1B4"
}

/** Generate access key */
router.post('/generate', authMiddleware, async (req: Request, res: Response) => {
  try {
    const buildingId = getBuildingId(req);
    const { residentName, apartmentNumber, purpose, ttlHours } = req.body as {
      residentName?: string;
      apartmentNumber?: string;
      purpose?: string;
      ttlHours?: number;
    };
    if (!residentName?.trim() || !apartmentNumber?.trim() || !purpose?.trim()) {
      return res.status(400).json({ error: 'שם, מספר דירה ומטרת הגישה הם שדות חובה' });
    }

    const ttl = Math.min(Number.isFinite(ttlHours) && ttlHours! > 0 ? ttlHours! : DEFAULT_TTL_HOURS, 48);
    const expiresAt = new Date(Date.now() + ttl * 60 * 60 * 1000);

    // Try up to 5 times to avoid token collision (extremely unlikely)
    let key = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      const token = generateToken();
      try {
        key = await tenantContext.run({ buildingId }, () =>
          DigitalKey.create({
            residentId: req.auth!.sub,
            residentName: residentName.trim(),
            apartmentNumber: apartmentNumber.trim(),
            purpose: purpose.trim(),
            token,
            expiresAt,
          })
        );
        break;
      } catch (e: unknown) {
        const mongoErr = e as { code?: number };
        if (mongoErr.code !== 11000) throw e; // not a duplicate key error
      }
    }
    if (!key) return res.status(500).json({ error: 'שגיאה ביצירת הטוקן' });

    res.status(201).json({
      _id: key._id,
      token: key.token,
      expiresAt: key.expiresAt,
      purpose: key.purpose,
      apartmentNumber: key.apartmentNumber,
      ttlHours: ttl,
    });
  } catch {
    res.status(500).json({ error: 'שגיאה ביצירת המפתח הדיגיטלי' });
  }
});

/** List my active keys */
router.get('/mine', authMiddleware, async (req: Request, res: Response) => {
  try {
    const buildingId = getBuildingId(req);
    const now = new Date();
    const keys = await tenantContext.run({ buildingId }, () =>
      DigitalKey.find({
        residentId: req.auth!.sub,
        isRevoked: false,
        expiresAt: { $gt: now },
        usedAt: { $exists: false },
      }).sort({ createdAt: -1 }).lean()
    );
    res.json(keys);
  } catch {
    res.status(500).json({ error: 'שגיאה בטעינת המפתחות' });
  }
});

/** Verify + consume a token (contractor uses this) */
router.post('/verify', authMiddleware, async (req: Request, res: Response) => {
  try {
    const buildingId = getBuildingId(req);
    const { token, usedBy } = req.body as { token?: string; usedBy?: string };
    if (!token?.trim()) return res.status(400).json({ error: 'token חובה' });

    const key = await tenantContext.run({ buildingId }, () =>
      DigitalKey.findOne({ token: token.trim().toUpperCase(), buildingId })
    );

    if (!key) return res.status(404).json({ valid: false, error: 'מפתח לא נמצא' });
    if (key.isRevoked) return res.status(400).json({ valid: false, error: 'המפתח בוטל' });
    if (key.usedAt) return res.status(400).json({ valid: false, error: 'המפתח כבר שומש' });
    if (key.expiresAt < new Date()) return res.status(400).json({ valid: false, error: 'המפתח פג תוקף' });

    key.usedAt = new Date();
    key.usedBy = (usedBy ?? req.auth?.sub ?? 'unknown').trim();
    await key.save();

    res.json({
      valid: true,
      apartmentNumber: key.apartmentNumber,
      residentName: key.residentName,
      purpose: key.purpose,
      usedAt: key.usedAt,
    });
  } catch {
    res.status(500).json({ error: 'שגיאה באימות המפתח' });
  }
});

/** Revoke a key */
router.delete('/:id/revoke', authMiddleware, async (req: Request, res: Response) => {
  try {
    const buildingId = getBuildingId(req);
    const key = await tenantContext.run({ buildingId }, () =>
      DigitalKey.findById(req.params.id)
    );
    if (!key) return res.status(404).json({ error: 'מפתח לא נמצא' });
    if (key.residentId !== req.auth!.sub && req.auth!.type !== 'admin') {
      return res.status(403).json({ error: 'אין הרשאה לבטל מפתח זה' });
    }
    key.isRevoked = true;
    await key.save();
    res.json({ message: 'המפתח בוטל' });
  } catch {
    res.status(500).json({ error: 'שגיאה בביטול המפתח' });
  }
});

export default router;
