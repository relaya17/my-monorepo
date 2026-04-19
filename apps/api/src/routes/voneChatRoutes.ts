/**
 * V-One Chat – Function Calling + Revenue Share Ecosystem (Real Estate Intent)
 * Intent: sell/rent → RealEstateLead, notify manager, bill $10/10₪
 */
import express, { Request, Response } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import Building from '../models/buildingModel.js';
import Maintenance from '../models/maintenanceModel.js';
import VisionLog from '../models/visionLogModel.js';
import BuildingStats from '../models/buildingStatsModel.js';
import { buildVOneSystemContext } from '../utils/voneContext.js';
import { getOrSetCache } from '../utils/cache.js';
import { tenantContext } from '../middleware/tenantMiddleware.js';
import { createRealEstateLead } from '../services/realEstateLeadService.js';
import { validateAiResponse } from '../services/aiValidationService.js';
import { detectIntent, executeAction } from '../services/voneActionService.js';
import { checkPromptInjection, truncateInput, checkActionGuard } from '../services/aiGuardrailsService.js';
import { logAiDecision } from '../models/aiAuditLogModel.js';

const router = express.Router();

const REPORT_KEYWORDS_HE = /\bתקלה|נזיל|נזילה|חשמל|מעלית|דווח|תקון\b/;
const REPORT_KEYWORDS_EN = /\bfault|leak|electrical|elevator|report|repair|dishwasher|garbage\s*disposal\b/;

/** Revenue Share – Intent Recognition Engine (Semantic Search)
 * 1. Direct: sell/rent – מוכר, משכיר, sell, louer
 * 2. High Value Lead: הערכת שווי, מעבר דירה, חוזה שכירות, מחפש קונה
 */
const SELL_RENT_KEYWORDS_HE =
  /\bמכור|למכור|מכירה|להשכיר|השכיר|השכרה|להשכרה|רוצה\s*למכור|רוצה\s*להשכיר|מוכר\s*את\s*הדירה|משכיר|הערכת\s*שווי|מעבר\s*דירה|לעבור\s*לדירה|חוזה\s*שכירות|מתי\s*מסתיים\s*החוזה|מחפש\s*קונה|שוקל\s*לעבור\b/;
const SELL_RENT_KEYWORDS_EN =
  /\bsell|selling|for\s*sale|looking\s*to\s*sell|rent|renting|for\s*rent|looking\s*to\s*rent|lease|list(?:ing)?\s*(?:my\s*)?(?:apartment|unit)|property\s*valuation|moving\s*out|lease\s*contract|when\s*does\s*(?:the\s*)?(?:lease|contract)\s*end|looking\s*for\s*(?:a\s*)?buyer\b/i;
const SELL_RENT_KEYWORDS_FR =
  /\bvendre|vente|louer|location|je\s*veux\s*louer|je\s*veux\s*vendre|mon\s*appart(?:ement)?\s*(?:à\s*)?(?:vendre|louer)|estimation|déménagement|contrat\s*de\s*location|fin\s*du\s*contrat|cherche\s*acheteur\b/i;

/** Infer dealType from message – rent vs sale. High-value phrases. */
function inferDealType(message: string, lower: string): 'sale' | 'rent' {
  const rentPhrases = /\brent|להשכיר|השכרה|louer|location|חוזה\s*שכירות|מתי\s*מסתיים\s*החוזה|lease\s*contract|contrat\s*de\s*location|fin\s*du\s*contrat\b/i;
  const salePhrases = /\bsell|מכור|מכירה|מחפש\s*קונה|valuation|הערכת\s*שווי|buyer|acheteur|vendre|vente\b/i;
  if (rentPhrases.test(message) || rentPhrases.test(lower)) return 'rent';
  if (salePhrases.test(message) || salePhrases.test(lower)) return 'sale';
  if (/\bמעבר\s*דירה|moving\s*out|déménagement\b/i.test(message) || /\bmoving\s*out|déménagement\b/i.test(lower)) return 'rent';
  return 'sale';
}

