/**
 * Ad model — CPC/CPA marketplace ads for service providers.
 * Ads target buildings by specialty or are displayed building-wide.
 */
import mongoose, { Document, Schema } from 'mongoose';
import { multiTenancyPlugin } from '../utils/multiTenancy.js';

export interface IAd extends Document {
  title: string;
  subtitle?: string;
  supplierName: string;
  supplierPhone?: string;
  specialty: string;      // e.g. "electrician", "plumber", "cleaning"
  discount?: string;      // e.g. "10% הנחה לדיירי הבניין"
  isEmergency: boolean;
  isActive: boolean;
  cpcBidAgorot: number;   // bid per click in Israeli agorot
  cpaBidAgorot: number;   // bid per lead/action in Israeli agorot
  clicks: number;
  leads: number;
  totalCpcChargeAgorot: number;
  totalCpaChargeAgorot: number;
  budgetCapAgorot: number; // daily budget cap
  buildingId: string;
  createdAt: Date;
  updatedAt: Date;
}

const adSchema = new Schema<IAd>(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    subtitle: { type: String, trim: true, maxlength: 200 },
    supplierName: { type: String, required: true, trim: true },
    supplierPhone: { type: String, trim: true },
    specialty: { type: String, required: true, trim: true },
    discount: { type: String, trim: true, maxlength: 100 },
    isEmergency: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    cpcBidAgorot: { type: Number, default: 50, min: 0 },   // default 50 agorot = 0.50 NIS
    cpaBidAgorot: { type: Number, default: 500, min: 0 },  // default 5 NIS
    clicks: { type: Number, default: 0, min: 0 },
    leads: { type: Number, default: 0, min: 0 },
    totalCpcChargeAgorot: { type: Number, default: 0 },
    totalCpaChargeAgorot: { type: Number, default: 0 },
    budgetCapAgorot: { type: Number, default: 10000, min: 0 }, // default 100 NIS
  },
  { timestamps: true }
);

adSchema.index({ buildingId: 1, isActive: 1, specialty: 1 });
adSchema.plugin(multiTenancyPlugin);

export const Ad = mongoose.model<IAd>('Ad', adSchema);
export default Ad;
