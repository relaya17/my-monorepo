import OpenAI from 'openai';
import Payment from '../models/paymentModel.js';

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
  const cutoff = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000);
  const payments = await Payment.find({
    buildingId,
    createdAt: { $gte: cutoff }
  }).sort({ createdAt: -1 });

  const summary: PaymentSummary[] = payments.map(payment => ({
    amount: payment.amount,
    status: payment.status ?? 'unknown',
    date: payment.createdAt.toISOString(),
    tenantId: payment.tenantId
  }));

  const client = getOpenAiClient();
  const response = await client.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [
      {
        role: 'system',
        content: 'אתה מנהל נכסים ומומחה פיננסי. נתח את הנתונים והפק תובנות קצרות: תזרים, חריגות, ודיירים בעייתיים. החזר JSON מובנה.'
      },
      {
        role: 'user',
        content: JSON.stringify({ buildingId, lookbackDays, payments: summary })
      }
    ],
    response_format: { type: 'json_object' }
  });

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
};
