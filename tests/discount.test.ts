import { describe, it, expect } from 'vitest';
import { calculateDiscount, DiscountError } from '../src/discount/index.js';

describe('Discount Module', () => {
  describe('calculateDiscount()', () => {
    it('calculates standard discounts correctly', () => {
      const res = calculateDiscount(1000, 10);
      expect(res.originalPrice).toBe(1000);
      expect(res.discountPercentage).toBe(10);
      expect(res.discountAmount).toBe(100);
      expect(res.finalPrice).toBe(900);
      expect(res.savingsPercentage).toBe(10);
    });

    it('handles zero discount (0%)', () => {
      const res = calculateDiscount(1000, 0);
      expect(res.originalPrice).toBe(1000);
      expect(res.discountAmount).toBe(0);
      expect(res.finalPrice).toBe(1000);
      expect(res.savingsPercentage).toBe(0);
    });

    it('handles full 100% discount', () => {
      const res = calculateDiscount(500, 100);
      expect(res.discountAmount).toBe(500);
      expect(res.finalPrice).toBe(0);
      expect(res.savingsPercentage).toBe(100);
    });

    it('handles zero price', () => {
      const res = calculateDiscount(0, 20);
      expect(res.originalPrice).toBe(0);
      expect(res.discountAmount).toBe(0);
      expect(res.finalPrice).toBe(0);
      expect(res.savingsPercentage).toBe(20);
    });

    it('handles fractional discounts and decimal prices', () => {
      const res = calculateDiscount(799, 15.5, { precision: 2 });
      expect(res.discountAmount).toBe(123.85); // 799 * 0.155 = 123.845 -> 123.85
      expect(res.finalPrice).toBe(675.16); // 799 - 123.845 = 675.155 -> 675.16
    });

    it('supports custom rounding modes', () => {
      const resCeil = calculateDiscount(100, 15.555, { precision: 2, roundingMode: 'ceil' });
      expect(resCeil.discountAmount).toBe(15.56);
      const resFloor = calculateDiscount(100, 15.555, { precision: 2, roundingMode: 'floor' });
      expect(resFloor.discountAmount).toBe(15.55);
    });

    it('rejects negative price', () => {
      expect(() => calculateDiscount(-100, 10)).toThrow(DiscountError);
      expect(() => calculateDiscount(-100, 10)).toThrow(/non-negative/);
    });

    it('rejects negative discount', () => {
      expect(() => calculateDiscount(100, -5)).toThrow(DiscountError);
      expect(() => calculateDiscount(100, -5)).toThrow(/non-negative/);
    });

    it('rejects discount greater than 100% when allowGreaterThan100 is false', () => {
      expect(() => calculateDiscount(100, 120)).toThrow(DiscountError);
      expect(() => calculateDiscount(100, 120)).toThrow(/cannot exceed 100%/);
    });

    it('allows discount greater than 100% when allowGreaterThan100 is true', () => {
      const res = calculateDiscount(100, 150, { allowGreaterThan100: true });
      expect(res.discountAmount).toBe(150);
      expect(res.finalPrice).toBe(0); // Clamped at 0
    });

    it('rejects NaN, Infinity, and non-numeric inputs', () => {
      // @ts-expect-error Testing invalid runtime input
      expect(() => calculateDiscount(NaN, 10)).toThrow(DiscountError);
      // @ts-expect-error Testing invalid runtime input
      expect(() => calculateDiscount(100, Infinity)).toThrow(DiscountError);
      // @ts-expect-error Testing invalid runtime input
      expect(() => calculateDiscount('100', 10)).toThrow(DiscountError);
    });
  });
});
