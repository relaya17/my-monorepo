/**
 * Technician flow: work order by magic-link token. No tenant header; tenant from token.
 */
import express, { Request, Response } from 'express';
import Maintenance from '../models/maintenanceModel.js';
import { tenantContext } from '../middleware/tenantMiddleware.js';
import { resolveTechnicianToken, invalidateTechnicianToken } from '../services/technicianAccessService.js';
import { createTransaction } from '../services/transactionService.js';
import { recordMaintenanceClosed } from '../services/buildingStatsService.js';

const router = express.Router();

router.get('/work-order/:token', async (req: Request, res: Response) => {
  const token = req.params.token;
  if (!token) return res.status(400).json({ error: 'Missing token' });
  const payload = await resolveTechnicianToken(token);
  if (!payload) return res.status(404).json({ error: 'Link expired or invalid' });
  const { maintenanceId, buildingId } = payload;
  const doc = await tenantContext.run({ buildingId }, async () =>
    Maintenance.findById(maintenanceId).lean()
  );
  if (!doc) return res.status(404).json({ error: 'Work order not found' });
  res.json(doc);
});

router.patch('/work-order/:token', async (req: Request, res: Response) => {
  const token = req.params.token;
  if (!token) return res.status(400).json({ error: 'Missing token' });
  const payload = await resolveTechnicianToken(token);
  if (!payload) return res.status(404).json({ error: 'Link expired or invalid' });
  const { maintenanceId, buildingId } = payload;
  const body = req.body as Record<string, unknown>;
  const update: Record<string, unknown> = {};
  if (body.status !== undefined) update.status = body.status;
  if (body.technicianNotes !== undefined) update.technicianNotes = body.technicianNotes;
  if (body.beforeImageUrl !== undefined) update.beforeImageUrl = body.beforeImageUrl;
  if (body.afterImageUrl !== undefined) update.afterImageUrl = body.afterImageUrl;
  if (body.locationVerified !== undefined) update.locationVerified = body.locationVerified;
  if (body.actualCost !== undefined) update.actualCost = body.actualCost;
  if (body.partsReplaced !== undefined) update.partsReplaced = body.partsReplaced;
  if (body.locationProof !== undefined) update.locationProof = body.locationProof;
  if (body.status === 'Resolved' || body.status === 'Closed') {
    update.resolvedAt = new Date();
  }
  const updated = await tenantContext.run({ buildingId }, async () =>
    Maintenance.findByIdAndUpdate(maintenanceId, { $set: update }, { new: true }).lean()
  );
  if (!updated) return res.status(404).json({ error: 'Work order not found' });
    if (updated.status === 'Resolved' || updated.status === 'Closed') {
    await invalidateTechnicianToken(token);
    recordMaintenanceClosed(buildingId, (updated as { actualCost?: number }).actualCost).catch(() => {});
    const cost = (updated as { actualCost?: number }).actualCost;
    const category = (updated as { category?: string }).category;
    const title = (updated as { title?: string }).title;
    if (typeof cost === 'number' && cost > 0) {
      await createTransaction(buildingId, {
        type: 'expense',
        amount: cost,
        relatedMaintenanceId: maintenanceId,
        category: category ?? 'Other',
        description: title ?? 'Maintenance',
      }).catch(() => {});
    }
  }
  res.json(updated);
});

export default router;
