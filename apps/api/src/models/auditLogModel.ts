/**
 * Audit log for security and activity stream (super-admin). Not tenant-scoped.
 */
import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  action: string;
  category: string;
  level?: string;
  metadata: Record<string, unknown>;
  timestamp: Date;
  buildingId?: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
}

const auditLogSchema = new Schema<IAuditLog>({
  action: { type: String, required: true, index: true },
  category: { type: String, required: true, index: true },
  level: { type: String },
  metadata: { type: Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: Date.now, index: true },
  buildingId: { type: String, index: true },
  userId: { type: String, index: true },
  ip: { type: String },
  userAgent: { type: String },
});

auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ category: 1, timestamp: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
export default AuditLog;
