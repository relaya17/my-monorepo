/**
 * Ads routes — CPC/CPA marketplace.
 * GET  /api/ads                   – get one active ad for building (optional ?specialty=)
 * GET  /api/ads/all               – list all ads (admin)
 * POST /api/ads                   – create ad (admin)
 * PATCH /api/ads/:id              – update ad (admin)
 * PATCH /api/ads/:id/toggle       – activate / deactivate (admin)
 * POST /api/ads/:id/click         – record CPC click (auth)
 * POST /api/ads/:id/lead          – record CPA lead/action (auth)
 * DELETE /api/ads/:id             – delete (admin)
 */
import { Request, Response, Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { tenantContext } from '../middleware/tenantMiddleware.js';
import Ad from '../models/adModel.js';

const router = Router();

function getBuildingId(req: Request): string {
  return (req.headers['x-building-id'] as string)?.trim() || req.auth?.buildingId || 'default';
}

/** Get one active ad for display (prioritises emergency, then CPC bid) */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const buildingId = getBuildingId(req);
    const specialty = (req.query.specialty as string)?.trim();
    const filter: Record<string, unknown> = { isActive: true };
    if (specialty) filter.specialty = specialty;

    const ads = await tenantContext.run({ buildingId }, () =>
      Ad.find(filter).sort({ isEmergency: -1, cpcBidAgorot: -1 }).limit(1).lean()
    );
    res.json(ads[0] ?? null);
  } catch {
    res.status(500).json({ error: 'שגיאה בטעינת המודעה' });
  }
});

/** List all ads (admin) */
router.get('/all', authMiddleware, async (req: Request, res: Response) => {
  try {
    const auth = req.auth;
    if (!auth || auth.type !== 'admin') return res.status(403).json({ error: 'גישה לאדמינים בלבד' });
    const buildingId = getBuildingId(req);
    const ads = await tenantContext.run({ buildingId }, () =>
      Ad.find().sort({ createdAt: -1 }).lean()
    );
    res.json(ads);
  } catch {
    res.status(500).json({ error: 'שגיאה בטעינת המודעות' });
  }
});

/** Create ad (admin) */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const auth = req.auth;
    if (!auth || auth.type !== 'admin') return res.status(403).json({ error: 'גישה לאדמינים בלבד' });
    const buildingId = getBuildingId(req);

    const {
      title,
      subtitle,
      supplierName,
      supplierPhone,
      specialty,
      discount,
      isEmergency,
      cpcBidAgorot,
      cpaBidAgorot,
      budgetCapAgorot,
    } = req.body as {
      title?: string;
      subtitle?: string;
      supplierName?: string;
      supplierPhone?: string;
      specialty?: string;
      discount?: string;
      isEmergency?: boolean;
      cpcBidAgorot?: number;
      cpaBidAgorot?: number;
      budgetCapAgorot?: number;
    };

    if (!title?.trim() || !supplierName?.trim() || !specialty?.trim()) {
      return res.status(400).json({ error: 'כותרת, שם ספק ותחום הם שדות חובה' });
    }

    const ad = await tenantContext.run({ buildingId }, () =>
      Ad.create({
        title: title.trim(),
        subtitle: subtitle?.trim(),
        supplierName: supplierName.trim(),
        supplierPhone: supplierPhone?.trim(),
        specialty: specialty.trim(),
        discount: discount?.trim(),
        isEmergency: Boolean(isEmergency),
        cpcBidAgorot: Number(cpcBidAgorot) || 50,
        cpaBidAgorot: Number(cpaBidAgorot) || 500,
        budgetCapAgorot: Number(budgetCapAgorot) || 10000,
      })
    );
    res.status(201).json(ad);
  } catch {
    res.status(500).json({ error: 'שגיאה ביצירת המודעה' });
  }
});

/** Update ad */
router.patch('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const auth = req.auth;
    if (!auth || auth.type !== 'admin') return res.status(403).json({ error: 'גישה לאדמינים בלבד' });
    const buildingId = getBuildingId(req);

    const allowed = ['title', 'subtitle', 'supplierName', 'supplierPhone', 'specialty', 'discount', 'isEmergency', 'cpcBidAgorot', 'cpaBidAgorot', 'budgetCapAgorot'];
    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }

    const ad = await tenantContext.run({ buildingId }, () =>
      Ad.findByIdAndUpdate(req.params.id, update, { new: true })
    );
    if (!ad) return res.status(404).json({ error: 'מודעה לא נמצאה' });
    res.json(ad);
  } catch {
    res.status(500).json({ error: 'שגיאה בעדכון המודעה' });
  }
});

/** Toggle active status */
router.patch('/:id/toggle', authMiddleware, async (req: Request, res: Response) => {
  try {
    const auth = req.auth;
    if (!auth || auth.type !== 'admin') return res.status(403).json({ error: 'גישה לאדמינים בלבד' });
    const buildingId = getBuildingId(req);
    const ad = await tenantContext.run({ buildingId }, () => Ad.findById(req.params.id));
    if (!ad) return res.status(404).json({ error: 'מודעה לא נמצאה' });
    ad.isActive = !ad.isActive;
    await ad.save();
    res.json({ isActive: ad.isActive });
  } catch {
    res.status(500).json({ error: 'שגיאה בעדכון המודעה' });
  }
});

/** Record CPC click */
router.post('/:id/click', authMiddleware, async (req: Request, res: Response) => {
  try {
    const buildingId = getBuildingId(req);
    const ad = await tenantContext.run({ buildingId }, () => Ad.findById(req.params.id));
    if (!ad || !ad.isActive) return res.status(404).json({ error: 'מודעה לא פעילה' });
    ad.clicks += 1;
    ad.totalCpcChargeAgorot += ad.cpcBidAgorot;
    await ad.save();
    res.json({ clicks: ad.clicks, chargedAgorot: ad.cpcBidAgorot });
  } catch {
    res.status(500).json({ error: 'שגיאה ברישום הקליק' });
  }
});

/** Record CPA lead */
router.post('/:id/lead', authMiddleware, async (req: Request, res: Response) => {
  try {
    const buildingId = getBuildingId(req);
    const ad = await tenantContext.run({ buildingId }, () => Ad.findById(req.params.id));
    if (!ad || !ad.isActive) return res.status(404).json({ error: 'מודעה לא פעילה' });
    ad.leads += 1;
    ad.totalCpaChargeAgorot += ad.cpaBidAgorot;
    await ad.save();
    res.json({ leads: ad.leads, chargedAgorot: ad.cpaBidAgorot });
  } catch {
    res.status(500).json({ error: 'שגיאה ברישום הליד' });
  }
});

/** Delete ad */
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const auth = req.auth;
    if (!auth || auth.type !== 'admin') return res.status(403).json({ error: 'גישה לאדמינים בלבד' });
    const buildingId = getBuildingId(req);
    const ad = await tenantContext.run({ buildingId }, () => Ad.findByIdAndDelete(req.params.id));
    if (!ad) return res.status(404).json({ error: 'מודעה לא נמצאה' });
    res.json({ message: 'המודעה נמחקה' });
  } catch {
    res.status(500).json({ error: 'שגיאה במחיקת המודעה' });
  }
});

export default router;
