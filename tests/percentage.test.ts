import { describe, it, expect } from 'vitest';
import {
  calculatePercentage,
  calculatePercentageChange,
  calculatePercentageDifference,
  calculatePercentageOfTotal,
  calculatePercentageChangeAmount,
  PercentageError,
} from '../src/percentage/index.js';

describe('Percentage Module', () => {
  describe('calculatePercentage()', () => {
    it('calculates standard percentages', () => {
      expect(calculatePercentage(200, 10)).toBe(20);
      expect(calculatePercentage(200, 25)).toBe(50);
      expect(calculatePercentage(80, 12.5)).toBe(10);
    });

    it('handles zero values and zero percentages', () => {
      expect(calculatePercentage(0, 50)).toBe(0);
      expect(calculatePercentage(100, 0)).toBe(0);
      expect(calculatePercentage(0, 0)).toBe(0);
    });

    it('handles negative values and negative percentages', () => {
      expect(calculatePercentage(-200, 10)).toBe(-20);
      expect(calculatePercentage(200, -10)).toBe(-20);
      expect(calculatePercentage(-200, -10)).toBe(20);
    });

    it('handles percentages greater than 100', () => {
      expect(calculatePercentage(50, 250)).toBe(125);
    });

    it('supports rounding options', () => {
      expect(calculatePercentage(100, 33.3333, { precision: 2 })).toBe(33.33);
      expect(calculatePercentage(100, 33.3333, { precision: 0 })).toBe(33);
    });

    it('rejects non-finite inputs', () => {
      // @ts-expect-error Testing invalid runtime input
      expect(() => calculatePercentage(NaN, 10)).toThrow(PercentageError);
      // @ts-expect-error Testing invalid runtime input
      expect(() => calculatePercentage(100, Infinity)).toThrow(PercentageError);
      // @ts-expect-error Testing invalid runtime input
      expect(() => calculatePercentage('100', 10)).toThrow(PercentageError);
      expect(() => calculatePercentage(1e308, 100)).toThrow(/overflow/i);
    });
  });

  describe('calculatePercentageChange()', () => {
    it('calculates percentage increase', () => {
      expect(calculatePercentageChange(100, 150)).toBe(50);
      expect(calculatePercentageChange(80, 100)).toBe(25);
    });

    it('calculates percentage decrease', () => {
      expect(calculatePercentageChange(100, 75)).toBe(-25);
      expect(calculatePercentageChange(200, 100)).toBe(-50);
    });

    it('calculates zero change', () => {
      expect(calculatePercentageChange(100, 100)).toBe(0);
    });

    it('handles negative starting values and sign transitions', () => {
      // From -100 to -50 is an increase of 50 (-50 - (-100) = 50, / -100 = -50%)
      expect(calculatePercentageChange(-100, -50)).toBe(-50);
      expect(calculatePercentageChange(100, -50)).toBe(-150);
    });

    it('throws PercentageError when oldValue is zero without fallback', () => {
      expect(() => calculatePercentageChange(0, 100)).toThrow(PercentageError);
      expect(() => calculatePercentageChange(0, 100)).toThrow(/undefined when the starting value/);
    });

    it('returns zeroOldValueFallback when specified and oldValue is zero', () => {
      expect(calculatePercentageChange(0, 100, { zeroOldValueFallback: 0 })).toBe(0);
      expect(calculatePercentageChange(0, 100, { zeroOldValueFallback: 100 })).toBe(100);
    });

    it('rejects invalid inputs', () => {
      // @ts-expect-error Testing invalid runtime input
      expect(() => calculatePercentageChange(100, 'abc')).toThrow(PercentageError);
      expect(() => calculatePercentageChange(1e-300, 1e308)).toThrow(/overflow/i);
    });
  });

  describe('calculatePercentageDifference()', () => {
    it('calculates percentage difference between two values', () => {
      // |100 - 120| / ((100 + 120) / 2) * 100 = 20 / 110 * 100 = 18.1818...%
      expect(calculatePercentageDifference(100, 120, { precision: 2 })).toBe(18.18);
    });

    it('is symmetric: diff(A, B) === diff(B, A)', () => {
      const diff1 = calculatePercentageDifference(50, 75);
      const diff2 = calculatePercentageDifference(75, 50);
      expect(diff1).toBe(diff2);
    });

    it('returns 0 when both values are zero', () => {
      expect(calculatePercentageDifference(0, 0)).toBe(0);
    });

    it('returns 0 when both values are equal', () => {
      expect(calculatePercentageDifference(500, 500)).toBe(0);
    });

    it('handles negative numbers using absolute values', () => {
      expect(calculatePercentageDifference(-100, -120, { precision: 2 })).toBe(18.18);
      expect(() => calculatePercentageDifference(1e308, -1e308)).toThrow(/overflow/i);
    });
  });

  describe('calculatePercentageOfTotal()', () => {
    it('calculates what percentage part is of total', () => {
      expect(calculatePercentageOfTotal(25, 200)).toBe(12.5);
      expect(calculatePercentageOfTotal(50, 100)).toBe(50);
      expect(calculatePercentageOfTotal(150, 100)).toBe(150);
      expect(() => calculatePercentageOfTotal(1e308, 1e-300)).toThrow(/overflow/i);
    });

    it('throws PercentageError when total is zero', () => {
      expect(() => calculatePercentageOfTotal(10, 0)).toThrow(PercentageError);
      expect(() => calculatePercentageOfTotal(10, 0)).toThrow(/zero total/);
    });
  });

  describe('calculatePercentageChangeAmount()', () => {
    it('calculates raw difference between new and old value', () => {
      expect(calculatePercentageChangeAmount(100, 125)).toBe(25);
      expect(calculatePercentageChangeAmount(100, 75)).toBe(-25);
      expect(calculatePercentageChangeAmount(50, 50)).toBe(0);
    });

    it('supports precision option', () => {
      expect(calculatePercentageChangeAmount(10.1234, 15.5678, { precision: 2 })).toBe(5.44);
    });
  });
});
