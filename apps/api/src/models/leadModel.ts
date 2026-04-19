/**
 * CRM Leads – Demo/Enterprise requests from landing page. No tenant.
 */
import mongoose, { Document, Schema } from 'mongoose';

export interface ILead extends Document {
  contactName: string;
  companyName: string;
  buildingCount: number;
  phone: string;
  source: 'landing_demo' | 'vendor_portal' | 'enterprise_register';
  notifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<ILead>(
  {
    contactName: { type: String, required: true },
    companyName: { type: String, required: true },
    buildingCount: { type: Number, required: true, min: 1 },
    phone: { type: String, required: true },
    source: { type: String, enum: ['landing_demo', 'vendor_portal', 'enterprise_register'], default: 'landing_demo' },
    notifiedAt: { type: Date },
  },
  { timestamps: true }
);

leadSchema.index({ createdAt: -1 });

export const Lead = mongoose.model<ILead>('Lead', leadSchema);
export default Lead;
