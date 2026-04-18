/**
 * AI Audit Trail – persists every AI decision for compliance, review, and learning.
 * Covers: triage decisions, validation blocks, action executions, OpenAI calls, guardrail triggers.
 */
import mongoose, { Schema, Document } from 'mongoose';

export interface IAiAuditLog extends Document {
  /** Which AI service produced this entry */
  service: 'validation' | 'triage' | 'action' | 'insights' | 'pipeline' | 'predictive' | 'guardrail';
  /** What happened */
  event: string;
  /** Who triggered it (userId or 'system' for cron) */
  actor: string;
  /** Building context */
  buildingId: string;
  /** Severity for filtering */
  severity: 'info' | 'warn' | 'block' | 'error';
  /** Structured payload – flexible per service */
  details: Record<string, unknown>;
  /** Was this decision overridden by a human later? */
  humanOverride?: {
    overriddenBy: string;
    overriddenAt: Date;
    reason: string;
    originalDecision: Record<string, unknown>;
  };
  /** Cost tracking for OpenAI calls */
  cost?: {
    tokensUsed: number;
    estimatedUSD: number;
    model: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const aiAuditLogSchema = new Schema<IAiAuditLog>(
  {
    service: {
      type: String,
      required: true,
      enum: ['validation', 'triage', 'action', 'insights', 'pipeline', 'predictive', 'guardrail'],
      index: true,
    },
    event: { type: String, required: true },
    actor: { type: String, required: true, index: true },
    buildingId: { type: String, required: true, index: true },
    severity: { type: String, required: true, enum: ['info', 'warn', 'block', 'error'] },
    details: { type: Schema.Types.Mixed, default: {} },
    humanOverride: {
      overriddenBy: String,
      overriddenAt: Date,
      reason: String,
      originalDecision: Schema.Types.Mixed,
    },
    cost: {
      tokensUsed: Number,
      estimatedUSD: Number,
      model: String,
    },
  },
  {
    timestamps: true,
    collection: 'ai_audit_logs',
  }
);

// Compound index for common queries
aiAuditLogSchema.index({ buildingId: 1, service: 1, createdAt: -1 });
aiAuditLogSchema.index({ severity: 1, createdAt: -1 });
// TTL: auto-delete after 1 year (configurable via env)
aiAuditLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: parseInt(process.env.AI_AUDIT_TTL_SECONDS ?? '31536000', 10) }
);

const AiAuditLog = mongoose.model<IAiAuditLog>('AiAuditLog', aiAuditLogSchema);
export default AiAuditLog;

// ─── Helper to log without blocking the request ─────────────────

export function logAiDecision(entry: Omit<IAiAuditLog, keyof Document | 'createdAt' | 'updatedAt'>): void {
  // Fire-and-forget: don't await, don't block the response
  AiAuditLog.create(entry).catch((err) => {
    // Last-resort fallback: console log if DB write fails
    console.error('[AI Audit] Failed to persist audit log:', err.message, entry);
  });
}
