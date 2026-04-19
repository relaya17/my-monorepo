/**
 * Tests for floorAttentionService — 4-tier security level computation.
 * Pure functions — no mocking needed.
 */
import { describe, it, expect } from 'vitest';
import { computeSecurityLevel } from './floorAttentionService.js';
import { SecurityLevel, DetectedObjectClass } from '../models/visionLogModel.js';

const baseInput = {
  eventType: 'MOTION_DETECTED' as const,
  detectedObjects: [],
  hourUtc: 14, // 14:00 UTC = 17:00 IL → normal hours
};

const unknownPerson = {
  objectClass: DetectedObjectClass.PERSON_UNKNOWN,
  confidence: 0.85,
  boundingBox: [0, 0, 50, 100] as [number, number, number, number],
};

const child = {
  objectClass: DetectedObjectClass.PERSON_CHILD,
  confidence: 0.75,
  boundingBox: [0, 0, 40, 80] as [number, number, number, number],
};

const sensitiveFloor = {
  floorNumber: 3,
  floorLabel: 'קומה שלוש',
  isSensitive: true,
  cameraId: 'cam_3',
};

describe('computeSecurityLevel', () => {
  describe('CRITICAL tier', () => {
    it('returns CRITICAL for UNAUTHORIZED_ENTRY event', () => {
      const result = computeSecurityLevel({ ...baseInput, eventType: 'UNAUTHORIZED_ENTRY' });
      expect(result.securityLevel).toBe(SecurityLevel.CRITICAL);
      expect(result.reason).toBeTruthy();
    });

    it('returns CRITICAL for unknown person on sensitive floor', () => {
      const result = computeSecurityLevel({
        ...baseInput,
        detectedObjects: [unknownPerson],
        floorContext: sensitiveFloor,
      });
      expect(result.securityLevel).toBe(SecurityLevel.CRITICAL);
    });
  });

  describe('HIGH tier', () => {
    it('returns HIGH for LOITERING event', () => {
      const result = computeSecurityLevel({ ...baseInput, eventType: 'LOITERING' });
      expect(result.securityLevel).toBe(SecurityLevel.HIGH);
    });

    it('returns HIGH for unknown person after hours (23:00 UTC = ~02:00 IL)', () => {
      const result = computeSecurityLevel({
        ...baseInput,
        detectedObjects: [unknownPerson],
        hourUtc: 23,
      });
      expect(result.securityLevel).toBe(SecurityLevel.HIGH);
    });

    it('returns HIGH for FLOOD_DETECTION', () => {
      const result = computeSecurityLevel({ ...baseInput, eventType: 'FLOOD_DETECTION' });
      expect(result.securityLevel).toBe(SecurityLevel.HIGH);
    });
  });

  describe('MEDIUM tier', () => {
    it('returns MEDIUM for unknown person during normal hours (non-sensitive floor)', () => {
      const result = computeSecurityLevel({
        ...baseInput,
        detectedObjects: [unknownPerson],
        hourUtc: 10, // 10:00 UTC = 13:00 IL → normal hours
      });
      expect(result.securityLevel).toBe(SecurityLevel.MEDIUM);
    });

    it('returns MEDIUM for child on sensitive floor during arrival window (09:00 UTC = 12:00 IL)', () => {
      const result = computeSecurityLevel({
        ...baseInput,
        detectedObjects: [child],
        floorContext: sensitiveFloor,
        hourUtc: 9, // 09:00 UTC = 12:00 IL → child arrival window starts
        eventType: 'CHILD_ARRIVAL',
      });
      expect(result.securityLevel).toBe(SecurityLevel.MEDIUM);
    });
  });

  describe('LOW tier', () => {
    it('returns LOW for motion with no detected objects', () => {
      const result = computeSecurityLevel({ ...baseInput });
      expect(result.securityLevel).toBe(SecurityLevel.LOW);
    });

    it('returns LOW for PACKAGE_DELIVERY', () => {
      const result = computeSecurityLevel({ ...baseInput, eventType: 'PACKAGE_DELIVERY' });
      expect(result.securityLevel).toBe(SecurityLevel.LOW);
    });
  });

  describe('Result shape', () => {
    it('always returns securityLevel and reason', () => {
      const result = computeSecurityLevel(baseInput);
      expect(result).toHaveProperty('securityLevel');
      expect(result).toHaveProperty('reason');
      expect(Object.values(SecurityLevel)).toContain(result.securityLevel);
    });
  });
});

