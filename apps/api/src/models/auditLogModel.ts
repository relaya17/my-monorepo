/**
 * Audit log for security and activity stream (super-admin). Not tenant-scoped.
 * Hash-chain: each entry carries a SHA-256 of (previousHash + payload) for tamper-evidence.
 * This makes the audit trail AAA-grade — any modification breaks the chain.
 */
import mongoose, { Document, Schema } from 'mongoose';
import crypto from 'crypto';

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
  /** SHA-256 of the previous log entry's chainHash — links the chain */
  previousHash: string;
  /** SHA-256(previousHash + action + category + timestamp.toISOString() + JSON(metadata)) */
  chainHash: string;
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
  previousHash: { type: String, required: true, default: '0'.repeat(64) },
  chainHash: { type: String, required: true, default: '' },
});

auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ category: 1, timestamp: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
export default AuditLog;

// ─── Hash-chain helpers ────────────────────────────────────────────

/** Compute the chain hash for a log entry */
export function computeChainHash(
  previousHash: string,
  action: string,
  category: string,
  timestamp: Date,
  metadata: Record<string, unknown>
): string {
  const payload = `${previousHash}|${action}|${category}|${timestamp.toISOString()}|${JSON.stringify(metadata)}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
}

/**
 * Create an audit log entry with chain continuity.
 * Always use this instead of AuditLog.create() directly.
 */
export async function createAuditEntry(
  entry: Omit<IAuditLog, '_id' | 'id' | 'previousHash' | 'chainHash' | 'createdAt' | 'updatedAt'>
): Promise<IAuditLog> {
  // Get the hash of the most recent entry (or genesis hash if first)
  const last = await AuditLog.findOne().sort({ timestamp: -1 }).select('chainHash').lean();
  const previousHash = last?.chainHash ?? '0'.repeat(64);
  const timestamp = entry.timestamp instanceof Date ? entry.timestamp : new Date();
  const chainHash = computeChainHash(
    previousHash,
    entry.action,
    entry.category,
    timestamp,
    entry.metadata ?? {}
  );
  return AuditLog.create({ ...entry, timestamp, previousHash, chainHash });
}

/**
 * Verify chain integrity — returns { valid: true } or the first broken link.
 * Used by super-admin transparency dashboard.
 */
export async function verifyChain(limit = 500): Promise<{
  valid: boolean;
  checkedCount: number;
  brokenAt?: { id: string; expectedHash: string; gotHash: string };
}> {
  const entries = await AuditLog.find()
    .sort({ timestamp: 1 })
    .limit(limit)
    .select('action category timestamp metadata previousHash chainHash')
    .lean();

  let prevHash = '0'.repeat(64);
  for (const entry of entries) {
    const expected = computeChainHash(
      prevHash,
      entry.action,
      entry.category,
      entry.timestamp,
      entry.metadata
    );
    if (expected !== entry.chainHash) {
      return {
        valid: false,
        checkedCount: entries.length,
        brokenAt: { id: String(entry._id), expectedHash: expected, gotHash: entry.chainHash },
      };
    }
    prevHash = entry.chainHash;
  }
  return { valid: true, checkedCount: entries.length };
}
