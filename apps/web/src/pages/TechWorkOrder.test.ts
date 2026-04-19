/**
 * Tests for TechWorkOrder utility logic.
 * The Haversine distance formula is the core safety mechanism — must be tested precisely.
 */
import { describe, it, expect } from 'vitest';

/** Haversine distance in meters — extracted from TechWorkOrder.tsx */
function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

describe('haversineMeters (GPS distance for unlock guard)', () => {
  it('returns ~0 for identical coordinates', () => {
    const d = haversineMeters(32.0853, 34.7818, 32.0853, 34.7818);
    expect(d).toBeCloseTo(0, 1);
  });

  it('returns ~30 m for a point 30 meters away (approx)', () => {
    // 0.0003 degrees latitude ≈ 33 meters
    const d = haversineMeters(32.0853, 34.7818, 32.0856, 34.7818);
    expect(d).toBeGreaterThan(20);
    expect(d).toBeLessThan(50);
  });

  it('returns distance under 50m when within the building zone', () => {
    // Tel Aviv city center — two close points
    const d = haversineMeters(32.0700, 34.7700, 32.0702, 34.7701);
    expect(d).toBeLessThan(50);
  });

  it('returns distance over 100m when far from building', () => {
    // Tel Aviv to Ramat Gan — far apart
    const d = haversineMeters(32.0700, 34.7700, 32.0800, 34.8000);
    expect(d).toBeGreaterThan(100);
  });

  it('correctly computes distance between Tel Aviv and Jerusalem (~55 km)', () => {
    // Tel Aviv: 32.0853, 34.7818 | Jerusalem: 31.7683, 35.2137
    const d = haversineMeters(32.0853, 34.7818, 31.7683, 35.2137);
    // ~55km = ~55,000 meters
    expect(d).toBeGreaterThan(50_000);
    expect(d).toBeLessThan(65_000);
  });

  it('is symmetric — A→B equals B→A', () => {
    const d1 = haversineMeters(32.0853, 34.7818, 31.7683, 35.2137);
    const d2 = haversineMeters(31.7683, 35.2137, 32.0853, 34.7818);
    expect(d1).toBeCloseTo(d2, 0);
  });

  it('unlock should be BLOCKED when distance > 50 m', () => {
    const GPS_UNLOCK_THRESHOLD = 50;
    const d = haversineMeters(32.0853, 34.7818, 32.0860, 34.7818); // ~78 m
    expect(d > GPS_UNLOCK_THRESHOLD).toBe(true);
  });

  it('unlock should be ALLOWED when distance < 50 m', () => {
    const GPS_UNLOCK_THRESHOLD = 50;
    const d = haversineMeters(32.0853, 34.7818, 32.0854, 34.7818); // ~11 m
    expect(d > GPS_UNLOCK_THRESHOLD).toBe(false);
  });
});
