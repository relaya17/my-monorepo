/**
 * Enterprise rate limiting: global, auth, and tenant-level (building).
 */
import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger.js';

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'יותר מדי בקשות, אנא נסה שוב מאוחר יותר' },
  handler: (req, res, _next, options) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(options.statusCode).send(options.message);
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'יותר מדי ניסיונות התחברות. החשבון ננעל זמנית להגנה.' },
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

export const tenantLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 500,
  keyGenerator: (req) => (req.headers['x-building-id'] as string) || req.ip || 'default',
  message: { error: 'עומס חריג בבניין זה. המערכת מגבילה בקשות זמנית.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/** AI-specific rate limiter – tighter limits for expensive AI operations */
export const aiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  keyGenerator: (req) => {
    const auth = (req as { auth?: { sub?: string } }).auth;
    return auth?.sub || req.ip || 'anonymous';
  },
  message: { error: 'AI rate limit exceeded. Please wait before making more AI requests.' },
  handler: (req, res, _next, options) => {
    logger.warn(`AI rate limit exceeded`, { user: (req as { auth?: { sub?: string } }).auth?.sub, ip: req.ip });
    res.status(options.statusCode).send(options.message);
  },
  standardHeaders: true,
  legacyHeaders: false,
});
