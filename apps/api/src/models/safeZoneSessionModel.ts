/**
 * Safe-Zone escort session model.
 * Resident requests virtual camera escort from building entrance to apartment door.
 * Status flow: requested → active → completed | failed
 */
import mongoose, { Document, Schema } from 'mongoose';
import { multiTenancyPlugin } from '../utils/multiTenancy.js';

export interface ISafeZoneSession extends Document {
  residentId: string;
  residentName: string;
  apartmentNumber: string;
  status: 'requested' | 'active' | 'completed' | 'failed';
  requestedAt: Date;
  activatedAt?: Date;
  completedAt?: Date;
  note?: string;
  buildingId: string;
  createdAt: Date;
  updatedAt: Date;
}

const safeZoneSessionSchema = new Schema<ISafeZoneSession>(
  {
    residentId: { type: String, required: true },
    residentName: { type: String, required: true },
    apartmentNumber: { type: String, required: true },
    status: {
      type: String,
      enum: ['requested', 'active', 'completed', 'failed'],
      default: 'requested',
    },
    requestedAt: { type: Date, default: () => new Date() },
    activatedAt: { type: Date },
    completedAt: { type: Date },
    note: { type: String },
  },
  { timestamps: true }
);

safeZoneSessionSchema.index({ buildingId: 1, status: 1, createdAt: -1 });
safeZoneSessionSchema.plugin(multiTenancyPlugin);

export const SafeZoneSession = mongoose.model<ISafeZoneSession>('SafeZoneSession', safeZoneSessionSchema);
export default SafeZoneSession;
