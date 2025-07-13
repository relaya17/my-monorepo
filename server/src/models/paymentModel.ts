import { Schema, model, Document } from 'mongoose';

interface Payment extends Document {
  payer: string;
  amount: number;
  createdAt: Date;
}

const paymentSchema = new Schema<Payment>({
  payer: { type: String, required: true },
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default model<Payment>('Payment', paymentSchema);
