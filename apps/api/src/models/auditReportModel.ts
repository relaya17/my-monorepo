/**
 * Transparency & Audit: committee reports (financial, maintenance, annual). Multi-tenant.
 */
import mongoose, { Document, Schema } from 'mongoose';
import { multiTenancyPlugin } from '../utils/multiTenancy.js';

export interface IAuditReport extends Document {
  reportType: 'Financial' | 'Maintenance' | 'Annual';
  period: { start: Date; end: Date };
  summary?: string;
  totalIncome?: number;
  totalExpenses?: number;
  approvedByCommittee: boolean;
  files: string[];
  digitalSignature?: string;
  createdAt: Date;
  updatedAt: Date;
}

const auditReportSchema = new Schema<IAuditReport>(
  {
    reportType: { type: String, enum: ['Financial', 'Maintenance', 'Annual'], required: true },
    period: { start: { type: Date, required: true }, end: { type: Date, required: true } },
    summary: String,
    totalIncome: Number,
    totalExpenses: Number,
    approvedByCommittee: { type: Boolean, default: false },
    files: { type: [String], default: [] },
    digitalSignature: String,
  },
  { timestamps: true }
);

auditReportSchema.plugin(multiTenancyPlugin);
auditReportSchema.index({ buildingId: 1, reportType: 1, 'period.end': -1 });

export const AuditReport = mongoose.model<IAuditReport>('AuditReport', auditReportSchema);
export default AuditReport;
