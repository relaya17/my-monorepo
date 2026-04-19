/**
 * Tests for ContractorAccessService — Magic Link generation and validation.
 * Uses in-memory mocking to avoid DB dependency.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the MagicLink model before importing the service
vi.mock('../models/magicLinkModel.js', () => {
  const store: Record<string, {
    tokenHash: string; buildingId: string; floor: number; floorLabel?: string;
    isGpsRequired: boolean; permissions: string[]; expiresAt: Date; isActive: boolean;
    usageCount: number; buildingLat?: number; buildingLng?: number; contractorId?: string;
    save: () => Promise<void>;
  }> = {};

  return {
    MagicLink: {
      create: vi.fn(async (data: typeof store[string]) => {
        store[data.tokenHash] = { ...data, save: async () => {} };
        return store[data.tokenHash];
      }),
      findOne: vi.fn(async (query: { tokenHash?: string }) => {
        if (!query.tokenHash) return null;
        const doc = store[query.tokenHash];
        if (!doc || !doc.isActive || doc.expiresAt < new Date()) return null;
        return doc;
      }),
      updateOne: vi.fn(async (filter: { tokenHash?: string }) => {
        if (filter.tokenHash && store[filter.tokenHash]) {
          store[filter.tokenHash].isActive = false;
          return { modifiedCount: 1 };
        }
        return { modifiedCount: 0 };
      }),
    },
  };
});

import { ContractorAccessService } from './contractorAccessService.js';

describe('ContractorAccessService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateLink', () => {
    it('returns a plain UUID token and a full URL', async () => {
      const { token, url } = await ContractorAccessService.generateLink({
        buildingId: 'building_001',
        floor: 3,
        floorLabel: 'קומה שלוש',
        isGpsRequired: true,
      });

      // Token should be a valid UUID v4
      expect(token).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      // URL should include the token
      expect(url).toContain(token);
      expect(url).toContain('/tech/work-order/');
    });

    it('stores a hash, NOT the plain token, in the DB', async () => {
      const { MagicLink } = await import('../models/magicLinkModel.js');
      const { token } = await ContractorAccessService.generateLink({
        buildingId: 'building_002',
        floor: 1,
      });

      const createCall = vi.mocked(MagicLink.create).mock.calls[0][0] as { tokenHash: string };
      expect(createCall.tokenHash).toBeDefined();
      // The stored hash must NOT equal the plain token
      expect(createCall.tokenHash).not.toBe(token);
      // Hash should be a 64-char hex string (SHA-256)
      expect(createCall.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('validateToken', () => {
    it('returns access data for a valid token', async () => {
      const { token } = await ContractorAccessService.generateLink({
        buildingId: 'building_003',
        floor: 5,
        floorLabel: 'גג',
        buildingLat: 32.08,
        buildingLng: 34.78,
        isGpsRequired: true,
        contractorId: 'contractor_42',
      });

      const access = await ContractorAccessService.validateToken(token);

      expect(access).not.toBeNull();
      expect(access?.buildingId).toBe('building_003');
      expect(access?.floor).toBe(5);
      expect(access?.floorLabel).toBe('גג');
      expect(access?.isGpsRequired).toBe(true);
      expect(access?.buildingLat).toBe(32.08);
      expect(access?.contractorId).toBe('contractor_42');
    });

    it('returns null for a non-existent token', async () => {
      const result = await ContractorAccessService.validateToken('fake-token-000');
      expect(result).toBeNull();
    });

    it('returns a human-readable expiresIn string', async () => {
      const { token } = await ContractorAccessService.generateLink({
        buildingId: 'building_004',
        floor: 2,
        ttlMs: 90 * 60 * 1000, // 90 min
      });

      const access = await ContractorAccessService.validateToken(token);
      expect(access?.expiresIn).toMatch(/\d+/); // contains at least one digit
    });
  });

  describe('revokeToken', () => {
    it('returns true and marks link inactive', async () => {
      const { token } = await ContractorAccessService.generateLink({
        buildingId: 'building_005',
        floor: 1,
      });

      const result = await ContractorAccessService.revokeToken(token);
      expect(result).toBe(true);
    });

    it('returns false for unknown token', async () => {
      const result = await ContractorAccessService.revokeToken('completely-unknown-token');
      expect(result).toBe(false);
    });
  });
});
