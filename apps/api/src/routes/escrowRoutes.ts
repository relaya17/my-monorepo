/**
 * Escrow routes — hold/approve/release payment flow.
 *
 * POST /api/escrow                – create escrow (tenant pays, status=held)
 * GET  /api/escrow                – list escrows (admin: all, user: own)
 * GET  /api/escrow/:id            – get single escrow
 * POST /api/escrow/:id/approve    – admin approves work (status→approved)
 * POST /api/escrow/:id/release    – admin releases funds via 70/20/10 split (status→released)
 * POST /api/escrow/:id/dispute    – tenant/admin opens dispute (status→disputed)
 * POST /api/escrow/:id/refund     – admin refunds tenant (status→refunded)
 */
import { Request, Response, Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { tenantContext } from '../middleware/tenantMiddleware.js';
import Escrow from '../models/escrowModel.js';
import { splitPayment } from '../services/stripeService.js';
import { logActivityServer } from '../utils/auditLog.js';
import mongoose from 'mongoose';

const router = Router();

function getBuildingId(req: Request): string {
  return (req.headers['x-building-id'] as string)?.trim() || req.auth?.buildingId || 'default';
}

/** List escrows */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const buildingId = getBuildingId(req);
    const auth = req.auth!;
    const filter: Record<string, unknown> = {};
    if (auth.type !== 'admin') filter.payerId = auth.sub;
    if (req.query.status) filter.status = req.query.status;

    const escrows = await tenantContext.run({ buildingId }, () =>
      Escrow.find(filter).sort({ createdAt: -1 }).lean()
    );
    res.json(escrows);
  } catch {
    res.status(500).json({ error: 'שגיאה בטעינת הנאמנויות' });
  }
});

/** Get single escrow */
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const buildingId = getBuildingId(req);
    const escrow = await tenantContext.run({ buildingId }, () =>
      Escrow.findById(req.params.id).lean()
    );
    if (!escrow) return res.status(404).json({ error: 'נאמנות לא נמצאה' });
    res.json(escrow);
  } catch {
    res.status(500).json({ error: 'שגיאה בטעינת הנאמנות' });
  }
});

/** Create escrow (hold payment) */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const buildingId = getBuildingId(req);
    const auth = req.auth!;
    const {
      contractorId,
      contractorName,
      maintenanceId,
      amountIls,
      description,
      stripePaymentIntentId,
      stripeContractorAccountId,
      stripeBuildingAccountId,
    } = req.body as {
      contractorId?: string;
      contractorName?: string;
      maintenanceId?: string;
      amountIls?: number;
      description?: string;
      stripePaymentIntentId?: string;
      stripeContractorAccountId?: string;
      stripeBuildingAccountId?: string;
    };

    if (!contractorId || !contractorName || !amountIls || !description) {
      return res.status(400).json({ error: 'contractorId, contractorName, amountIls, description הם שדות חובה' });
    }
    if (!Number.isFinite(amountIls) || amountIls <= 0) {
      return res.status(400).json({ error: 'amountIls חייב להיות מספר חיובי' });
    }

    const escrow = await tenantContext.run({ buildingId }, () =>
      Escrow.create({
        payerId: auth.sub,
        payerName: auth.email ?? auth.sub,
        contractorId: new mongoose.Types.ObjectId(contractorId),
        contractorName,
        maintenanceId: maintenanceId ? new mongoose.Types.ObjectId(maintenanceId) : undefined,
        amountIls,
        description,
        status: stripePaymentIntentId ? 'held' : 'pending',
        stripePaymentIntentId,
        stripeContractorAccountId,
        stripeBuildingAccountId,
      })
    );

    res.status(201).json(escrow);
  } catch {
    res.status(500).json({ error: 'שגיאה ביצירת הנאמנות' });
  }
});

/** Approve work (admin) → mark as approved, ready to release */
router.post('/:id/approve', authMiddleware, async (req: Request, res: Response) => {
  try {
    const auth = req.auth;
    if (!auth || auth.type !== 'admin') return res.status(403).json({ error: 'גישה לאדמינים בלבד' });

    const buildingId = getBuildingId(req);
    const escrow = await tenantContext.run({ buildingId }, () =>
      Escrow.findById(req.params.id)
    );
    if (!escrow) return res.status(404).json({ error: 'נאמנות לא נמצאה' });
    if (!['held', 'pending'].includes(escrow.status)) {
      return res.status(400).json({ error: `לא ניתן לאשר בסטטוס ${escrow.status}` });
    }

    escrow.status = 'approved';
    escrow.approvedBy = auth.sub;
    escrow.approvedAt = new Date();
    await escrow.save();

    res.json(escrow);
  } catch {
    res.status(500).json({ error: 'שגיאה באישור הנאמנות' });
  }
});

