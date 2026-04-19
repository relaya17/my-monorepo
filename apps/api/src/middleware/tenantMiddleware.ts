import type { NextFunction, Request, Response } from 'express';
import { AsyncLocalStorage } from 'async_hooks';
import { verifyAccessToken } from '../utils/jwt.js';
import { logger } from '../utils/logger.js';
import { logActivity } from '../utils/auditLog.js';

export type TenantStore = {
  buildingId: string;
};

export const tenantContext = new AsyncLocalStorage<TenantStore>();

/**
 * Multi-tenant context middleware (Zero-Trust Isolation).
 * - Reads buildingId from `x-building-id` header
 * - Optionally verifies JWT and sets req.auth; validates header matches token (prevents Tenant Hopping)
 * - Logs UNAUTHORIZED_ACCESS_ATTEMPT to AuditLog for super-admin visibility
 */
export async function tenantMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (req.path.startsWith('/webhooks/stripe')) return next();

  const headerValue = req.header('x-building-id');
  const buildingId = (headerValue ?? 'default').trim() || 'default';

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (token) {
    try {
      (req as Request & { auth?: { sub: string; type: string; buildingId: string } }).auth = verifyAccessToken(token);
    } catch {
      // Invalid or expired token – don't set req.auth; route-level auth will return 401
    }
  }

  const auth = (req as Request & { auth?: { sub: string; buildingId: string } }).auth;
  if (auth && buildingId && auth.buildingId !== buildingId && buildingId !== 'default') {
    await logActivity(req, 'UNAUTHORIZED_ACCESS_ATTEMPT', 'SECURITY', {
      attemptedBuildingId: buildingId,
      userActualBuildingId: auth.buildingId,
    });
    logger.error('Tenant mismatch', { userId: auth.sub, requestedBuildingId: buildingId });
    res.status(403).json({ error: 'Security Violation: Tenant Mismatch' });
    return;
  }

  tenantContext.run({ buildingId }, () => next());
}

