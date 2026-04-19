/**
 * AppError hierarchy — structured error classes for consistent API responses.
 *
 * Usage in routes:
 *   throw new ValidationError('buildingId is required');
 *   throw new NotFoundError('Maintenance ticket not found');
 *   throw new ForbiddenError('Access denied');
 *
 * The global error handler in index.ts catches AppError instances and
 * returns a structured JSON response with the correct HTTP status.
 */

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly isOperational: boolean;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/** 400 — Bad input, missing fields, invalid format */
export class ValidationError extends AppError {
  readonly fields?: Record<string, string>;

  constructor(message: string, fields?: Record<string, string>) {
    super(message, 400, 'VALIDATION_ERROR');
    this.fields = fields;
  }
}

/** 401 — Missing or invalid authentication */
export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/** 403 — Authenticated but not permitted */
export class ForbiddenError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, 'FORBIDDEN');
  }
}

/** 404 — Resource not found */
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

/** 409 — Conflict (duplicate, already exists) */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

/** 429 — Rate limit exceeded (can also be thrown programmatically) */
export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT');
  }
}

/** 503 — External service unavailable (DB, AI, Stripe) */
export class ServiceUnavailableError extends AppError {
  constructor(message = 'Service temporarily unavailable') {
    super(message, 503, 'SERVICE_UNAVAILABLE');
  }
}

/**
 * Type guard — check if an error is an operational AppError.
 * Useful in global error handler to distinguish app errors from unexpected crashes.
 */
export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}
