import type { NextFunction, Request, Response } from 'express';
import { AsyncLocalStorage } from 'async_hooks';

export type TenantStore = {
  buildingId: string;
};

export const tenantContext = new AsyncLocalStorage<TenantStore>();

/**
 * Multi-tenant context middleware.
 *
 * - Reads buildingId from `x-building-id` header
 * - Falls back to "default" for backward compatibility
 * - Skips Stripe webhook route (no tenant header expected)
 */
export function tenantMiddleware(req: Request, _res: Response, next: NextFunction) {
  // Stripe webhook is handled separately and should not require tenant context
  if (req.path.startsWith('/webhooks/stripe')) return next();

  const headerValue = req.header('x-building-id');
  const buildingId = (headerValue ?? 'default').trim() || 'default';

  tenantContext.run({ buildingId }, () => next());
}

