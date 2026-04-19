/**
 * Tests for errors.ts — custom AppError hierarchy.
 */
import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ServiceUnavailableError,
  isAppError,
} from './errors.js';

describe('AppError hierarchy', () => {
  it('ValidationError has status 400 and code VALIDATION_ERROR', () => {
    const err = new ValidationError('buildingId is required');
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.message).toBe('buildingId is required');
    expect(err.isOperational).toBe(true);
    expect(err instanceof AppError).toBe(true);
    expect(err instanceof Error).toBe(true);
  });

  it('ValidationError supports field-level errors', () => {
    const err = new ValidationError('Validation failed', { floor: 'must be a number', buildingId: 'required' });
    expect(err.fields).toEqual({ floor: 'must be a number', buildingId: 'required' });
  });

  it('UnauthorizedError has status 401', () => {
    const err = new UnauthorizedError();
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('UNAUTHORIZED');
  });

  it('ForbiddenError has status 403', () => {
    const err = new ForbiddenError();
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('FORBIDDEN');
  });

  it('NotFoundError has status 404', () => {
    const err = new NotFoundError('Ticket not found');
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Ticket not found');
  });

  it('ConflictError has status 409', () => {
    const err = new ConflictError('Email already in use');
    expect(err.statusCode).toBe(409);
  });

  it('RateLimitError has status 429', () => {
    const err = new RateLimitError();
    expect(err.statusCode).toBe(429);
  });

  it('ServiceUnavailableError has status 503', () => {
    const err = new ServiceUnavailableError();
    expect(err.statusCode).toBe(503);
  });
});

describe('isAppError', () => {
  it('returns true for AppError instances', () => {
    expect(isAppError(new ValidationError('test'))).toBe(true);
    expect(isAppError(new NotFoundError())).toBe(true);
    expect(isAppError(new ForbiddenError())).toBe(true);
  });

  it('returns false for plain Error', () => {
    expect(isAppError(new Error('plain'))).toBe(false);
  });

  it('returns false for non-error values', () => {
    expect(isAppError('string error')).toBe(false);
    expect(isAppError(null)).toBe(false);
    expect(isAppError(undefined)).toBe(false);
    expect(isAppError(42)).toBe(false);
  });
});
