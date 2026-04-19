/**
 * Blueprint routes — floor plan management.
 * GET    /api/blueprints          – list (auth)
 * POST   /api/blueprints          – create (admin, URL-based upload)
 * GET    /api/blueprints/:id      – single blueprint metadata
 * PATCH  /api/blueprints/:id      – update name/notes (admin)
 * DELETE /api/blueprints/:id      – delete (admin)
 */
import { Request, Response, Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { tenantContext } from '../middleware/tenantMiddleware.js';
import Blueprint from '../models/blueprintModel.js';

const router = Router();

const ALLOWED_MIMES = ['application/pdf', 'image/png', 'image/jpeg', 'image/svg+xml'] as const;
type AllowedMime = (typeof ALLOWED_MIMES)[number];

function getBuildingId(req: Request): string {
  return (req.headers['x-building-id'] as string)?.trim() || req.auth?.buildingId || 'default';
}

/** List all blueprints for building */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const buildingId = getBuildingId(req);
    const blueprints = await tenantContext.run({ buildingId }, () =>
      Blueprint.find().sort({ floor: 1 }).lean()
    );
    res.json(blueprints);
  } catch {
    res.status(500).json({ error: 'שגיאה בטעינת התוכניות' });
  }
});

/** Get single blueprint */
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const buildingId = getBuildingId(req);
    const bp = await tenantContext.run({ buildingId }, () =>
      Blueprint.findById(req.params.id).lean()
    );
    if (!bp) return res.status(404).json({ error: 'תוכנית לא נמצאה' });
    res.json(bp);
  } catch {
    res.status(500).json({ error: 'שגיאה בטעינת התוכנית' });
  }
});

/** Create blueprint (admin only) */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const auth = req.auth;
    if (!auth || auth.type !== 'admin') return res.status(403).json({ error: 'גישה לאדמינים בלבד' });
    const buildingId = getBuildingId(req);

    const {
      name,
      fileUrl,
      mimeType,
      floor,
      uploadedByName,
      notes,
    } = req.body as {
      name?: string;
      fileUrl?: string;
      mimeType?: string;
      floor?: number;
      uploadedByName?: string;
      notes?: string;
    };

    if (!name?.trim() || !fileUrl?.trim() || floor === undefined || !uploadedByName?.trim()) {
      return res.status(400).json({ error: 'שם, קישור לקובץ, קומה ושם המעלה הם שדות חובה' });
    }

    // Validate URL
    try {
      new URL(fileUrl.trim());
    } catch {
      return res.status(400).json({ error: 'כתובת URL לא תקינה' });
    }

    const resolvedMime: AllowedMime = ALLOWED_MIMES.includes(mimeType as AllowedMime)
      ? (mimeType as AllowedMime)
      : 'application/pdf';

    const floorNum = Number(floor);
    if (!Number.isFinite(floorNum) || floorNum < -10 || floorNum > 100) {
      return res.status(400).json({ error: 'קומה חייבת להיות בין -10 ל-100' });
    }

    const bp = await tenantContext.run({ buildingId }, () =>
      Blueprint.create({
        name: name.trim(),
        fileUrl: fileUrl.trim(),
        mimeType: resolvedMime,
        floor: floorNum,
        uploadedBy: auth.sub,
        uploadedByName: uploadedByName.trim(),
        notes: notes?.trim(),
      })
    );
    res.status(201).json(bp);
  } catch {
    res.status(500).json({ error: 'שגיאה ביצירת התוכנית' });
  }
});

/** Update blueprint metadata */
router.patch('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const auth = req.auth;
    if (!auth || auth.type !== 'admin') return res.status(403).json({ error: 'גישה לאדמינים בלבד' });
    const buildingId = getBuildingId(req);

    const { name, notes, floor } = req.body as { name?: string; notes?: string; floor?: number };
    const update: Record<string, unknown> = {};
    if (name?.trim()) update.name = name.trim();
    if (notes !== undefined) update.notes = notes?.trim();
    if (floor !== undefined) {
      const floorNum = Number(floor);
      if (!Number.isFinite(floorNum) || floorNum < -10 || floorNum > 100) {
        return res.status(400).json({ error: 'קומה חייבת להיות בין -10 ל-100' });
      }
      update.floor = floorNum;
    }

    const bp = await tenantContext.run({ buildingId }, () =>
      Blueprint.findByIdAndUpdate(req.params.id, update, { new: true })
    );
    if (!bp) return res.status(404).json({ error: 'תוכנית לא נמצאה' });
    res.json(bp);
  } catch {
    res.status(500).json({ error: 'שגיאה בעדכון התוכנית' });
  }
});

/** Delete blueprint */
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const auth = req.auth;
    if (!auth || auth.type !== 'admin') return res.status(403).json({ error: 'גישה לאדמינים בלבד' });
    const buildingId = getBuildingId(req);

    const bp = await tenantContext.run({ buildingId }, () =>
      Blueprint.findByIdAndDelete(req.params.id)
    );
    if (!bp) return res.status(404).json({ error: 'תוכנית לא נמצאה' });
    res.json({ message: 'התוכנית נמחקה' });
  } catch {
    res.status(500).json({ error: 'שגיאה במחיקת התוכנית' });
  }
});

export default router;
