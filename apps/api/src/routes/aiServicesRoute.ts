/**
 * Routes for AI-first services – secured with auth, rate limiting, guardrails.
 */
import express, { Request, Response } from 'express';
import { authMiddleware, verifySuperAdmin } from '../middleware/authMiddleware.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import { validateAiResponse, getActiveRules } from '../services/aiValidationService.js';
import { triageTicket, retriageOpenTickets } from '../services/aiTriageService.js';
import { generateBuildingHealthReport } from '../services/predictiveMaintenanceService.js';
import { generateSaasMetrics } from '../services/saasMetricsService.js';
import { detectIntent, executeAction } from '../services/voneActionService.js';
import {
  checkActionGuard,
  checkPromptInjection,
  truncateInput,
} from '../services/aiGuardrailsService.js';
import { logAiDecision } from '../models/aiAuditLogModel.js';
import { logger } from '../utils/logger.js';

const router: express.Router = express.Router();

// All AI routes require authentication + AI-specific rate limit
router.use(authMiddleware);
router.use(aiLimiter);

// ─── AI Validation ───────────────────────────────────────────────

/** GET /api/ai-services/validation/rules – admin-only: list active validation rules */
router.get('/validation/rules', verifySuperAdmin, (_req: Request, res: Response) => {
  res.json({ rules: getActiveRules() });
});

/** POST /api/ai-services/validation/check – validate an AI response before sending */
router.post('/validation/check', (req: Request, res: Response) => {
  const { response, originalMessage, lang } = req.body;
  if (!response) return res.status(400).json({ message: 'Missing "response" field' });

  const auth = req.auth;
  const buildingId = auth?.buildingId ?? (req.headers['x-building-id'] as string) ?? 'unknown';

  const result = validateAiResponse(response, {
    buildingId,
    userId: auth?.sub ?? 'unknown',
    userRole: auth?.type ?? 'resident',
    originalMessage: originalMessage ?? '',
    lang,
  });

  if (result.violations.length > 0) {
    logAiDecision({
      service: 'validation',
      event: 'response_validated',
      actor: auth?.sub ?? 'unknown',
      buildingId,
      severity: result.approved ? 'warn' : 'block',
      details: { violations: result.violations, approved: result.approved },
    });
  }

  return res.json(result);
});

// ─── AI Triage ───────────────────────────────────────────────────

/** POST /api/ai-services/triage – classify a maintenance description */
router.post('/triage', async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;
    if (!description) return res.status(400).json({ message: 'Missing "description"' });

    const auth = req.auth;
    const buildingId = auth?.buildingId ?? (req.headers['x-building-id'] as string) ?? 'default';
    const safeDesc = truncateInput(description, 2000);

    const result = await triageTicket(title ?? '', safeDesc, buildingId);

    logAiDecision({
      service: 'triage',
      event: 'ticket_triaged',
      actor: auth?.sub ?? 'unknown',
      buildingId,
      severity: result.priority === 'Urgent' ? 'warn' : 'info',
      details: { priority: result.priority, category: result.category, confidence: result.confidence, isDuplicate: result.isDuplicate },
    });

    return res.json(result);
  } catch (err) {
    logger.error('AI Triage error', { error: (err as Error).message });
    return res.status(500).json({ message: 'Triage failed' });
  }
});

/** POST /api/ai-services/retriage/:buildingId – admin-only: re-triage all open tickets */
router.post('/retriage/:buildingId', verifySuperAdmin, async (req: Request, res: Response) => {
  try {
    const { buildingId } = req.params;
    const auth = req.auth;

    // Action guard: retriage is a critical bulk operation
    const guard = checkActionGuard('retriage_all', auth?.sub ?? 'unknown');
    if (!guard.allowed) {
      logAiDecision({
        service: 'guardrail',
        event: 'action_blocked',
        actor: auth?.sub ?? 'unknown',
        buildingId,
        severity: 'block',
        details: { action: 'retriage_all', reason: guard.reason },
      });
      return res.status(403).json({ message: guard.reason, requiresApproval: guard.requiresApproval });
    }

    const result = await retriageOpenTickets(buildingId);

    logAiDecision({
      service: 'triage',
      event: 'bulk_retriage',
      actor: auth?.sub ?? 'unknown',
      buildingId,
      severity: 'warn',
      details: { updated: result.updated },
    });

    return res.json(result);
  } catch (err) {
    logger.error('Re-triage error', { error: (err as Error).message });
    return res.status(500).json({ message: 'Re-triage failed' });
  }
});

// ─── Predictive Maintenance V2 ──────────────────────────────────

/** GET /api/ai-services/health/:buildingId – building health report */
router.get('/health/:buildingId', async (req: Request, res: Response) => {
  try {
    const { buildingId } = req.params;
    const report = await generateBuildingHealthReport(buildingId);
    return res.json(report);
  } catch (err) {
    logger.error('Building health error', { error: (err as Error).message });
    return res.status(500).json({ message: 'Health report generation failed' });
  }
});

// ─── SaaS Metrics ────────────────────────────────────────────────

