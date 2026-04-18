/**
 * Webhooks Gateway – רישום וניהול מנויים (TECHNICAL_NEXT_TASKS).
 * POST /api/webhooks/subscribe, GET /api/super-admin/webhooks (רישום דרך super-admin).
 */
import express, { Request, Response } from 'express';
import crypto from 'crypto';
import WebhookSubscription from '../models/webhookSubscriptionModel.js';
import { verifySuperAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

/** רישום webhook – super-admin בלבד */
router.post('/subscribe', verifySuperAdmin, async (req: Request, res: Response) => {
  try {
    const { url, apiKey, buildingIds, events } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'חסר url' });
    }
    const hash = apiKey ? crypto.createHash('sha256').update(apiKey).digest('hex') : '';
    const bIds = Array.isArray(buildingIds) ? buildingIds : [];
    const evts = Array.isArray(events)
      ? events.filter((e: string) => ['building_pulse', 'anomaly_alert', 'maintenance_status', 'ledger_milestone'].includes(e))
      : [];
    const doc = await WebhookSubscription.create({
      url: url.trim(),
      apiKeyHash: hash,
      buildingIds: bIds,
      events: evts.length ? evts : ['building_pulse', 'anomaly_alert'],
      active: true,
    });
    res.status(201).json({ id: doc._id, url: doc.url, events: doc.events });
  } catch (err) {
    res.status(500).json({ error: 'שגיאה ברישום webhook' });
  }
});

/** רשימת מנויים – super-admin */
router.get('/list', verifySuperAdmin, async (_req: Request, res: Response) => {
  try {
    const list = await WebhookSubscription.find({})
      .select('url buildingIds events active lastDeliveryAt failureCount createdAt')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ items: list });
  } catch (err) {
    res.status(500).json({ error: 'שגיאה בשליפת מנויים' });
  }
});

export default router;
