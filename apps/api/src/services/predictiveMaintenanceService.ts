/**
 * Predictive Maintenance V2 – enhanced with time-series trend, seasonal analysis,
 * cost projection, and system health scores. Builds on existing maintenanceAiService.
 *
 * Keeps the original functions intact and adds a unified "buildingHealthReport".
 */
import Maintenance from '../models/maintenanceModel.js';
import { tenantContext } from '../middleware/tenantMiddleware.js';
import { logger } from '../utils/logger.js';

// ─── Types ───────────────────────────────────────────────────────

export interface MonthlyTrend {
  month: string; // YYYY-MM
  ticketCount: number;
  totalCost: number;
  avgResolutionDays: number;
}

export interface CategoryHealth {
  category: string;
  ticketCount: number;
  avgCost: number;
  totalCost: number;
  trend: 'improving' | 'stable' | 'worsening';
  /** 0–100, lower = more failures predicted */
  healthScore: number;
  nextFailurePrediction?: string;
}

export interface BuildingHealthReport {
  buildingId: string;
  generatedAt: string;
  overallHealthScore: number; // 0-100
  monthlyTrends: MonthlyTrend[];
  categoryHealth: CategoryHealth[];
  costProjection: {
    nextMonth: number;
    nextQuarter: number;
    nextYear: number;
  };
  topRecommendations: string[];
  seasonalRisks: string[];
}

// ─── Helpers ─────────────────────────────────────────────────────

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function linearRegression(data: number[]): { slope: number; intercept: number } {
  const n = data.length;
  if (n < 2) return { slope: 0, intercept: data[0] ?? 0 };
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += data[i];
    sumXY += i * data[i];
    sumXX += i * i;
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

// ─── Core Analysis ───────────────────────────────────────────────

/**
 * Generate a comprehensive health report for a building.
 * Analyses the last 12 months of maintenance data.
 */
export async function generateBuildingHealthReport(buildingId: string): Promise<BuildingHealthReport> {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const tickets = await tenantContext.run({ buildingId }, async () =>
    Maintenance.find({ createdAt: { $gte: oneYearAgo } }).lean()
  );

  // ── Monthly trends ──
  const monthly = new Map<string, { count: number; cost: number; resolutionDays: number[] }>();
  for (const t of tickets) {
    const mk = getMonthKey(new Date((t as { createdAt: Date }).createdAt));
    if (!monthly.has(mk)) monthly.set(mk, { count: 0, cost: 0, resolutionDays: [] });
    const bucket = monthly.get(mk)!;
    bucket.count++;
    bucket.cost += (t as { actualCost?: number }).actualCost ?? 0;

    const closedAt = (t as { closedAt?: Date }).closedAt;
    if (closedAt) {
      const created = new Date((t as { createdAt: Date }).createdAt).getTime();
      const closed = new Date(closedAt).getTime();
      bucket.resolutionDays.push((closed - created) / (1000 * 60 * 60 * 24));
    }
  }

  const monthlyTrends: MonthlyTrend[] = [...monthly.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      ticketCount: data.count,
      totalCost: Math.round(data.cost),
      avgResolutionDays: data.resolutionDays.length
        ? Math.round((data.resolutionDays.reduce((a, b) => a + b, 0) / data.resolutionDays.length) * 10) / 10
        : 0,
    }));

  // ── Category health ──
  const catMap = new Map<string, { count: number; costs: number[]; recentCount: number }>();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  for (const t of tickets) {
    const cat = (t as { category?: string }).category ?? 'Other';
    if (!catMap.has(cat)) catMap.set(cat, { count: 0, costs: [], recentCount: 0 });
    const bucket = catMap.get(cat)!;
    bucket.count++;
    bucket.costs.push((t as { actualCost?: number }).actualCost ?? 0);
    if (new Date((t as { createdAt: Date }).createdAt) >= threeMonthsAgo) {
      bucket.recentCount++;
    }
  }

  const categoryHealth: CategoryHealth[] = [...catMap.entries()].map(([category, data]) => {
    const total = data.costs.reduce((a, b) => a + b, 0);
    const avg = data.costs.length ? total / data.costs.length : 0;
    const oldRate = (data.count - data.recentCount) / 9; // avg monthly rate for older 9 months
    const recentRate = data.recentCount / 3;
    const trend: 'improving' | 'stable' | 'worsening' =
      recentRate > oldRate * 1.3 ? 'worsening' : recentRate < oldRate * 0.7 ? 'improving' : 'stable';
    const healthScore = Math.max(0, Math.min(100, Math.round(100 - data.count * 5 - (trend === 'worsening' ? 20 : 0))));

    return {
      category,
      ticketCount: data.count,
      avgCost: Math.round(avg),
      totalCost: Math.round(total),
      trend,
      healthScore,
      ...(trend === 'worsening'
        ? { nextFailurePrediction: `High probability of ${category} failure within 30 days` }
        : {}),
    };
  });

  // ── Cost projection via linear regression ──
  const monthlyCosts = monthlyTrends.map((m) => m.totalCost);
  const { slope, intercept } = linearRegression(monthlyCosts);
  const n = monthlyCosts.length;
  const nextMonthCost = Math.max(0, Math.round(slope * n + intercept));
  const nextQuarterCost = Math.max(0, Math.round([0, 1, 2].reduce((sum, i) => sum + slope * (n + i) + intercept, 0)));
  const nextYearCost = Math.max(0, Math.round(Array.from({ length: 12 }, (_, i) => slope * (n + i) + intercept).reduce((a, b) => a + b, 0)));

  // ── Overall health ──
  const scores = categoryHealth.map((c) => c.healthScore);
  const overallHealthScore = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 100;

  // ── Seasonal risks ──
  const currentMonth = new Date().getMonth();
  const seasonalRisks: string[] = [];
  if (currentMonth >= 5 && currentMonth <= 8) {
    seasonalRisks.push('Summer: HVAC and cooling failures historically spike. Schedule preventive AC maintenance.');
  }
  if (currentMonth >= 10 || currentMonth <= 1) {
    seasonalRisks.push('Winter: Plumbing freeze risks. Inspect pipe insulation and boiler systems.');
  }
  if (currentMonth >= 2 && currentMonth <= 4) {
    seasonalRisks.push('Spring: Pest control season. Schedule preventive treatments.');
  }

  // ── Recommendations ──
  const topRecommendations: string[] = [];
  const worsening = categoryHealth.filter((c) => c.trend === 'worsening');
  for (const cat of worsening.slice(0, 3)) {
    topRecommendations.push(
      `Replace ${cat.category} infrastructure: ${cat.ticketCount} tickets in 12 months with worsening trend. ` +
        `Projected savings: ₪${Math.round(cat.totalCost * 0.4).toLocaleString()}/year.`
    );
  }
  if (nextYearCost > 0) {
    topRecommendations.push(`Annual maintenance cost projection: ₪${nextYearCost.toLocaleString()}. Consider preventive budget allocation.`);
  }
  if (topRecommendations.length === 0) {
    topRecommendations.push('Building maintenance is on track. Continue current preventive schedule.');
  }

  const report: BuildingHealthReport = {
    buildingId,
    generatedAt: new Date().toISOString(),
    overallHealthScore,
    monthlyTrends,
    categoryHealth,
    costProjection: { nextMonth: nextMonthCost, nextQuarter: nextQuarterCost, nextYear: nextYearCost },
    topRecommendations,
    seasonalRisks,
  };

  logger.info('[Predictive Maintenance V2]', { buildingId, overallHealthScore, categoriesAnalyzed: categoryHealth.length });
  return report;
}
