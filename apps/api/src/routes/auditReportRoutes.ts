/**
 * Audit reports (Financial, Maintenance, Annual). Security: editing approved report blocked for non super-admin.
 */
import express, { Request, Response } from 'express';
import AuditReport from '../models/auditReportModel.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { tenantContext } from '../middleware/tenantMiddleware.js';
import { logActivity } from '../utils/auditLog.js';

const router = express.Router();

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const buildingId = (req.headers['x-building-id'] as string)?.trim() || 'default';
    const list = await tenantContext.run({ buildingId }, async () =>
      AuditReport.find().sort({ 'period.end': -1 }).lean()
    );
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'שגיאה בשליפת דוחות' });
  }
});

router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const buildingId = (req.headers['x-building-id'] as string)?.trim() || 'default';
    const doc = await tenantContext.run({ buildingId }, async () =>
      AuditReport.findById(req.params.id).lean()
    );
    if (!doc) return res.status(404).json({ error: 'דוח לא נמצא' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: 'שגיאה' });
  }
});

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const buildingId = (req.headers['x-building-id'] as string)?.trim() || 'default';
    const body = req.body as Record<string, unknown>;
    const doc = await tenantContext.run({ buildingId }, async () =>
      AuditReport.create({
        reportType: body.reportType,
        period: body.period,
        summary: body.summary,
        totalIncome: body.totalIncome,
        totalExpenses: body.totalExpenses,
        approvedByCommittee: body.approvedByCommittee ?? false,
        files: body.files ?? [],
        digitalSignature: body.digitalSignature,
      })
    );
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ error: 'שגיאה ביצירת דוח' });
  }
});

router.patch('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const buildingId = (req.headers['x-building-id'] as string)?.trim() || 'default';
    const role = (req as Request & { auth?: { role?: string } }).auth?.role;
    const existing = await tenantContext.run({ buildingId }, async () =>
      AuditReport.findById(req.params.id).lean()
    );
    if (!existing) return res.status(404).json({ error: 'דוח לא נמצא' });
    if ((existing as { approvedByCommittee?: boolean }).approvedByCommittee && role !== 'super-admin') {
      await logActivity(req, 'SUSPICIOUS_BEHAVIOR', 'SECURITY', {
        action: 'Attempt to edit approved audit report',
        reportId: req.params.id,
        userRole: role,
      }, 'high');
      return res.status(403).json({ error: 'אסור לערוך דוח שאושר על ידי ועדת ביקורת. גישה למנכ"לית בלבד.' });
    }
    const body = req.body as Record<string, unknown>;
    const update: Record<string, unknown> = {};
    if (body.summary !== undefined) update.summary = body.summary;
    if (body.totalIncome !== undefined) update.totalIncome = body.totalIncome;
    if (body.totalExpenses !== undefined) update.totalExpenses = body.totalExpenses;
    if (body.approvedByCommittee !== undefined) update.approvedByCommittee = body.approvedByCommittee;
    if (body.files !== undefined) update.files = body.files;
    if (body.digitalSignature !== undefined) update.digitalSignature = body.digitalSignature;
    const updated = await tenantContext.run({ buildingId }, async () =>
      AuditReport.findByIdAndUpdate(req.params.id, { $set: update }, { new: true }).lean()
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'שגיאה בעדכון דוח' });
  }
});

export default router;
