import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

/**
 * Returns list of building IDs that have data in the system.
 * Uses native driver to bypass tenant-scoped model filters.
 */
async function listBuildings(_req: Request, res: Response): Promise<void> {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      res.status(503).json({ error: 'Database not ready' });
      return;
    }

    const fromPayments = await db.collection('payments').distinct('buildingId').catch(() => [] as string[]);
    const fromUsers = await db.collection('users').distinct('buildingId').catch(() => [] as string[]);
    const fromAdmins = await db.collection('admins').distinct('buildingId').catch(() => [] as string[]);

    const set = new Set<string>([
      'default',
      ...(fromPayments as string[]).filter(Boolean),
      ...(fromUsers as string[]).filter(Boolean),
      ...(fromAdmins as string[]).filter(Boolean),
    ]);

    const buildings = Array.from(set).sort((a, b) => a.localeCompare(b, 'he'));
    res.json({ buildings });
  } catch (err) {
    console.error('List buildings error:', err);
    res.status(500).json({ error: 'Failed to list buildings' });
  }
}

const router = Router();
router.get('/', listBuildings);
export default router;
