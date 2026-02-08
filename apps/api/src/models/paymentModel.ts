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

const paymentSchema = new Schema<Payment>({
  payer: { type: String, required: true },
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  category: { type: String },
  status: { type: String, enum: ['pending', 'paid', 'overdue', 'failed'], default: 'pending' },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  dueDate: { type: Date },
  buildingId: { type: String },
  tenantId: { type: String },
  stripeAccountId: { type: String },
  stripeSessionId: { type: String },
  stripePaymentIntentId: { type: String }
});

paymentSchema.plugin(multiTenancyPlugin);

export default model<Payment>('Payment', paymentSchema);
