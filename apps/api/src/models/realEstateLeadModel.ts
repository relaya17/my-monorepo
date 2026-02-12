/**
 * Real Estate Leads – Revenue Share Ecosystem
 * דייר רוצה למכור/להשכיר → V-One מזהה → ליד בלעדי לחברת האחזקה
 * מודל: $10 (US) / 10₪ (IL) per lead – Stripe Metered Billing
 */
import mongoose, { Document, Schema } from 'mongoose';
import { multiTenancyPlugin } from '../utils/multiTenancy.js';

export type DealType = 'sale' | 'rent';
export type LeadStatus = 'new' | 'in_progress' | 'closed';

export interface IRealEstateLead extends Document {
  residentId: mongoose.Types.ObjectId;
  apartmentNumber: string;
  residentName: string;
  residentEmail: string;
  residentPhone?: string;
  dealType: DealType;
  status: LeadStatus;
  source: 'vone_ai';
  rawMessage?: string;
  notifiedAt?: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const realEstateLeadSchema = new Schema<IRealEstateLead>(
  {
    residentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    apartmentNumber: { type: String, required: true, default: '' },
    residentName: { type: String, required: true },
    residentEmail: { type: String, required: true },
    residentPhone: { type: String },
    dealType: { type: String, enum: ['sale', 'rent'], required: true },
    status: { type: String, enum: ['new', 'in_progress', 'closed'], default: 'new' },
    source: { type: String, enum: ['vone_ai'], default: 'vone_ai' },
    rawMessage: { type: String },
    notifiedAt: { type: Date },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

realEstateLeadSchema.index({ buildingId: 1, status: 1 });
realEstateLeadSchema.index({ buildingId: 1, createdAt: -1 });
realEstateLeadSchema.plugin(multiTenancyPlugin);

export const RealEstateLead = mongoose.model<IRealEstateLead>('RealEstateLead', realEstateLeadSchema);
export default RealEstateLead;
