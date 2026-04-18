/**
 * Unit tests for sanitization middleware – NoSQL injection prevention.
 */
import { describe, it, expect, vi } from 'vitest';
import { sanitizationMiddleware } from './sanitizationMiddleware.js';
import type { Request, Response, NextFunction } from 'express';

function mockReq(body?: unknown, query?: unknown, params?: unknown) {
  return { body, query: query ?? {}, params: params ?? {} } as unknown as Request;
}

const res = {} as Response;
const next: NextFunction = vi.fn();

describe('sanitizationMiddleware', () => {
  it('strips keys starting with $ from body', () => {
    const req = mockReq({ name: 'Alice', $gt: 100 });
    sanitizationMiddleware(req, res, next);
    expect(req.body).toEqual({ name: 'Alice' });
    expect(next).toHaveBeenCalled();
  });

  it('strips keys containing . from body', () => {
    const req = mockReq({ 'field.injection': 'bad', safe: 'ok' });
    sanitizationMiddleware(req, res, next);
    expect(req.body).toEqual({ safe: 'ok' });
  });

  it('strips __proto__ key (prototype pollution)', () => {
    // Simulate JSON.parse output where __proto__ is a regular own-property key
    const body = JSON.parse('{"__proto__":{"admin":true},"name":"Bob"}');
    const req = mockReq(body);
    sanitizationMiddleware(req, res, next);
    expect(Object.prototype.hasOwnProperty.call(req.body, '__proto__')).toBe(false);
    expect(req.body.name).toBe('Bob');
  });

  it('sanitizes nested objects recursively', () => {
    const req = mockReq({ user: { $ne: null, name: 'Eve' } });
    sanitizationMiddleware(req, res, next);
    expect(req.body).toEqual({ user: { name: 'Eve' } });
  });

  it('sanitizes arrays', () => {
    const req = mockReq([{ $gt: 5, val: 1 }, { val: 2 }]);
    sanitizationMiddleware(req, res, next);
    expect(req.body).toEqual([{ val: 1 }, { val: 2 }]);
  });

  it('sanitizes query params', () => {
    const req = mockReq(undefined, { search: 'ok', '$where': 'bad' });
    sanitizationMiddleware(req, res, next);
    expect(req.query).toEqual({ search: 'ok' });
  });

  it('passes through clean data unchanged', () => {
    const req = mockReq({ name: 'Test', age: 30, tags: ['a', 'b'] });
    sanitizationMiddleware(req, res, next);
    expect(req.body).toEqual({ name: 'Test', age: 30, tags: ['a', 'b'] });
  });

  it('handles null/undefined body gracefully', () => {
    const req = mockReq(null);
    sanitizationMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
