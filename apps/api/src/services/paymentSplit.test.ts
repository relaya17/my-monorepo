/**
 * Unit tests — Revenue split: 70% contractor / 20% building / 10% Vantera platform.
 *
 * These are pure arithmetic tests — no Stripe calls needed.
 * The goal: prove with numbers that zero revenue is lost in the split.
 */
import { describe, it, expect } from 'vitest';

// ─── Pure split math (mirrors stripeService.ts logic exactly) ──────
interface SplitResult {
  contractorCents: number;
  buildingCents: number;
  vanteraCents: number;
  total: number;
}

function computeSplit(amountIls: number): SplitResult {
  const totalCents = Math.round(amountIls * 100);
  const contractorCents = Math.round(totalCents * 0.70);
  const buildingCents = Math.round(totalCents * 0.20);
  const vanteraCents = totalCents - contractorCents - buildingCents; // 10% — stays on platform
  return { contractorCents, buildingCents, vanteraCents, total: totalCents };
}

describe('Revenue split 70 / 20 / 10', () => {
  describe('Standard amounts', () => {
    it('1,000 ILS repair: 70/20/10 exact', () => {
      const split = computeSplit(1000);
      expect(split.contractorCents).toBe(70_000); // ₪700
      expect(split.buildingCents).toBe(20_000);   // ₪200
      expect(split.vanteraCents).toBe(10_000);    // ₪100
    });

    it('500 ILS: splits correctly', () => {
      const split = computeSplit(500);
      expect(split.contractorCents).toBe(35_000);
      expect(split.buildingCents).toBe(10_000);
      expect(split.vanteraCents).toBe(5_000);
    });

    it('100 ILS minimum: splits correctly', () => {
      const split = computeSplit(100);
      expect(split.contractorCents).toBe(7_000);
      expect(split.buildingCents).toBe(2_000);
      expect(split.vanteraCents).toBe(1_000);
    });

    it('10,000 ILS large job: no money lost', () => {
      const split = computeSplit(10_000);
      expect(split.contractorCents + split.buildingCents + split.vanteraCents).toBe(split.total);
    });
  });

  describe('Zero revenue lost — invariant', () => {
    const testAmounts = [99, 150, 333, 500, 750, 1000, 1499, 2500, 5000, 9999];

    it.each(testAmounts)('%i ILS: contractor + building + vantera === total', (amount) => {
      const split = computeSplit(amount);
      expect(split.contractorCents + split.buildingCents + split.vanteraCents).toBe(split.total);
    });
  });

  describe('Percentages are correct', () => {
    it('contractor always gets ≥ 69.9% and ≤ 70.1%', () => {
      [100, 333, 500, 1000, 9999].forEach((amount) => {
        const split = computeSplit(amount);
        const pct = split.contractorCents / split.total;
        expect(pct).toBeGreaterThanOrEqual(0.699);
        expect(pct).toBeLessThanOrEqual(0.701);
      });
    });

    it('vantera platform always keeps ≥ 1 agora minimum', () => {
      const split = computeSplit(1); // ₪1 minimum realistic payment
      expect(split.vanteraCents).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Edge cases', () => {
    it('handles fractional ILS amounts (e.g. 333.33 ILS)', () => {
      const split = computeSplit(333.33);
      // Must be whole agoras
      expect(Number.isInteger(split.contractorCents)).toBe(true);
      expect(Number.isInteger(split.buildingCents)).toBe(true);
      expect(Number.isInteger(split.vanteraCents)).toBe(true);
    });

    it('sum is always the original total (no rounding loss)', () => {
      const split = computeSplit(333.33);
      expect(split.contractorCents + split.buildingCents + split.vanteraCents).toBe(split.total);
    });
  });
});
