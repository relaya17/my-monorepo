/**
 * Monthly reconciliation: Income vs Expense for Financial Health (HSLL Enterprise).
 */
import Payment from '../models/paymentModel.js';
import Maintenance from '../models/maintenanceModel.js';
import Transaction from '../models/transactionModel.js';
import { tenantContext } from '../middleware/tenantMiddleware.js';

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}
function subMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() - n, d.getDate());
}

export interface ReconciliationResult {
  buildingId: string;
  period: { start: Date; end: Date };
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  incomeCount: number;
  expenseCount: number;
}

/**
 * Run reconciliation for a building and optional month (default: previous month).
 */
export async function runMonthlyReconciliation(
  buildingId: string,
  month?: Date
): Promise<ReconciliationResult> {
  const ref = month ?? subMonths(new Date(), 1);
  const start = startOfMonth(ref);
  const end = endOfMonth(ref);

  const [incomeSum, expenseSum, incomeCount, expenseCount] = await tenantContext.run(
    { buildingId },
    async () => {
      const [txIncome, txExpense, paymentsPaid, maintenanceCosts] = await Promise.all([
        Transaction.aggregate([
          { $match: { type: 'income', createdAt: { $gte: start, $lte: end } } },
          { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
        ]),
        Transaction.aggregate([
          { $match: { type: 'expense', createdAt: { $gte: start, $lte: end } } },
          { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
        ]),
        Payment.find({ status: 'paid', createdAt: { $gte: start, $lte: end } })
          .select('amount')
          .lean(),
        Maintenance.find({
          status: { $in: ['Resolved', 'Closed'] },
          resolvedAt: { $gte: start, $lte: end },
          actualCost: { $exists: true, $ne: null },
        })
          .select('actualCost')
          .lean(),
      ]);

      let income = txIncome[0]?.total ?? 0;
      let expense = txExpense[0]?.total ?? 0;
      const incCount = txIncome[0]?.count ?? 0;
      const expCount = txExpense[0]?.count ?? 0;
      if (paymentsPaid.length && income === 0) {
        income = (paymentsPaid as { amount: number }[]).reduce((s, p) => s + p.amount, 0);
      }
      if (maintenanceCosts.length && expense === 0) {
        expense = (maintenanceCosts as { actualCost: number }[]).reduce((s, m) => s + (m.actualCost ?? 0), 0);
      }
      return [income, expense, incCount || paymentsPaid.length, expCount || maintenanceCosts.length];
    }
  );

  return {
    buildingId,
    period: { start, end },
    totalIncome: incomeSum,
    totalExpenses: expenseSum,
    balance: incomeSum - expenseSum,
    incomeCount: incomeCount as number,
    expenseCount: expenseCount as number,
  };
}
