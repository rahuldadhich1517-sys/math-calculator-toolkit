import { describe, it, expect } from 'vitest';
import { calculateEMI, EmiError } from '../src/emi/index.js';

describe('EMI Module', () => {
  describe('calculateEMI()', () => {
    it('calculates standard EMI with months tenure', () => {
      // Principal 1,000,000, 8.5% annual interest, 240 months (20 years)
      const res = calculateEMI(1000000, 8.5, 240, { precision: 2 });
      expect(res.principal).toBe(1000000);
      expect(res.annualInterestRate).toBe(8.5);
      expect(res.tenureInMonths).toBe(240);
      expect(res.monthlyEMI).toBe(8678.23);
      expect(res.totalRepayment).toBe(2082775.76);
      expect(res.totalInterest).toBe(1082775.76);
    });

    it('calculates standard EMI with years tenure unit', () => {
      const res = calculateEMI(1000000, 8.5, 20, { tenureUnit: 'years', precision: 2 });
      expect(res.tenureInMonths).toBe(240);
      expect(res.monthlyEMI).toBe(8678.23);
    });

    it('handles zero interest rate correctly', () => {
      // Principal 120,000, 0% rate, 12 months => EMI = 10,000, interest = 0
      const res = calculateEMI(120000, 0, 12);
      expect(res.monthlyEMI).toBe(10000);
      expect(res.totalRepayment).toBe(120000);
      expect(res.totalInterest).toBe(0);
      expect(res.monthlyInterestRate).toBe(0);
    });

    it('verifies mathematical invariants', () => {
      const P = 500000;
      const rate = 9.5;
      const tenure = 60; // 5 years

      const res = calculateEMI(P, rate, tenure);

      // Invariant 1: Total Repayment = monthlyEMI * tenureInMonths
      expect(res.totalRepayment).toBeCloseTo(res.monthlyEMI * res.tenureInMonths, 5);

      // Invariant 2: Total Interest = Total Repayment - Principal
      expect(res.totalInterest).toBeCloseTo(res.totalRepayment - P, 5);

      // Invariant 3: Larger principal increases EMI
      const largerPrincipal = calculateEMI(P * 2, rate, tenure);
      expect(largerPrincipal.monthlyEMI).toBeGreaterThan(res.monthlyEMI);

      // Invariant 4: Larger interest rate increases EMI
      const higherRate = calculateEMI(P, rate + 2, tenure);
      expect(higherRate.monthlyEMI).toBeGreaterThan(res.monthlyEMI);

      // Invariant 5: Longer tenure decreases periodic payment for positive rates
      const longerTenure = calculateEMI(P, rate, tenure * 2);
      expect(longerTenure.monthlyEMI).toBeLessThan(res.monthlyEMI);
      // But increases total interest
      expect(longerTenure.totalInterest).toBeGreaterThan(res.totalInterest);
    });

    it('supports custom rounding precision and modes', () => {
      const res = calculateEMI(100000, 10, 12, { precision: 0, roundingMode: 'ceil' });
      expect(Number.isInteger(res.monthlyEMI)).toBe(true);
      expect(Number.isInteger(res.totalRepayment)).toBe(true);
      expect(Number.isInteger(res.totalInterest)).toBe(true);
    });

    it('rejects non-positive principal', () => {
      expect(() => calculateEMI(0, 10, 12)).toThrow(EmiError);
      expect(() => calculateEMI(-5000, 10, 12)).toThrow(EmiError);
    });

    it('rejects negative interest rate', () => {
      expect(() => calculateEMI(100000, -2, 12)).toThrow(EmiError);
    });

    it('rejects non-positive tenure', () => {
      expect(() => calculateEMI(100000, 10, 0)).toThrow(EmiError);
      expect(() => calculateEMI(100000, 10, -5)).toThrow(EmiError);
    });

    it('rejects non-integer months tenure', () => {
      expect(() => calculateEMI(100000, 10, 12.5)).toThrow(EmiError);
      expect(() => calculateEMI(100000, 10, 1.1, { tenureUnit: 'years' })).toThrow(EmiError);
    });

    it('rejects tenure exceeding maximum supported limit (1200 months)', () => {
      expect(() => calculateEMI(100000, 10, 1201)).toThrow(EmiError);
      expect(() => calculateEMI(100000, 10, 1201)).toThrow(/exceeds the maximum supported duration/);
    });

    it('rejects invalid tenure unit', () => {
      // @ts-expect-error Testing invalid runtime unit
      expect(() => calculateEMI(100000, 10, 12, { tenureUnit: 'days' })).toThrow(EmiError);
    });

    it('rejects non-finite inputs', () => {
      // @ts-expect-error Testing NaN
      expect(() => calculateEMI(NaN, 10, 12)).toThrow(EmiError);
      // @ts-expect-error Testing Infinity
      expect(() => calculateEMI(100000, Infinity, 12)).toThrow(EmiError);
      expect(() => calculateEMI(1000, 1e20, 1200)).toThrow(/overflow/i);
      expect(() => calculateEMI(1e308, 100, 120)).toThrow(/overflow/i);
    });
  });
});
