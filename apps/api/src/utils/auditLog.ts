/**
 * Helper to write audit entries (e.g. unauthorized access attempts).
 * logActivityServer: for server-side events (no request); buildingId in metadata.
 */
import type { Request } from 'express';
import { AuditLog } from '../models/auditLogModel.js';
import { logger } from './logger.js';

export async function logActivity(
  req: Request | null,
  action: string,
  category: string,
  metadata: Record<string, unknown> = {},
  level?: string
): Promise<void> {
  try {
    if (req) {
      const auth = (req as Request & { auth?: { sub: string; buildingId?: string } }).auth;
      await AuditLog.create({
        action,
        category,
        level: level ?? (category === 'SECURITY' ? 'high' : undefined),
        metadata,
        timestamp: new Date(),
        buildingId: (req.headers['x-building-id'] as string) || undefined,
        userId: auth?.sub,
        ip: req.ip ?? (req as Request & { socket?: { remoteAddress?: string } }).socket?.remoteAddress,
        userAgent: req.headers['user-agent'],
      });
    } else {
      await AuditLog.create({
        action,
        category,
        level: level ?? undefined,
        metadata,
        timestamp: new Date(),
        buildingId: (metadata.buildingId as string) || undefined,
      });
    }
  } catch (err) {
    logger.error('Audit log write failed', { error: (err as Error).message });
  }
}

/** Server-side only (e.g. inventory consumption). Pass buildingId in metadata. */
export async function logActivityServer(
  action: string,
  category: string,
  metadata: Record<string, unknown> = {},
  level?: string
): Promise<void> {
  return logActivity(null, action, category, metadata, level);
}