/** GET /api/ai-services/metrics/:buildingId – admin-only: SaaS KPI report */
router.get('/metrics/:buildingId', verifySuperAdmin, async (req: Request, res: Response) => {
  try {
    const { buildingId } = req.params;
    const months = Math.min(parseInt(req.query.months as string, 10) || 3, 24); // Cap at 24 months
    const report = await generateSaasMetrics(buildingId, months);
    return res.json(report);
  } catch (err) {
    logger.error('SaaS Metrics error', { error: (err as Error).message });
    return res.status(500).json({ message: 'Metrics generation failed' });
  }
});

// ─── VOne Actions ────────────────────────────────────────────────

/** POST /api/ai-services/vone/action – detect intent & execute action */
router.post('/vone/action', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Missing "message"' });

    const auth = req.auth;
    const userId = auth?.sub ?? 'anonymous'; // NEVER accept userId from body
    const buildingId = auth?.buildingId ?? (req.headers['x-building-id'] as string) ?? 'default';

    // Prompt injection check
    const shield = checkPromptInjection(message);
    if (!shield.safe) {
      logAiDecision({
        service: 'guardrail',
        event: 'prompt_injection_blocked',
        actor: userId,
        buildingId,
        severity: 'block',
        details: { threats: shield.threats },
      });
      return res.status(400).json({ message: 'Invalid input detected', threats: shield.threats });
    }

    const safeMessage = truncateInput(message, 1000);
    const intent = detectIntent(safeMessage);

    if (intent.action === 'unknown') {
      return res.json({
        intent,
        result: null,
        message: 'No actionable intent detected. Use /vone/chat for conversational AI.',
      });
    }

    // Action guard: check rate + risk
    const guard = checkActionGuard(intent.action, userId);
    if (!guard.allowed) {
      logAiDecision({
        service: 'guardrail',
        event: 'action_rate_limited',
        actor: userId,
        buildingId,
        severity: 'warn',
        details: { action: intent.action, reason: guard.reason, riskLevel: guard.riskLevel },
      });
      return res.status(429).json({
        message: guard.reason,
        requiresApproval: guard.requiresApproval,
        riskLevel: guard.riskLevel,
      });
    }

    const result = await executeAction(intent, userId, buildingId, safeMessage);

    logAiDecision({
      service: 'action',
      event: 'action_executed',
      actor: userId,
      buildingId,
      severity: 'info',
      details: { action: intent.action, success: result.success, createdId: result.createdId },
    });

    return res.json({ intent, result });
  } catch (err) {
    logger.error('VOne Action error', { error: (err as Error).message });
    return res.status(500).json({ message: 'Action execution failed' });
  }
});

/** POST /api/ai-services/vone/detect – detect intent only (no execution) */
router.post('/vone/detect', (req: Request, res: Response) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ message: 'Missing "message"' });
  const safeMessage = truncateInput(message, 1000);
  const intent = detectIntent(safeMessage);
  return res.json(intent);
});

// ─── Voice-to-Insight ────────────────────────────────────────────

/**
 * POST /api/ai-services/voice-insight
 * Accepts a voice transcript (string) from the client (Web Speech API) and returns
 * structured maintenance insights: category, priority, suggested next steps, summary.
 */
router.post('/voice-insight', async (req: Request, res: Response) => {
  try {
    const { transcript } = req.body as { transcript?: string };
    if (!transcript?.trim()) return res.status(400).json({ message: 'חסר שדה transcript' });

    const safe = truncateInput(transcript.trim(), 2000);

    // Guard against prompt injection in voice transcripts
    const injection = checkPromptInjection(safe);
    if (injection.detected) {
      return res.status(400).json({ message: 'תוכן לא תקין זוהה' });
    }

    const auth = req.auth;
    const buildingId = auth?.buildingId ?? (req.headers['x-building-id'] as string) ?? 'default';

    const triage = await triageTicket('קריאת קול', safe, buildingId);

    const insight = {
      transcript: safe,
      category: triage.category,
      priority: triage.priority,
      confidence: triage.confidence,
      isDuplicate: triage.isDuplicate,
      suggestedTitle: `בעיה ב${triage.category}`,
      nextSteps: [] as string[],
      summary: safe.slice(0, 120),
    };

    logAiDecision({
      service: 'voice_insight',
      event: 'voice_triaged',
      actor: auth?.sub ?? 'unknown',
      buildingId,
      severity: triage.priority === 'Urgent' ? 'warn' : 'info',
      details: { priority: triage.priority, category: triage.category },
    });

    return res.json(insight);
  } catch (err) {
    logger.error('Voice-to-Insight error', { error: (err as Error).message });
    return res.status(500).json({ message: 'שגיאה בניתוח הקול' });
  }
});

// ─── Guardrail Status (admin dashboard) ──────────────────────────

/** GET /api/ai-services/guardrails/status – circuit breaker + budget status */
router.get('/guardrails/status', verifySuperAdmin, async (_req: Request, res: Response) => {
  const { getCircuitState, checkCostBudget } = await import('../services/aiGuardrailsService.js');
  const openaiCircuit = getCircuitState('openai');
  const budget = checkCostBudget('system');
  res.json({ circuits: { openai: openaiCircuit }, budget });
});

export default router;
