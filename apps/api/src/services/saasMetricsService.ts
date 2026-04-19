/**
 * AI SaaS Metrics Service – automated KPI generation for building management.
 * Provides churn prediction, revenue analytics, operational efficiency metrics,
 * and AI impact measurement.
 *
 * Designed for the admin dashboard and investor reports.
 */
import Payment from '../models/paymentModel.js';
import Maintenance from '../models/maintenanceModel.js';
import { tenantContext } from '../middleware/tenantMiddleware.js';
import { logger } from '../utils/logger.js';

// ─── Types ───────────────────────────────────────────────────────

export interface TenantChurnRisk {
  tenantId: string;
  riskScore: number; // 0-100
  factors: string[];
  recommendation: string;
}

export interface OperationalMetrics {
  avgTicketResolutionDays: number;
  ticketResolutionImprovement: number; // % vs. previous period
  openTicketCount: number;
  overdueTicketCount: number;
  aiTriagedPercentage: number;
  duplicatesDetected: number;
}

export interface RevenueMetrics {
  totalRevenue: number;
  collectionRate: number; // 0-1
  delinquentTenants: number;
  avgPaymentDelay: number; // days
  revenueGrowthRate: number; // % month-over-month
}

export interface AiImpactMetrics {
  totalAiTriagedTickets: number;
  avgTriageSavingsMinutes: number; // estimated time saved per ticket
  costSavingsEstimate: number;
  voneConversations: number;
  voneActionExecutions: number;
  predictiveWarningsIssued: number;
  duplicatesPreventedCount: number;
}

export interface SaasMetricsReport {
  buildingId: string;
  generatedAt: string;
  period: { from: string; to: string };
  operational: OperationalMetrics;
  revenue: RevenueMetrics;
  churnRisks: TenantChurnRisk[];
  aiImpact: AiImpactMetrics;
}

// ─── Analysis Functions ──────────────────────────────────────────

async function computeOperationalMetrics(buildingId: string, from: Date, to: Date): Promise<OperationalMetrics> {
  const tickets = await tenantContext.run({ buildingId }, async () =>
    Maintenance.find({ createdAt: { $gte: from, $lte: to } }).lean()
  );

  const closed = tickets.filter((t) => (t as { status?: string }).status === 'Closed');
  const open = tickets.filter((t) => ['Open', 'In_Progress', 'Waiting_For_Parts'].includes((t as { status?: string }).status ?? ''));
  const aiTriaged = tickets.filter((t) => (t as { aiAnalysis?: { urgencyScore?: number } }).aiAnalysis?.urgencyScore != null);
  const duplicates = tickets.filter(
    (t) => (t as { aiAnalysis?: { similarityHash?: string } }).aiAnalysis?.similarityHash
  );

  const resolutionDays = closed.flatMap((t) => {
    const createdAt = (t as { createdAt: Date }).createdAt;
    const closedAt = (t as { closedAt?: Date }).closedAt;
    if (!closedAt) {
      return [];
    }

    const created = new Date(createdAt).getTime();
    const closed = new Date(closedAt).getTime();
    return [(closed - created) / (1000 * 60 * 60 * 24)];
  });

  const avgResolution = resolutionDays.length
    ? resolutionDays.reduce((a, b) => a + b, 0) / resolutionDays.length
    : 0;

  // Previous period for comparison
  const periodLength = to.getTime() - from.getTime();
  const prevFrom = new Date(from.getTime() - periodLength);
  const prevTickets = await tenantContext.run({ buildingId }, async () =>
    Maintenance.find({ createdAt: { $gte: prevFrom, $lt: from }, status: 'Closed' }).lean()
  );
  const prevResolution = prevTickets.flatMap((t) => {
    const createdAt = (t as { createdAt: Date }).createdAt;
    const closedAt = (t as { closedAt?: Date }).closedAt;
    if (!closedAt) {
      return [];
    }

    const created = new Date(createdAt).getTime();
    const closed = new Date(closedAt).getTime();
    return [(closed - created) / (1000 * 60 * 60 * 24)];
  });
  const prevAvg = prevResolution.length
    ? prevResolution.reduce((a, b) => a + b, 0) / prevResolution.length
    : avgResolution;
  const improvement = prevAvg > 0 ? ((prevAvg - avgResolution) / prevAvg) * 100 : 0;

  const sevenDaysAgo = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);
  const overdue = open.filter((t) => new Date((t as { createdAt: Date }).createdAt) < sevenDaysAgo);

  return {
    avgTicketResolutionDays: Math.round(avgResolution * 10) / 10,
    ticketResolutionImprovement: Math.round(improvement * 10) / 10,
    openTicketCount: open.length,
    overdueTicketCount: overdue.length,
    aiTriagedPercentage: tickets.length > 0 ? Math.round((aiTriaged.length / tickets.length) * 100) : 0,
    duplicatesDetected: duplicates.length,
  };
}

