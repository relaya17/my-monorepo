/**
 * Per-building stats for AI impact (landing page / public API). No tenant scope – aggregate by buildingId.
 */
import mongoose, { Document, Schema } from 'mongoose';

export interface IBuildingStats extends Document {
  buildingId: string;
  moneySavedByAI: number;
  preventedFailuresCount: number;
  residentHappinessScore?: number;
  updatedAt: Date;
}

const buildingStatsSchema = new Schema<IBuildingStats>(
  {
    buildingId: { type: String, required: true, unique: true, index: true },
    moneySavedByAI: { type: Number, default: 0 },
    preventedFailuresCount: { type: Number, default: 0 },
    residentHappinessScore: { type: Number, min: 0, max: 100 },
  },
  { timestamps: true }
);

buildingStatsSchema.index({ buildingId: 1 });

export const BuildingStats = mongoose.model<IBuildingStats>('BuildingStats', buildingStatsSchema);
export default BuildingStats;
