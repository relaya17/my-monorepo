/**
 * AI Vision Logs – for CEO Dashboard & Anomaly Detection.
 * Schema: docs/HSLL_DATABASE_SCHEMA.md (VisionLogSchema).
 */
import mongoose, { Document, Schema } from 'mongoose';
import { multiTenancyPlugin } from '../utils/multiTenancy.js';

export type VisionLogEventType = 'FLOOD_DETECTION' | 'OBSTRUCTION' | 'UNAUTHORIZED_ENTRY';

export interface IVisionLog extends Document {
  cameraId: string;
  eventType: VisionLogEventType;
  confidence: number;
  resolved: boolean;
  timestamp: Date;
  thumbnailUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const visionLogSchema = new Schema<IVisionLog>(
  {
    cameraId: { type: String, required: true },
    eventType: {
      type: String,
      enum: ['FLOOD_DETECTION', 'OBSTRUCTION', 'UNAUTHORIZED_ENTRY'],
      required: true,
    },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    resolved: { type: Boolean, default: false },
    timestamp: { type: Date, required: true, default: Date.now },
    thumbnailUrl: { type: String },
  },
  { timestamps: true }
);

visionLogSchema.index({ buildingId: 1, timestamp: -1 });
visionLogSchema.index({ buildingId: 1, resolved: 1 });
visionLogSchema.plugin(multiTenancyPlugin);

export const VisionLog = mongoose.model<IVisionLog>('VisionLog', visionLogSchema);
export default VisionLog;
