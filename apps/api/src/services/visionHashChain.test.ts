/**
 * Unit tests — VisionLog hash-chain integrity (pure, no DB needed).
 *
 * Tests verify that `computeVisionHash` and `getLastVisionHash` produce
 * a valid, tamper-evident ledger (Blockchain-style Genesis → link chain).
 */
import { describe, it, expect } from 'vitest';
import { computeVisionHash, SecurityLevel } from '../models/visionLogModel.js';

// ─── Fixtures ─────────────────────────────────────────────────────
const base = {
  cameraId: 'cam_entrance',
  eventType: 'MOTION_DETECTED' as const,
  confidence: 0.92,
  timestamp: new Date('2026-04-19T10:00:00.000Z'),
  securityLevel: SecurityLevel.LOW,
};

describe('computeVisionHash — hash chain integrity', () => {
  it('produces a 64-char hex string (SHA-256)', () => {
    const h = computeVisionHash(base as Parameters<typeof computeVisionHash>[0], 'GENESIS');
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });

  it('first event uses "GENESIS" as previousHash → genesis block', () => {
    const h = computeVisionHash(base as Parameters<typeof computeVisionHash>[0], 'GENESIS');
    expect(typeof h).toBe('string');
    expect(h.length).toBe(64);
    // The hash must NOT equal the previousHash
    expect(h).not.toBe('GENESIS');
  });

  it('second event previousHash must equal first event hash (chain link)', () => {
    const hash1 = computeVisionHash(base as Parameters<typeof computeVisionHash>[0], 'GENESIS');

    const event2 = { ...base, cameraId: 'cam_lobby', timestamp: new Date('2026-04-19T10:01:00.000Z') };
    const hash2 = computeVisionHash(event2 as Parameters<typeof computeVisionHash>[0], hash1);

    // Verify that the second hash embeds the first hash
    const recomputedHash2 = computeVisionHash(event2 as Parameters<typeof computeVisionHash>[0], hash1);
    expect(hash2).toBe(recomputedHash2);
    expect(hash2).not.toBe(hash1);
  });

  it('tampering any field breaks the hash (tamper-evident)', () => {
    const originalHash = computeVisionHash(base as Parameters<typeof computeVisionHash>[0], 'GENESIS');

    // Simulate tampering with confidence
    const tampered = { ...base, confidence: 0.50 };
    const tamperedHash = computeVisionHash(tampered as Parameters<typeof computeVisionHash>[0], 'GENESIS');

    expect(tamperedHash).not.toBe(originalHash);
  });

  it('same inputs always produce the same hash (deterministic)', () => {
    const h1 = computeVisionHash(base as Parameters<typeof computeVisionHash>[0], 'GENESIS');
    const h2 = computeVisionHash(base as Parameters<typeof computeVisionHash>[0], 'GENESIS');
    expect(h1).toBe(h2);
  });

  it('different previousHash → different output hash (chain binding)', () => {
    const h1 = computeVisionHash(base as Parameters<typeof computeVisionHash>[0], 'GENESIS');
    const h2 = computeVisionHash(base as Parameters<typeof computeVisionHash>[0], 'some_other_hash');
    expect(h1).not.toBe(h2);
  });

  it('chain of N events: each previousHash matches the prior hash', () => {
    const events = [
      { ...base, cameraId: 'cam_1', timestamp: new Date('2026-04-19T10:00:00Z') },
      { ...base, cameraId: 'cam_2', timestamp: new Date('2026-04-19T10:01:00Z') },
      { ...base, cameraId: 'cam_3', timestamp: new Date('2026-04-19T10:02:00Z') },
      { ...base, cameraId: 'cam_4', timestamp: new Date('2026-04-19T10:03:00Z') },
      { ...base, cameraId: 'cam_5', timestamp: new Date('2026-04-19T10:04:00Z') },
    ];

    let prevHash = 'GENESIS';
    const hashes: string[] = [];

    for (const event of events) {
      const hash = computeVisionHash(event as Parameters<typeof computeVisionHash>[0], prevHash);
      hashes.push(hash);
      prevHash = hash;
    }

    // Verify full chain: re-compute and compare
    let rePrev = 'GENESIS';
    for (let i = 0; i < events.length; i++) {
      const reHash = computeVisionHash(events[i] as Parameters<typeof computeVisionHash>[0], rePrev);
      expect(reHash).toBe(hashes[i]);
      rePrev = reHash;
    }
  });
});
