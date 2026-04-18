/**
 * Smart Voting: create (linked to maintenance), cast (with weight/proxy), close, results.
 */
import { Request, Response, Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  createVote,
  castVote,
  closeVote,
  getVoteResults,
} from '../services/votingService.js';
import Voting from '../models/votingModel.js';
import { tenantContext } from '../middleware/tenantMiddleware.js';

const router = Router();

function getBuildingId(req: Request): string {
  return (req.headers['x-building-id'] as string)?.trim() || 'default';
}

/** List votes (open + recent closed). */
router.get('/', async (req: Request, res: Response) => {
  try {
    const buildingId = getBuildingId(req);
    const status = req.query.status as string | undefined;
    const list = await tenantContext.run({ buildingId }, async () => {
      const q: Record<string, string> = {};
      if (status) q.status = status;
      return Voting.find(q).sort({ deadline: -1 }).limit(50).lean();
    });
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

/** Get single vote + results. */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const buildingId = getBuildingId(req);
    const results = await getVoteResults(buildingId, req.params.id);
    if (!results) return res.status(404).json({ error: 'הצבעה לא נמצאה' });
    res.json(results);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

/** Create vote (committee/admin). */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const buildingId = getBuildingId(req);
    const { title, description, relatedMaintenanceId, options, deadline, requiredQuorum, eligibleVoterCount } = req.body;
    if (!title || !Array.isArray(options) || options.length === 0 || !deadline) {
      return res.status(400).json({ error: 'חסרים שדות: title, options, deadline' });
    }
    const vote = await createVote(buildingId, {
      title,
      description,
      relatedMaintenanceId,
      options: options.map((o: { text: string; costEstimate?: number }) => ({ text: o.text, costEstimate: o.costEstimate })),
      deadline: new Date(deadline),
      requiredQuorum,
      eligibleVoterCount,
    });
    res.status(201).json(vote);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

/** Cast vote (resident or proxy). */
router.post('/:id/vote', authMiddleware, async (req: Request, res: Response) => {
  try {
    const buildingId = getBuildingId(req);
    const userId = req.auth?.sub;
    if (!userId) return res.status(401).json({ error: 'אין הרשאה' });
    const { optionIndex, voteWeight, proxyForUserId } = req.body;
    if (typeof optionIndex !== 'number') return res.status(400).json({ error: 'optionIndex חובה' });
    const vote = await castVote(buildingId, req.params.id, userId, {
      optionIndex,
      voteWeight,
      proxyForUserId,
    });
    res.json(vote);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

/** Close vote (committee/admin) – sets Passed/Rejected/Expired, protocol, auto-execution. */
router.post('/:id/close', authMiddleware, async (req: Request, res: Response) => {
  try {
    const buildingId = getBuildingId(req);
    const vote = await closeVote(buildingId, req.params.id);
    res.json(vote);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

export default router;