/** Release funds — runs 70/20/10 Stripe split (admin only) */
router.post('/:id/release', authMiddleware, async (req: Request, res: Response) => {
  try {
    const auth = req.auth;
    if (!auth || auth.type !== 'admin') return res.status(403).json({ error: 'גישה לאדמינים בלבד' });

    const buildingId = getBuildingId(req);
    const escrow = await tenantContext.run({ buildingId }, () =>
      Escrow.findById(req.params.id)
    );
    if (!escrow) return res.status(404).json({ error: 'נאמנות לא נמצאה' });
    if (escrow.status !== 'approved') {
      return res.status(400).json({ error: 'ניתן לשחרר רק נאמנות מאושרת' });
    }
    if (!escrow.stripePaymentIntentId || !escrow.stripeContractorAccountId || !escrow.stripeBuildingAccountId) {
      return res.status(400).json({ error: 'חסרים פרטי Stripe לביצוע החלוקה' });
    }

    const splits = await splitPayment({
      paymentIntentId: escrow.stripePaymentIntentId,
      amountIls: escrow.amountIls,
      contractorAccountId: escrow.stripeContractorAccountId,
      buildingAccountId: escrow.stripeBuildingAccountId,
    });

    escrow.status = 'released';
    escrow.releasedAt = new Date();
    escrow.contractorTransferId = splits.contractorTransferId;
    escrow.buildingTransferId = splits.buildingTransferId;
    await escrow.save();

    await logActivityServer('ESCROW_RELEASED', 'PAYMENT', {
      buildingId,
      escrowId: String(escrow._id),
      amountIls: escrow.amountIls,
      contractorName: escrow.contractorName,
      ...splits,
    });

    res.json({
      message: 'הכספים שוחררו בהצלחה',
      escrow,
      splits: {
        contractor: { percent: 70, amountIls: +(escrow.amountIls * 0.7).toFixed(2), transferId: splits.contractorTransferId },
        building: { percent: 20, amountIls: +(escrow.amountIls * 0.2).toFixed(2), transferId: splits.buildingTransferId },
        platform: { percent: 10, amountIls: +(escrow.amountIls * 0.1).toFixed(2) },
      },
    });
  } catch (err) {
    console.error('Escrow release error:', err);
    res.status(500).json({ error: 'שגיאה בשחרור הכספים' });
  }
});

/** Open dispute */
router.post('/:id/dispute', authMiddleware, async (req: Request, res: Response) => {
  try {
    const buildingId = getBuildingId(req);
    const { reason } = req.body as { reason?: string };
    if (!reason?.trim()) return res.status(400).json({ error: 'נא לציין סיבת המחלוקת' });

    const escrow = await tenantContext.run({ buildingId }, () =>
      Escrow.findById(req.params.id)
    );
    if (!escrow) return res.status(404).json({ error: 'נאמנות לא נמצאה' });
    if (!['pending', 'held', 'approved'].includes(escrow.status)) {
      return res.status(400).json({ error: `לא ניתן לפתוח מחלוקת בסטטוס ${escrow.status}` });
    }

    escrow.status = 'disputed';
    escrow.disputeReason = reason.trim();
    await escrow.save();

    res.json(escrow);
  } catch {
    res.status(500).json({ error: 'שגיאה בפתיחת המחלוקת' });
  }
});

/** Refund tenant (admin only) */
router.post('/:id/refund', authMiddleware, async (req: Request, res: Response) => {
  try {
    const auth = req.auth;
    if (!auth || auth.type !== 'admin') return res.status(403).json({ error: 'גישה לאדמינים בלבד' });

    const buildingId = getBuildingId(req);
    const escrow = await tenantContext.run({ buildingId }, () =>
      Escrow.findById(req.params.id)
    );
    if (!escrow) return res.status(404).json({ error: 'נאמנות לא נמצאה' });
    if (escrow.status === 'released') {
      return res.status(400).json({ error: 'לא ניתן להחזיר נאמנות שכבר שוחררה' });
    }

    escrow.status = 'refunded';
    await escrow.save();

    await logActivityServer('ESCROW_REFUNDED', 'PAYMENT', {
      buildingId,
      escrowId: String(escrow._id),
      amountIls: escrow.amountIls,
      payerName: escrow.payerName,
    });

    res.json({ message: `הכספים הוחזרו ל-${escrow.payerName}`, escrow });
  } catch {
    res.status(500).json({ error: 'שגיאה בהחזרת הכספים' });
  }
});

export default router;
