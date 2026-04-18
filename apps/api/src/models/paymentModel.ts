import { Schema, model, Document, Types } from 'mongoose';
import { multiTenancyPlugin } from '../utils/multiTenancy.js';

interface Payment extends Document {
  payer: string;
  amount: number;
  createdAt: Date;
  category?: string;
  status?: 'pending' | 'paid' | 'overdue' | 'failed';
  userId?: Types.ObjectId;
  dueDate?: Date;
  buildingId?: string;
  tenantId?: string;
  stripeAccountId?: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
}

const paymentSchema = new Schema<Payment>(
  {
    payer: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String },
    status: { type: String, enum: ['pending', 'paid', 'overdue', 'failed'], default: 'pending' },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    dueDate: { type: Date },
    tenantId: { type: String },
    stripeAccountId: { type: String },
    stripeSessionId: { type: String },
    stripePaymentIntentId: { type: String, index: true },
  },
  { timestamps: true }
);

paymentSchema.plugin(multiTenancyPlugin);

paymentSchema.index({ buildingId: 1, status: 1, createdAt: -1 });
paymentSchema.index({ buildingId: 1, userId: 1, dueDate: 1 });
paymentSchema.index({ buildingId: 1, createdAt: -1 });
paymentSchema.index({ buildingId: 1, userId: 1 });

export default model<Payment>('Payment', paymentSchema);
