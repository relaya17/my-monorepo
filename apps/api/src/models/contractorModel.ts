/**
 * Contractor – קבלן/טכנאי ב-Vantera.
 * Online/Offline Toggle: isOnline flag + lastSeenAt.
 * GPS location: lastLat/lastLng for Pro-Radar.
 * Stripe Connect: stripeAccountId for 70% split.
 */
import mongoose, { Document, Schema } from 'mongoose';
import { multiTenancyPlugin } from '../utils/multiTenancy.js';

export interface IContractor extends Document {
  name: string;
  phone: string;
  email?: string;
  specialty: string; // e.g. "plumber", "electrician", "locksmith"
  /** JWT sub — links a Vantera user account to this contractor profile */
  externalId?: string;
  stripeAccountId?: string;
  isOnline: boolean;
  lastSeenAt?: Date;
  lastLat?: number;
  lastLng?: number;
  isBlocked: boolean;
  blockedReason?: string;
  avgRating?: number;
  ratingCount: number;
  buildingId: string;
  createdAt: Date;
  updatedAt: Date;
}

const contractorSchema = new Schema<IContractor>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    specialty: { type: String, required: true },
    externalId: { type: String, index: true },
    stripeAccountId: { type: String },
    isOnline: { type: Boolean, default: false },
    lastSeenAt: { type: Date },
    lastLat: { type: Number },
    lastLng: { type: Number },
    isBlocked: { type: Boolean, default: false },
    blockedReason: { type: String },
    avgRating: { type: Number },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

contractorSchema.index({ buildingId: 1, isOnline: 1 });
contractorSchema.index({ buildingId: 1, specialty: 1, isOnline: 1 });
contractorSchema.index({ buildingId: 1, isBlocked: 1 });
contractorSchema.plugin(multiTenancyPlugin);

export const Contractor = mongoose.model<IContractor>('Contractor', contractorSchema);
export default Contractor;
