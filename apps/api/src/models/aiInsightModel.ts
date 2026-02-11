/**
 * Stored AI insights for admins. TECHNICAL_SPECIFICATION §11.2, §11.3
 */
import mongoose, { Document, Schema } from 'mongoose';

export interface IAiInsight extends Document {
  buildingId: string;
  type: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
}

const aiInsightSchema = new Schema<IAiInsight>({
  buildingId: { type: String, required: true, index: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  priority: { type: String, required: true, enum: ['high', 'medium', 'low'] },
  createdAt: { type: Date, default: Date.now }
});

aiInsightSchema.index({ buildingId: 1, createdAt: -1 });

export default mongoose.model<IAiInsight>('AiInsight', aiInsightSchema);
