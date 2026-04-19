import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import Building, { type IBuilding } from '../models/buildingModel.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

type BuildingLean = Pick<IBuilding, 'buildingId' | 'address' | 'buildingNumber' | 'committeeName' | 'stripeAccountId' | 'stripeOnboardingComplete' | 'country' | 'currency' | 'timezone' | 'units' | 'branding'>;

async function listBuildings(_req: Request, res: Response): Promise<void> {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      res.status(503).json({ error: 'Database not ready' });
      return;
    }

    const fromBuildings = await Building.distinct('buildingId').catch(() => [] as string[]);
    const fromPayments = await db.collection('payments').distinct('buildingId').catch(() => [] as string[]);
    const fromUsers = await db.collection('users').distinct('buildingId').catch(() => [] as string[]);
    const fromAdmins = await db.collection('admins').distinct('buildingId').catch(() => [] as string[]);

    const ids = new Set<string>([
      'default',
      ...(fromBuildings as string[]).filter(Boolean),
      ...(fromPayments as string[]).filter(Boolean),
      ...(fromUsers as string[]).filter(Boolean),
      ...(fromAdmins as string[]).filter(Boolean),
    ]);

    const buildingDocs = await Building.find({ buildingId: { $in: Array.from(ids) } }).lean();
    const byId = Object.fromEntries(
      buildingDocs.map((b) => [b.buildingId, b as BuildingLean])
    ) as Record<string, BuildingLean | undefined>;

    const buildings = Array.from(ids).sort((a, b) => a.localeCompare(b, 'he')).map((id) => ({
      buildingId: id,
      address: byId[id]?.address ?? id,
      buildingNumber: byId[id]?.buildingNumber ?? '',
      committeeName: byId[id]?.committeeName ?? '',
      stripeOnboardingComplete: byId[id]?.stripeOnboardingComplete ?? false,
      country: byId[id]?.country,
      currency: byId[id]?.currency,
      timezone: byId[id]?.timezone,
      units: byId[id]?.units,
      branding: byId[id]?.branding ?? undefined,
    }));

    res.json({ buildings });
  } catch (err) {
    console.error('List buildings error:', err);
    res.status(500).json({ error: 'Failed to list buildings' });
  }
}

/** GET /api/buildings/branding?buildingId=xxx – White-Label Theme Engine. Returns logo, colors for current tenant. */
async function getBranding(req: Request, res: Response): Promise<void> {
  try {
    const buildingId = String(req.query.buildingId ?? 'default').trim() || 'default';
    const doc = await Building.findOne({ buildingId }).select('branding').lean();
    const branding = doc?.branding ?? undefined;
    res.json({ buildingId, branding });
  } catch (err) {
    console.error('Branding error:', err);
    res.status(500).json({ error: 'Failed to fetch branding' });
  }
}

/** PATCH /api/buildings/branding – White-Label Theme Engine. Update logo, colors, custom domain. Admin only. */
async function patchBranding(req: Request, res: Response): Promise<void> {
  try {
    const auth = req.auth;
    if (!auth || auth.type !== 'admin') {
      res.status(403).json({ error: 'גישה לאדמינים בלבד' });
      return;
    }
    const buildingId = String(req.body?.buildingId ?? req.query.buildingId ?? 'default').trim() || 'default';
    const { logoUrl, primaryColor, secondaryColor, customDomain } = req.body as {
      buildingId?: string;
      logoUrl?: string;
      primaryColor?: string;
      secondaryColor?: string;
      customDomain?: string;
    };

    // Validate hex colors if provided
    const hexPattern = /^#[0-9a-fA-F]{3,8}$/;
    if (primaryColor && !hexPattern.test(primaryColor)) {
      res.status(400).json({ error: 'primaryColor חייב להיות hex color (e.g. #00d4aa)' });
      return;
    }
    if (secondaryColor && !hexPattern.test(secondaryColor)) {
      res.status(400).json({ error: 'secondaryColor חייב להיות hex color' });
      return;
    }

    const update: Record<string, unknown> = {};
    if (logoUrl !== undefined) update['branding.logoUrl'] = logoUrl;
    if (primaryColor !== undefined) update['branding.primaryColor'] = primaryColor;
    if (secondaryColor !== undefined) update['branding.secondaryColor'] = secondaryColor;
    if (customDomain !== undefined) update['branding.customDomain'] = customDomain;

    const doc = await Building.findOneAndUpdate(
      { buildingId },
      { $set: update },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    res.json({ buildingId, branding: doc?.branding ?? {} });
  } catch (err) {
    console.error('Branding patch error:', err);
    res.status(500).json({ error: 'שגיאה בעדכון המיתוג' });
  }
}

const router = Router();
router.get('/', listBuildings);
router.get('/branding', getBranding);
router.patch('/branding', authMiddleware, patchBranding);
export default router;
