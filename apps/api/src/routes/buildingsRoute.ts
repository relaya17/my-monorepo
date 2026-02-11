import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import Building, { type IBuilding } from '../models/buildingModel.js';

type BuildingLean = Pick<IBuilding, 'buildingId' | 'address' | 'buildingNumber' | 'committeeName' | 'stripeAccountId' | 'stripeOnboardingComplete'>;

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
      stripeAccountId: byId[id]?.stripeAccountId ?? undefined,
      stripeOnboardingComplete: byId[id]?.stripeOnboardingComplete ?? false,
    }));

    res.json({ buildings });
  } catch (err) {
    console.error('List buildings error:', err);
    res.status(500).json({ error: 'Failed to list buildings' });
  }
}

const router = Router();
router.get('/', listBuildings);
export default router;
