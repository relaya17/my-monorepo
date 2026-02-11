/**
 * Transaction service: create income/expense entries for CEO reconciliation.
 */
import { Types } from 'mongoose';
import Transaction, { ITransaction, TransactionType } from '../models/transactionModel.js';
import { tenantContext } from '../middleware/tenantMiddleware.js';

export interface CreateTransactionInput {
  type: TransactionType;
  amount: number;
  category?: string;
  description?: string;
  relatedPaymentId?: string;
  relatedMaintenanceId?: string;
  metadata?: Record<string, unknown>;
}

export async function createTransaction(
  buildingId: string,
  input: CreateTransactionInput
): Promise<ITransaction> {
  return tenantContext.run({ buildingId }, async () => {
    const doc = await Transaction.create({
      type: input.type,
      amount: input.amount,
      category: input.category,
      description: input.description,
      relatedPaymentId: input.relatedPaymentId ? new Types.ObjectId(input.relatedPaymentId) : undefined,
      relatedMaintenanceId: input.relatedMaintenanceId ? new Types.ObjectId(input.relatedMaintenanceId) : undefined,
      metadata: input.metadata,
    });
    return doc;
  });
}