/** POST /api/vone/chat – שליחת הודעה ל-V-One, תשובה חכמה */
router.post('/chat', authMiddleware, async (req: Request, res: Response) => {
  const auth = (req as Request & { auth?: { sub: string; type: string; buildingId?: string } }).auth;
  if (!auth || auth.type !== 'user') {
    return res.status(403).json({ message: 'גישה לדיירים בלבד' });
  }
  const body = req.body as { message?: string; lang?: string };
  const rawMessage = typeof body.message === 'string' ? body.message.trim() : '';
  if (!rawMessage) return res.status(400).json({ message: 'נא לשלוח message' });

  // ── Guardrails: prompt injection + truncation ──
  const shield = checkPromptInjection(rawMessage);
  if (!shield.safe) {
    logAiDecision({
      service: 'guardrail', event: 'prompt_injection_blocked', actor: auth.sub,
      buildingId: auth.buildingId ?? 'unknown', severity: 'block',
      details: { threats: shield.threats },
    });
    return res.status(400).json({ message: 'Invalid input detected' });
  }
  const message = truncateInput(rawMessage, 2000);

  const buildingId = (auth.buildingId ?? req.headers['x-building-id'])?.toString().trim() || 'default';
  const building = await getOrSetCache(
    `building:vone:${buildingId}`,
    () => Building.findOne({ buildingId }).select('country timezone').lean(),
    300
  );
  const country = (building as { country?: string } | null)?.country ?? 'IL';
  const timezone = (building as { timezone?: string } | null)?.timezone ?? 'Asia/Jerusalem';

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const extended = await tenantContext.run({ buildingId }, async () => {
    const [openCount, urgentOpen, visionAlerts, stats] = await Promise.all([
      Maintenance.countDocuments({ reporterId: auth.sub, isDeleted: { $ne: true }, status: { $in: ['Open', 'In_Progress'] } }),
      Maintenance.findOne({ isDeleted: { $ne: true }, status: { $in: ['Open', 'In_Progress'] }, priority: 'Urgent', category: { $in: ['Plumbing', 'Electrical'] } }).select('_id').lean(),
      VisionLog.find({ resolved: false, timestamp: { $gte: sevenDaysAgo } }).sort({ timestamp: -1 }).limit(5).select('eventType cameraId timestamp').lean(),
      BuildingStats.findOne({ buildingId }).select('moneySavedByAI').lean(),
    ]);
    return {
      openTicketsCount: openCount,
      emergencyDetected: !!urgentOpen,
      recentVisionAlerts: (visionAlerts as { eventType?: string; cameraId?: string; timestamp?: Date }[]).map((v) => ({
        eventType: v.eventType ?? '',
        cameraId: v.cameraId,
        timestamp: v.timestamp,
      })),
      moneySaved: (stats as { moneySavedByAI?: number } | null)?.moneySavedByAI ?? 0,
    };
  });

  const systemContext = buildVOneSystemContext({ country, timezone, lang: body.lang, extended });

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    const lower = message.toLowerCase();
    const isReport = REPORT_KEYWORDS_HE.test(message) || REPORT_KEYWORDS_EN.test(lower);

    if (isReport) {
      let reply =
        country === 'US'
          ? 'I understand you have a fault. I opened the report page – fill in the details and we will send a technician promptly.'
          : 'הבנתי שיש לך תקלה. פתחתי עבורך את דף הדיווח – מלא את הפרטים ונשלח טכנאי בהקדם.';
      if (extended.emergencyDetected) {
        reply = (country === 'US' ? '⚠️ Emergency in building. Stay away from affected areas. ' : '⚠️ יש אירוע חירום בבניין. הישאר מחוץ לאזור הסכנה. ') + reply;
      }
      return res.json({ reply, action: 'report' });
    }
    if (/\bחשבון|תשלום|כסף\b|\baccount|payment|balance\b/.test(message) || /\baccount|payment|balance\b/.test(lower)) {
      const reply =
        country === 'US'
          ? 'To view your account balance, go to the Payments page.'
          : 'כדי לראות את מצב החשבון שלך, עבור לדף התשלומים.';
      return res.json({ reply, action: 'account' });
    }

    const isSellRent = SELL_RENT_KEYWORDS_HE.test(message) || SELL_RENT_KEYWORDS_EN.test(lower) || SELL_RENT_KEYWORDS_FR.test(lower);
    if (isSellRent) {
      const dealType = inferDealType(message, lower);
      const lead = await createRealEstateLead(auth.sub, dealType, message, buildingId);
      const reply =
        country === 'US'
          ? lead
            ? "Hello dear resident. I'm updating our real estate department immediately. A sales manager will get back to you within an hour with an accurate valuation and market overview. Would you like us to schedule a meeting?"
            : "I'd be happy to help. The property manager will contact you shortly regarding your apartment."
          : lead
            ? 'שלום דייר יקר. אני מעדכן את מחלקת הנדל"ן שלנו מיד. מנהל המכירות יחזור אליך תוך שעה עם הערכת שווי מדויקת וסקירת שוק. האם תרצה שנתאם פגישה?'
            : 'אשמח לעזור. מנהל הנכס יצור איתך קשר בקרוב.';
      return res.json({ reply, action: 'real_estate_lead', dealType });
    }

    // ── VOne Action Execution: detect actionable intents ──
    const intent = detectIntent(message);
    if (intent.action !== 'unknown' && intent.confidence >= 0.7) {
      // Action guard: rate + risk check
      const guard = checkActionGuard(intent.action, auth.sub);
      if (!guard.allowed) {
        const lang = country === 'US' ? 'en' : 'he';
        logAiDecision({
          service: 'guardrail', event: 'action_rate_limited', actor: auth.sub,
          buildingId, severity: 'warn',
          details: { action: intent.action, reason: guard.reason },
        });
        const reply = lang === 'en'
          ? 'You have reached the limit for this action. Please try again later or contact the building manager.'
          : 'הגעת למגבלת הפעולות. נסה שוב מאוחר יותר או פנה למנהל הבניין.';
        return res.json({ reply, action: null, rateLimited: true });
      }

      const actionResult = await executeAction(intent, auth.sub, buildingId, message);
      const lang = country === 'US' ? 'en' : 'he';
      const reply = actionResult.message[lang];
      const validated = validateAiResponse(reply, {
        buildingId, userId: auth.sub, userRole: 'resident', originalMessage: message, lang,
      });

      logAiDecision({
        service: 'action', event: 'vone_action_executed', actor: auth.sub,
        buildingId, severity: 'info',
        details: { action: intent.action, success: actionResult.success, createdId: actionResult.createdId },
      });

      return res.json({
        reply: validated.sanitizedResponse,
        action: intent.action,
        data: actionResult.data,
        createdId: actionResult.createdId,
      });
    }

    let reply =
      country === 'US'
        ? "I'm V-One, your personal assistant. How can I help? You can use the buttons below or report a fault."
        : 'אני V-One, העוזר האישי שלך. איך אוכל לעזור? תוכל לבחור בכפתורים למטה או לדווח על תקלה.';
    if (extended.emergencyDetected) {
      reply = (country === 'US' ? '⚠️ Emergency in building. ' : '⚠️ יש אירוע חירום בבניין. ') + reply;
    } else if (extended.openTicketsCount && extended.openTicketsCount > 0) {
      const hint =
        country === 'US'
          ? `You have ${extended.openTicketsCount} open ticket(s). `
          : `יש לך ${extended.openTicketsCount} תקלה/ות פתוחות. `;
      reply = hint + reply;
    } else if (extended.recentVisionAlerts?.length) {
      const hint = country === 'US' ? 'Vision AI detected issues – tickets were created. ' : 'מצלמות ה-AI זיהו אירועים – פתחנו כרטיסים. ';
      reply = hint + reply;
    }
    return res.json({ reply, action: null });
  }

  void systemContext;

  try {
    // TODO: חיבור OpenAI Assistants API – להעביר systemContext כ-system message
    res.json({
      reply:
        country === 'US'
          ? 'OpenAI Assistants will be enabled with OPENAI_API_KEY. I currently work in basic mode.'
          : 'החיבור ל-OpenAI Assistants יופעל עם הגדרת OPENAI_API_KEY. כרגע אני עובד במצב בסיסי.',
      action: null,
    });
  } catch (err) {
    console.error('V-One chat error:', err);
    res.status(500).json({ message: 'שגיאה בשרת' });
  }
});

export default router;
