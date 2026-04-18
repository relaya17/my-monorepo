/**
 * Unified Transaction: Income (Dues) and Expense (Maintenance/Inventory) for CEO reconciliation.
 */
import mongoose, { Document, Schema } from 'mongoose';
import { multiTenancyPlugin } from '../utils/multiTenancy.js';
import { softDeletePlugin } from '../utils/softDeletePlugin.js';

export type TransactionType = 'income' | 'expense';

export interface ITransaction extends Document {
  type: TransactionType;
  amount: number;
  category?: string;
  description?: string;
  relatedPaymentId?: mongoose.Types.ObjectId;
  relatedMaintenanceId?: mongoose.Types.ObjectId;
  metadata?: Record<string, unknown>;
  isDeleted?: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    type: { type: String, enum: ['income', 'expense'], required: true },
    amount: { type: Number, required: true },
    category: String,
    description: String,
    relatedPaymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
    relatedMaintenanceId: { type: Schema.Types.ObjectId, ref: 'Maintenance' },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

transactionSchema.index({ buildingId: 1, type: 1, createdAt: -1 });
transactionSchema.plugin(multiTenancyPlugin);
transactionSchema.plugin(softDeletePlugin);

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
export default Transaction;
