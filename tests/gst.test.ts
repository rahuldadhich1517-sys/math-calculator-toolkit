import { describe, it, expect } from 'vitest';
import { calculateGST, GstError, GST_RATE_PRESETS } from '../src/gst/index.js';

describe('GST Module', () => {
  describe('calculateGST()', () => {
    it('calculates GST-exclusive amount correctly with intra-state split (default)', () => {
      const res = calculateGST(1000, { rate: 18 });
      expect(res.mode).toBe('exclusive');
      expect(res.taxType).toBe('intra-state');
      expect(res.rate).toBe(18);
      expect(res.baseAmount).toBe(1000);
      expect(res.gstAmount).toBe(180);
      expect(res.totalAmount).toBe(1180);
      expect(res.breakdown.cgst).toBe(90);
      expect(res.breakdown.sgst).toBe(90);
      expect(res.breakdown.igst).toBe(0);
    });

    it('calculates GST-exclusive amount with inter-state IGST', () => {
      const res = calculateGST(1000, { rate: 18, taxType: 'inter-state' });
      expect(res.taxType).toBe('inter-state');
      expect(res.gstAmount).toBe(180);
      expect(res.breakdown.cgst).toBe(0);
      expect(res.breakdown.sgst).toBe(0);
      expect(res.breakdown.igst).toBe(180);
    });

    it('calculates GST-inclusive amount correctly', () => {
      // Gross ₹1180 with 18% GST -> Base ₹1000, GST ₹180
      const res = calculateGST(1180, { rate: 18, mode: 'inclusive' });
      expect(res.mode).toBe('inclusive');
      expect(res.baseAmount).toBe(1000);
      expect(res.gstAmount).toBe(180);
      expect(res.totalAmount).toBe(1180);
      expect(res.breakdown.cgst).toBe(90);
      expect(res.breakdown.sgst).toBe(90);
    });

    it('handles zero amount and zero rate', () => {
      const zeroAmount = calculateGST(0, { rate: 18 });
      expect(zeroAmount.baseAmount).toBe(0);
      expect(zeroAmount.gstAmount).toBe(0);
      expect(zeroAmount.totalAmount).toBe(0);

      const zeroRate = calculateGST(1000, { rate: 0 });
      expect(zeroRate.baseAmount).toBe(1000);
      expect(zeroRate.gstAmount).toBe(0);
      expect(zeroRate.totalAmount).toBe(1000);
    });

    it('calculates with standard preset rates (5%, 12%, 18%, 28%)', () => {
      for (const rate of GST_RATE_PRESETS) {
        const res = calculateGST(1000, { rate });
        expect(res.rate).toBe(rate);
        expect(res.gstAmount).toBe((1000 * rate) / 100);
      }
    });

    it('handles fractional GST rates and non-exact decimals with rounding', () => {
      const res = calculateGST(500, { rate: 7.5, precision: 2 });
      expect(res.gstAmount).toBe(37.5);
      expect(res.totalAmount).toBe(537.5);
      expect(res.breakdown.cgst).toBe(18.75);
      expect(res.breakdown.sgst).toBe(18.75);
    });

    it('reconciles inclusive and exclusive calculations within floating tolerance', () => {
      const base = 2500;
      const rate = 18;
      const exclusive = calculateGST(base, { rate, mode: 'exclusive' });
      const inclusive = calculateGST(exclusive.totalAmount, { rate, mode: 'inclusive' });

      expect(inclusive.baseAmount).toBeCloseTo(base, 5);
      expect(inclusive.gstAmount).toBeCloseTo(exclusive.gstAmount, 5);
    });

    it('rejects negative amount or negative rate', () => {
      expect(() => calculateGST(-100, { rate: 18 })).toThrow(GstError);
      expect(() => calculateGST(100, { rate: -5 })).toThrow(GstError);
    });

    it('rejects invalid calculation mode or taxType', () => {
      // @ts-expect-error Testing invalid runtime mode
      expect(() => calculateGST(1000, { rate: 18, mode: 'invalid' })).toThrow(GstError);
      // @ts-expect-error Testing invalid runtime taxType
      expect(() => calculateGST(1000, { rate: 18, taxType: 'invalid' })).toThrow(GstError);
    });

    it('rejects missing options or non-finite inputs', () => {
      // @ts-expect-error Testing missing options
      expect(() => calculateGST(1000)).toThrow(GstError);
      // @ts-expect-error Testing non-finite amount
      expect(() => calculateGST(NaN, { rate: 18 })).toThrow(GstError);
      // @ts-expect-error Testing non-finite rate
      expect(() => calculateGST(1000, { rate: Infinity })).toThrow(GstError);
    });
  });
});
