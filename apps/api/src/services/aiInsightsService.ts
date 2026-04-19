import OpenAI from 'openai';
import Payment from '../models/paymentModel.js';
import {
  checkCostBudget,
  trackAiCost,
  getMaxTokens,
  isCircuitOpen,
  recordCircuitSuccess,
  recordCircuitFailure,
  scrubPii,
} from './aiGuardrailsService.js';
import { logAiDecision } from '../models/aiAuditLogModel.js';

type PaymentSummary = {
  amount: number;
  status: string;
  date: string;
  tenantId?: string;
};

export type BuildingInsights = {
  summary: string;
  cashFlow: string;
  anomalies: string[];
  delinquentTenants: string[];
  recommendations: string[];
};

let openAiClient: OpenAI | null = null;

const getOpenAiClient = () => {
  if (openAiClient) {
    return openAiClient;
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY environment variable');
  }
  openAiClient = new OpenAI({ apiKey });
  return openAiClient;
};

const safeJsonParse = (raw: string | null) => {
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const generateBuildingInsights = async (buildingId: string, lookbackDays = 30) => {
  // Circuit breaker check
  if (isCircuitOpen('openai')) {
    logAiDecision({
      service: 'insights', event: 'circuit_open', actor: 'system',
      buildingId, severity: 'warn', details: { reason: 'OpenAI circuit breaker is open' },
    });
    return {
      summary: 'AI service temporarily unavailable. Try again in a few minutes.',
      cashFlow: 'לא זמין', anomalies: [], delinquentTenants: [], recommendations: [],
    } satisfies BuildingInsights;
  }

  // Cost budget check
  const budget = checkCostBudget('system');
  if (!budget.allowed) {
    logAiDecision({
      service: 'insights', event: 'budget_exceeded', actor: 'system',
      buildingId, severity: 'block', details: { reason: budget.reason },
    });
    return {
      summary: 'AI budget limit reached. Contact admin.', cashFlow: 'לא זמין',
      anomalies: [], delinquentTenants: [], recommendations: [],
    } satisfies BuildingInsights;
  }

  const cutoff = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000);
  const payments = await Payment.find({
    buildingId,
    createdAt: { $gte: cutoff }
  }).sort({ createdAt: -1 }).limit(500); // Cap query results

  // Scrub PII before sending to OpenAI
  const summary: PaymentSummary[] = payments.map(payment => ({
    amount: payment.amount,
    status: payment.status ?? 'unknown',
    date: payment.createdAt.toISOString(),
    // tenantId scrubbed – don't send real IDs to external AI
  }));

  const client = getOpenAiClient();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000); // 30s timeout

    const response = await client.chat.completions.create({
      model: 'gpt-4-turbo',
      max_tokens: getMaxTokens(),
    messages: [
      {
        role: 'system',
        content: 'אתה מנהל נכסים ומומחה פיננסי. נתח את הנתונים והפק תובנות קצרות: תזרים, חריגות, ודיירים בעייתיים. החזר JSON מובנה.'
      },
      {
        role: 'user',
          content: scrubPii(JSON.stringify({ buildingId, lookbackDays, payments: summary })).scrubbed
        }
      ],
      response_format: { type: 'json_object' }
    }, { signal: controller.signal });

    clearTimeout(timeout);

    // Track cost (GPT-4-turbo: ~$0.01/1K input, $0.03/1K output)
    const tokensUsed = response.usage?.total_tokens ?? 0;
    const estimatedCostUSD = tokensUsed * 0.00003; // conservative estimate
    trackAiCost(estimatedCostUSD);

    logAiDecision({
      service: 'insights', event: 'openai_call_success', actor: 'system',
      buildingId, severity: 'info',
      details: { model: 'gpt-4-turbo', lookbackDays, paymentCount: payments.length },
      cost: { tokensUsed, estimatedUSD: estimatedCostUSD, model: 'gpt-4-turbo' },
    });

    recordCircuitSuccess('openai');

    const raw = response.choices[0]?.message?.content ?? null;
    const parsed = safeJsonParse(raw);

    if (!parsed || typeof parsed !== 'object') {
      return {
        summary: 'לא התקבל פלט תקין מהמודל',
        cashFlow: 'לא זמין',
        anomalies: [],
        delinquentTenants: [],
        recommendations: []
      } satisfies BuildingInsights;
    }

    return parsed as BuildingInsights;
  } catch (err) {
    recordCircuitFailure('openai');
    logAiDecision({
      service: 'insights', event: 'openai_call_failed', actor: 'system',
      buildingId, severity: 'error',
      details: { error: (err as Error).message },
    });
    return {
      summary: 'AI analysis temporarily unavailable',
      cashFlow: 'לא זמין',
      anomalies: [],
      delinquentTenants: [],
      recommendations: [],
    } satisfies BuildingInsights;
  }
};
