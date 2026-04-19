/**
 * Digital Key — one-time time-limited access token for maintenance workers.
 * Resident generates a token → sends to contractor → contractor scans/enters → verified once.
 */
import mongoose, { Document, Schema } from 'mongoose';
import { multiTenancyPlugin } from '../utils/multiTenancy.js';

export interface IDigitalKey extends Document {
  residentId: string;
  residentName: string;
  apartmentNumber: string;
  token: string; // 8-char uppercase hex
  expiresAt: Date;
  usedAt?: Date;
  usedBy?: string; // contractorId or name
  purpose: string; // e.g. "כניסה לתיקון ברז"
  isRevoked: boolean;
  buildingId: string;
  createdAt: Date;
  updatedAt: Date;
}

const digitalKeySchema = new Schema<IDigitalKey>(
  {
    residentId: { type: String, required: true },
    residentName: { type: String, required: true },
    apartmentNumber: { type: String, required: true },
    token: { type: String, required: true, unique: true, uppercase: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date },
    usedBy: { type: String },
    purpose: { type: String, required: true },
    isRevoked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

digitalKeySchema.index({ token: 1 }, { unique: true });
digitalKeySchema.index({ buildingId: 1, residentId: 1, createdAt: -1 });
digitalKeySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL auto-cleanup
digitalKeySchema.plugin(multiTenancyPlugin);

export const DigitalKey = mongoose.model<IDigitalKey>('DigitalKey', digitalKeySchema);
export default DigitalKey;
