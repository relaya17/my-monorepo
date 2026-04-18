/**
 * Unit tests for tenant middleware – multi-tenancy isolation.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';

// Mock dependencies before importing the module
vi.mock('../utils/jwt.js', () => ({
  verifyAccessToken: vi.fn(),
}));
vi.mock('../utils/logger.js', () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));
vi.mock('../utils/auditLog.js', () => ({
  logActivity: vi.fn(),
}));

import { tenantMiddleware, tenantContext } from './tenantMiddleware.js';
import { verifyAccessToken } from '../utils/jwt.js';

function mockReq(headers: Record<string, string> = {}) {
  return {
    path: '/some-route',
    header: (name: string) => headers[name.toLowerCase()],
    headers: {
      ...headers,
      authorization: headers.authorization,
    },
  } as unknown as Request;
}

function mockRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

describe('tenantMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('defaults buildingId to "default" when header is missing', async () => {
    const req = mockReq();
    const res = mockRes();
    let capturedBuildingId = '';
    const next: NextFunction = () => {
      const store = tenantContext.getStore();
      capturedBuildingId = store?.buildingId ?? '';
    };

    await tenantMiddleware(req, res, next);
    expect(capturedBuildingId).toBe('default');
  });

  it('reads buildingId from x-building-id header', async () => {
    const req = mockReq({ 'x-building-id': 'building-123' });
    const res = mockRes();
    let capturedBuildingId = '';
    const next: NextFunction = () => {
      const store = tenantContext.getStore();
      capturedBuildingId = store?.buildingId ?? '';
    };

    await tenantMiddleware(req, res, next);
    expect(capturedBuildingId).toBe('building-123');
  });

  it('skips tenant check for Stripe webhook routes', async () => {
    const req = mockReq();
    (req as unknown as { path: string }).path = '/webhooks/stripe';
    const res = mockRes();
    const next = vi.fn();

    await tenantMiddleware(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('returns 403 on tenant mismatch (hopping attempt)', async () => {
    const mockToken = { sub: 'user-1', type: 'access', buildingId: 'building-A' };
    vi.mocked(verifyAccessToken).mockReturnValue(mockToken as ReturnType<typeof verifyAccessToken>);

    const req = mockReq({
      'x-building-id': 'building-B',
      authorization: 'Bearer fake-token',
    });
    const res = mockRes();
    const next = vi.fn();

    await tenantMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('Tenant Mismatch') })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('allows request when token buildingId matches header', async () => {
    const mockToken = { sub: 'user-1', type: 'access', buildingId: 'building-A' };
    vi.mocked(verifyAccessToken).mockReturnValue(mockToken as ReturnType<typeof verifyAccessToken>);

    const req = mockReq({
      'x-building-id': 'building-A',
      authorization: 'Bearer valid-token',
    });
    const res = mockRes();
    let capturedBuildingId = '';
    const next: NextFunction = () => {
      const store = tenantContext.getStore();
      capturedBuildingId = store?.buildingId ?? '';
    };

    await tenantMiddleware(req, res, next);
    expect(capturedBuildingId).toBe('building-A');
  });

  it('allows request when header is "default" even if token has different buildingId', async () => {
    const mockToken = { sub: 'user-1', type: 'access', buildingId: 'building-X' };
    vi.mocked(verifyAccessToken).mockReturnValue(mockToken as ReturnType<typeof verifyAccessToken>);

    const req = mockReq({
      'x-building-id': 'default',
      authorization: 'Bearer valid-token',
    });
    const res = mockRes();
    const next = vi.fn();

    await tenantMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('trims whitespace from buildingId header', async () => {
    const req = mockReq({ 'x-building-id': '  building-99  ' });
    const res = mockRes();
    let capturedBuildingId = '';
    const next: NextFunction = () => {
      const store = tenantContext.getStore();
      capturedBuildingId = store?.buildingId ?? '';
    };

    await tenantMiddleware(req, res, next);
    expect(capturedBuildingId).toBe('building-99');
  });
});
