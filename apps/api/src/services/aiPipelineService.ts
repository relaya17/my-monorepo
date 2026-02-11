/**
 * AI Pipeline: ingestion (anonymous aggregations) and processing (insights). TECHNICAL_SPECIFICATION §11
 */
import Payment from '../models/paymentModel.js';
import AiAggregation from '../models/aiAggregationModel.js';
import AiInsight from '../models/aiInsightModel.js';
import { logger } from '../utils/logger.js';

function getPeriod(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/** Ingestion: aggregate payments per building and period (no PII). */
export async function runIngestion(): Promise<void> {
  try {
    const payments = await Payment.collection.find({}).toArray();
    const byBuildingPeriod: Record<string, { totalAmount: number; paymentCount: number; byCategory: Record<string, number>; byStatus: Record<string, number> }> = {};
    for (const p of payments) {
      const bid = (p as { buildingId?: string }).buildingId ?? 'default';
      const createdAt = (p as { createdAt?: Date }).createdAt ?? new Date();
      const period = getPeriod(createdAt);
      const key = `${bid}:${period}`;
      if (!byBuildingPeriod[key]) {
        byBuildingPeriod[key] = { totalAmount: 0, paymentCount: 0, byCategory: {}, byStatus: {} };
      }
      const rec = byBuildingPeriod[key];
      const amount = (p as { amount?: number }).amount ?? 0;
      const category = ((p as { category?: string }).category ?? 'כללי').trim();
      const status = ((p as { status?: string }).status ?? 'pending').trim();
      rec.totalAmount += amount;
      rec.paymentCount += 1;
      rec.byCategory[category] = (rec.byCategory[category] ?? 0) + amount;
      rec.byStatus[status] = (rec.byStatus[status] ?? 0) + 1;
    }
    for (const [key, metrics] of Object.entries(byBuildingPeriod)) {
      const [buildingId, period] = key.split(':');
      await AiAggregation.findOneAndUpdate(
        { buildingId, period },
        { $set: { buildingId, period, metrics, createdAt: new Date() } },
        { upsert: true }
      );
    }
    logger.info('AI ingestion completed', { keys: Object.keys(byBuildingPeriod).length });
  } catch (err) {
    logger.error('AI ingestion failed', { error: (err as Error).message });
  }
}

/** Processing: compute trends and write insights. */
export async function runProcessing(): Promise<void> {
  try {
    const aggregations = await AiAggregation.find({}).sort({ buildingId: 1, period: 1 }).lean();
    const byBuilding: Record<string, { period: string; totalAmount: number }[]> = {};
    for (const a of aggregations) {
      const bid = a.buildingId;
      if (!byBuilding[bid]) byBuilding[bid] = [];
      const total = a.metrics?.totalAmount ?? 0;
      byBuilding[bid].push({ period: a.period, totalAmount: total });
    }
    for (const [buildingId, periods] of Object.entries(byBuilding)) {
      periods.sort((x, y) => x.period.localeCompare(y.period));
      if (periods.length < 2) continue;
      const last = periods[periods.length - 1];
      const prev = periods[periods.length - 2];
      const change = prev.totalAmount > 0 ? ((last.totalAmount - prev.totalAmount) / prev.totalAmount) * 100 : 0;
      const title = change > 15 ? 'עלייה בהכנסות' : change < -15 ? 'ירידה בהכנסות' : 'יציבות בהכנסות';
      const description =
        change > 15
          ? `עלייה של כ־${Math.round(change)}% בהכנסות בחודש ${last.period} בהשוואה לחודש הקודם – מומלץ להמשיך במגמה.`
          : change < -15
            ? `ירידה של כ־${Math.round(-change)}% בהכנסות בחודש ${last.period} – מומלץ לבדוק סיבות.`
            : `הכנסות יציבות בחודש ${last.period}.`;
      await AiInsight.create({
        buildingId,
        type: 'revenue_trend',
        title,
        description,
        priority: Math.abs(change) > 20 ? 'high' : 'medium'
      });
    }
    logger.info('AI processing completed', { buildings: Object.keys(byBuilding).length });
  } catch (err) {
    logger.error('AI processing failed', { error: (err as Error).message });
  }
}

export async function runPipeline(): Promise<void> {
  await runIngestion();
  await runProcessing();
}
