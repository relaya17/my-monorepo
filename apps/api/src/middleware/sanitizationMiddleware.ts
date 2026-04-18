/**
 * Sanitization layer – NoSQL injection prevention (Enterprise).
 * Recursively removes keys starting with $ or containing . (Mongo operators).
 */
import type { Request, Response, NextFunction } from 'express';

const MAX_DEPTH = 20;

function sanitize(obj: unknown, depth = 0): unknown {
  if (depth > MAX_DEPTH) return obj;
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      obj[i] = sanitize(obj[i], depth + 1) as (typeof obj)[0];
    }
    return obj;
  }

  const o = obj as Record<string, unknown>;
  Object.keys(o).forEach((key) => {
    if (key.startsWith('$') || key.includes('.') || key === '__proto__') {
      delete o[key];
    } else {
      o[key] = sanitize(o[key], depth + 1) as unknown;
    }
  });
  return obj;
}

export function sanitizationMiddleware(req: Request, _res: Response, next: NextFunction): void {
  if (req.body) req.body = sanitize(req.body, 0) as Request['body'];
  if (req.query) req.query = sanitize(req.query, 0) as Request['query'];
  if (req.params) req.params = sanitize(req.params, 0) as Request['params'];
  next();
}