async function computeRevenueMetrics(buildingId: string, from: Date, to: Date): Promise<RevenueMetrics> {
  const payments = await tenantContext.run({ buildingId }, async () =>
    Payment.find({ createdAt: { $gte: from, $lte: to } }).lean()
  );

  const total = payments.reduce((sum, p) => sum + ((p as { amount?: number }).amount ?? 0), 0);
  const paid = payments.filter((p) => (p as { status?: string }).status === 'paid');
  const collectionRate = payments.length > 0 ? paid.length / payments.length : 1;
  const delinquent = new Set(
    payments
      .filter((p) => (p as { status?: string }).status === 'overdue')
      .map((p) => String((p as { tenantId?: string }).tenantId))
  );

  // Payment delay: diff between dueDate and paidAt
  const delays = paid.flatMap((p) => {
    const dueDate = (p as { dueDate?: Date }).dueDate;
    const paidAt = (p as { paidAt?: Date }).paidAt;
    if (!dueDate || !paidAt) {
      return [];
    }

    const due = new Date(dueDate).getTime();
    const paid = new Date(paidAt).getTime();
    return [(paid - due) / (1000 * 60 * 60 * 24)];
  });
  const avgDelay = delays.length ? delays.reduce((a, b) => a + b, 0) / delays.length : 0;

  // Month-over-month growth
  const midPoint = new Date((from.getTime() + to.getTime()) / 2);
  const firstHalf = payments
    .filter((p) => new Date((p as { createdAt: Date }).createdAt) < midPoint)
    .reduce((sum, p) => sum + ((p as { amount?: number }).amount ?? 0), 0);
  const secondHalf = total - firstHalf;
  const growthRate = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : 0;

  return {
    totalRevenue: Math.round(total),
    collectionRate: Math.round(collectionRate * 100) / 100,
    delinquentTenants: delinquent.size,
    avgPaymentDelay: Math.round(avgDelay * 10) / 10,
    revenueGrowthRate: Math.round(growthRate * 10) / 10,
  };
}

async function computeChurnRisks(buildingId: string, from: Date, to: Date): Promise<TenantChurnRisk[]> {
  const payments = await tenantContext.run({ buildingId }, async () =>
    Payment.find({ createdAt: { $gte: from, $lte: to } }).lean()
  );

  const tenantData = new Map<string, { overdueCount: number; totalPayments: number; complaints: number }>();
  for (const p of payments) {
    const tid = String((p as { tenantId?: string }).tenantId ?? 'unknown');
    if (!tenantData.has(tid)) tenantData.set(tid, { overdueCount: 0, totalPayments: 0, complaints: 0 });
    const data = tenantData.get(tid)!;
    data.totalPayments++;
    if ((p as { status?: string }).status === 'overdue') data.overdueCount++;
  }

  // Check maintenance complaints per tenant
  const complaints = await tenantContext.run({ buildingId }, async () =>
    Maintenance.find({ createdAt: { $gte: from, $lte: to } }).lean()
  );
  for (const c of complaints) {
    const tid = String((c as { reporterId?: string }).reporterId ?? 'unknown');
    if (tenantData.has(tid)) {
      tenantData.get(tid)!.complaints++;
    }
  }

  const risks: TenantChurnRisk[] = [];
  for (const [tenantId, data] of tenantData.entries()) {
    const factors: string[] = [];
    let score = 0;

    if (data.overdueCount > 0) {
      const overdueRate = data.overdueCount / data.totalPayments;
      score += overdueRate * 40;
      if (overdueRate > 0.3) factors.push(`${Math.round(overdueRate * 100)}% payments overdue`);
    }
    if (data.complaints > 3) {
      score += 20;
      factors.push(`${data.complaints} maintenance complaints filed`);
    }
    if (data.complaints > 5) {
      score += 15;
      factors.push('High complaint volume indicates dissatisfaction');
    }

    if (score > 30) {
      risks.push({
        tenantId,
        riskScore: Math.min(100, Math.round(score)),
        factors,
        recommendation:
          score > 60
            ? 'Immediate outreach recommended. Offer meeting with building manager.'
            : 'Monitor closely. Consider proactive communication about open issues.',
      });
    }
  }

  return risks.sort((a, b) => b.riskScore - a.riskScore).slice(0, 20);
}

/**
 * Generate a full SaaS metrics report for a building.
 */
export async function generateSaasMetrics(
  buildingId: string,
  periodMonths = 3
): Promise<SaasMetricsReport> {
  const to = new Date();
  const from = new Date();
  from.setMonth(from.getMonth() - periodMonths);

  const [operational, revenue, churnRisks] = await Promise.all([
    computeOperationalMetrics(buildingId, from, to),
    computeRevenueMetrics(buildingId, from, to),
    computeChurnRisks(buildingId, from, to),
  ]);

  // AI Impact: estimated from operational data
  const avgManualTriageMinutes = 15;
  const aiImpact: AiImpactMetrics = {
    totalAiTriagedTickets: Math.round((operational.aiTriagedPercentage / 100) * (operational.openTicketCount + operational.overdueTicketCount + operational.duplicatesDetected)),
    avgTriageSavingsMinutes: avgManualTriageMinutes,
    costSavingsEstimate: Math.round(operational.aiTriagedPercentage * avgManualTriageMinutes * 0.5), // ₪0.5/min labor
    voneConversations: 0, // will be populated when VOne analytics tracking is added
    voneActionExecutions: 0,
    predictiveWarningsIssued: 0,
    duplicatesPreventedCount: operational.duplicatesDetected,
  };

  logger.info('[SaaS Metrics]', { buildingId, periodMonths, churnRisks: churnRisks.length });

  return {
    buildingId,
    generatedAt: new Date().toISOString(),
    period: { from: from.toISOString(), to: to.toISOString() },
    operational,
    revenue,
    churnRisks,
    aiImpact,
  };
}
