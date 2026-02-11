import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export function requestIdMiddleware(req: Request, _res: Response, next: NextFunction): void {
  req.id = crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}`;
  next();
}
