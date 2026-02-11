/**
 * Anonymous aggregated metrics for AI pipeline. TECHNICAL_SPECIFICATION §11.1
 */
import mongoose, { Document, Schema } from 'mongoose';

export interface IAiAggregation extends Document {
  buildingId: string;
  period: string;
  metrics: {
    totalAmount?: number;
    paymentCount?: number;
    byCategory?: Record<string, number>;
    byStatus?: Record<string, number>;
  };
  createdAt: Date;
}

const aiAggregationSchema = new Schema<IAiAggregation>({
  buildingId: { type: String, required: true, index: true },
  period: { type: String, required: true, index: true },
  metrics: { type: Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now }
});

aiAggregationSchema.index({ buildingId: 1, period: 1 }, { unique: true });

export default mongoose.model<IAiAggregation>('AiAggregation', aiAggregationSchema);
