/**
 * AI Triage Service – automatic severity classification for maintenance tickets.
 * Replaces manual admin review with instant AI-powered categorization.
 *
 * Flow: Resident reports issue → triageTicket() → assigns priority + category + estimated cost
 *       → finds duplicate tickets → optionally dispatches to contractor.
 */
import Maintenance from '../models/maintenanceModel.js';
import { tenantContext } from '../middleware/tenantMiddleware.js';
import { logger } from '../utils/logger.js';
import crypto from 'crypto';

// ─── Keyword-based severity classification (no OpenAI dependency) ────

interface TriageKeywordRule {
  keywords: RegExp;
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  category?: string;
  estimatedResponseHours: number;
}

const TRIAGE_RULES: TriageKeywordRule[] = [
  // URGENT – safety hazards
  {
    keywords: /(?:שריפה|fire|גז|gas\s*leak|הצפה|flood|התחשמלות|electrocution|קצר\s*חשמלי|short\s*circuit|עשן|smoke|ניתוק\s*מים|water\s*shutoff)/i,
    priority: 'Urgent',
    estimatedResponseHours: 1,
  },
  // HIGH – infrastructure failures
  {
    keywords: /(?:מעלית|elevator|lift|תקועה|stuck|נזילה|leak|נזיל|drip|ביוב|sewage|דוד\s*חם|boiler|חימום|heating|מזגן\s*(?:מרכזי|central)|פיצוץ\s*צינור|pipe\s*burst)/i,
    priority: 'High',
    estimatedResponseHours: 4,
  },
  // MEDIUM – comfort/quality
  {
    keywords: /(?:מנורה|light|bulb|תאורה|lighting|דלת|door|חלון|window|אינטרקום|intercom|שער|gate|מתג|switch|שקע|outlet|ברז|faucet|tap)/i,
    priority: 'Medium',
    estimatedResponseHours: 24,
  },
  // LOW – cosmetic / non-urgent
  {
    keywords: /(?:צבע|paint|ניקיון|clean|גינה|garden|landscaping|חניה|parking|שלט|sign|תיבת\s*דואר|mailbox)/i,
    priority: 'Low',
    estimatedResponseHours: 72,
  },
];

const CATEGORY_RULES: { keywords: RegExp; category: string }[] = [
  { keywords: /(?:מעלית|elevator|lift)/i, category: 'Elevator' },
  { keywords: /(?:נזילה|נזיל|מים|ביוב|ברז|צינור|leak|water|sewage|pipe|faucet|plumbing|הצפה|flood)/i, category: 'Plumbing' },
  { keywords: /(?:חשמל|מנורה|תאורה|מתג|שקע|electric|light|switch|outlet|wiring)/i, category: 'Electrical' },
  { keywords: /(?:ניקיון|clean|לכלוך|dirt|אשפה|garbage|trash)/i, category: 'Cleaning' },
  { keywords: /(?:אבטחה|מצלמה|שער|אינטרקום|security|camera|gate|intercom)/i, category: 'Security' },
];

export interface TriageResult {
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  category: string;
  urgencyScore: number; // 1-10
  estimatedResponseHours: number;
  isDuplicate: boolean;
  duplicateTicketId?: string;
  confidence: number; // 0-1
  reasoning: string;
}

function computeSimilarityHash(text: string): string {
  const normalized = text.toLowerCase().replace(/[^\w\sא-ת]/g, '').replace(/\s+/g, ' ').trim();
  return crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 24);
}

function classifyPriority(text: string): { priority: 'Urgent' | 'High' | 'Medium' | 'Low'; score: number; hours: number; confidence: number; reasoning: string } {
  const combined = text.toLowerCase();
  for (const rule of TRIAGE_RULES) {
    const match = combined.match(rule.keywords);
    if (match) {
      const scoreMap = { Urgent: 10, High: 7, Medium: 5, Low: 2 };
      return {
        priority: rule.priority,
        score: scoreMap[rule.priority],
        hours: rule.estimatedResponseHours,
        confidence: 0.85,
        reasoning: `Keyword match: "${match[0]}" → ${rule.priority}`,
      };
    }
  }
  return { priority: 'Medium', score: 5, hours: 24, confidence: 0.5, reasoning: 'No specific keywords matched – default Medium' };
}

function classifyCategory(text: string): string {
  const combined = text.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.test(combined)) return rule.category;
  }
  return 'Other';
}

/**
 * Triage a new maintenance ticket: classify priority, category, detect duplicates.
 * Call this from the maintenance creation route before saving the ticket.
 */
export async function triageTicket(
  title: string,
  description: string,
  buildingId: string
): Promise<TriageResult> {
  const fullText = `${title} ${description}`;
  const { priority, score, hours, confidence, reasoning } = classifyPriority(fullText);
  const category = classifyCategory(fullText);
  const hash = computeSimilarityHash(fullText);

  // Duplicate detection: look for open tickets with same hash in last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const duplicate = await tenantContext.run({ buildingId }, async () =>
    Maintenance.findOne({
      'aiAnalysis.similarityHash': hash,
      status: { $in: ['Open', 'In_Progress', 'Waiting_For_Parts'] },
      createdAt: { $gte: thirtyDaysAgo },
    })
      .select('_id')
      .lean()
  );

  const result: TriageResult = {
    priority,
    category,
    urgencyScore: score,
    estimatedResponseHours: hours,
    isDuplicate: !!duplicate,
    duplicateTicketId: duplicate ? String(duplicate._id) : undefined,
    confidence,
    reasoning,
  };

  logger.info('[AI Triage]', { buildingId, priority, category, isDuplicate: result.isDuplicate, hash });
  return result;
}

/**
 * Bulk re-triage all open tickets for a building (e.g., after model update or rule changes).
 */
export async function retriageOpenTickets(buildingId: string): Promise<{ updated: number }> {
  let updated = 0;
  const tickets = await tenantContext.run({ buildingId }, async () =>
    Maintenance.find({ status: { $in: ['Open', 'In_Progress'] } }).lean()
  );

  for (const ticket of tickets) {
    const fullText = `${ticket.title} ${ticket.description}`;
    const { priority, score } = classifyPriority(fullText);
    const category = classifyCategory(fullText);
    const hash = computeSimilarityHash(fullText);

    await tenantContext.run({ buildingId }, async () => {
      await Maintenance.updateOne(
        { _id: ticket._id },
        {
          $set: {
            priority,
            category,
            'aiAnalysis.urgencyScore': score,
            'aiAnalysis.similarityHash': hash,
          },
        }
      );
    });
    updated++;
  }

  logger.info('[AI Re-Triage]', { buildingId, updated });
  return { updated };
}
