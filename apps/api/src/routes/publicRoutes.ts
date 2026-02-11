/**
 * Public API for landing page – global impact metrics + Demo/Lead capture. No auth, no tenant.
 */
import { Request, Response, Router } from 'express';
import BuildingStats from '../models/buildingStatsModel.js';
import Lead from '../models/leadModel.js';
import { logger } from '../utils/logger.js';

const router = Router();

async function getGlobalImpact(_req: Request, res: Response) {
  try {
    const [agg] = await BuildingStats.aggregate([
      {
        $group: {
          _id: null,
          totalMoneySaved: { $sum: '$moneySavedByAI' },
          totalPreventedFailures: { $sum: '$preventedFailuresCount' },
          averageHappiness: { $avg: '$residentHappinessScore' },
        },
      },
    ]);
    const totalMoneySaved = agg?.totalMoneySaved ?? 0;
    const totalPreventedFailures = agg?.totalPreventedFailures ?? 0;
    const averageHappiness = agg?.averageHappiness != null ? Math.round(Number(agg.averageHappiness)) : 0;
    res.json({
      totalMoneySaved,
      totalPreventedFailures,
      averageHappiness,
      transparencyScore: 'AAA' as const,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching global impact' });
  }
}

router.get('/impact-metrics', getGlobalImpact);
router.get('/global-impact', getGlobalImpact);
router.get('/stats', getGlobalImpact);

/** POST Demo request – CRM lead. Saves to DB; optional: notify CEO (webhook/log). */
router.post('/demo-request', async (req: Request, res: Response) => {
  try {
    const body = req.body as Record<string, unknown>;
    const contactName = String(body.contactName ?? '').trim();
    const companyName = String(body.companyName ?? '').trim();
    const buildingCount = Math.max(1, Number(body.buildingCount) || 1);
    const phone = String(body.phone ?? '').trim();
    if (!contactName || !companyName || !phone) {
      return res.status(400).json({ message: 'Missing required fields: contactName, companyName, phone' });
    }
    const lead = await Lead.create({
      contactName,
      companyName,
      buildingCount,
      phone,
      source: 'landing_demo',
    });
    logger.info('[Lead] Demo request saved', { id: lead._id, companyName, contactName });
    res.status(201).json({
      success: true,
      message: 'Our strategic team will contact you within 24 hours to schedule a private tour.',
    });
  } catch (err) {
    logger.error('[Lead] Demo request error', { err });
    res.status(500).json({ message: 'Error submitting request' });
  }
});

export { getGlobalImpact };
export default router;
