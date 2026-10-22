import { describe, it, expect } from 'vitest';
import * as RootExports from '../src/index.js';
import {
  calculate,
  calculatePercentage,
  calculateDiscount,
  calculateGST,
  calculateEMI,
  formatNumber,
  round,
} from '../src/index.js';

describe('Integration & End-to-End Workflows', () => {
  it('workflow 1: chained percentage -> discount -> GST calculation', () => {
    // 1. Calculate a 15% discount on an item costing ₹10,000
    const originalPrice = 10000;
    const discountRate = calculatePercentage(100, 15); // 15%
    const discountResult = calculateDiscount(originalPrice, discountRate, { precision: 2 });
    expect(discountResult.finalPrice).toBe(8500);

    // 2. Apply 18% GST on the discounted price
    const gstResult = calculateGST(discountResult.finalPrice, {
      rate: 18,
      mode: 'exclusive',
      precision: 2,
    });
    expect(gstResult.baseAmount).toBe(8500);
    expect(gstResult.gstAmount).toBe(1530);
    expect(gstResult.totalAmount).toBe(10030);

    // 3. Format the total for customer invoice in INR
    const formattedInvoice = formatNumber(gstResult.totalAmount, {
      style: 'currency',
      currency: 'INR',
      locale: 'en-IN',
    });
    expect(formattedInvoice).toContain('10,030.00');
  });

  it('workflow 2: loan financing -> EMI calculation -> localized presentation', () => {
    // Car purchase: price ₹1,500,000, 20% down payment, remaining financed at 9% for 5 years
    const carPrice = 1500000;
    const downPayment = calculatePercentage(carPrice, 20); // ₹300,000
    const loanPrincipal = carPrice - downPayment; // ₹1,200,000

    const emiResult = calculateEMI(loanPrincipal, 9, 5, {
      tenureUnit: 'years',
      precision: 2,
    });

    expect(emiResult.principal).toBe(1200000);
    expect(emiResult.tenureInMonths).toBe(60);
    expect(emiResult.monthlyEMI).toBeCloseTo(24910.04, 1);

    const formattedEMI = formatNumber(emiResult.monthlyEMI, {
      style: 'currency',
      currency: 'INR',
      locale: 'en-IN',
    });
    expect(formattedEMI).toContain('24,910');
  });

  it('workflow 3: safe expression calculation used in financial helper', () => {
    // Evaluate composite dynamic price: (50 * 4) + (25 * 8) = 200 + 200 = 400
    const evaluatedPrice = calculate('(50 * 4) + (25 * 8)');
    expect(evaluatedPrice).toBe(400);

    const discounted = calculateDiscount(evaluatedPrice, 25);
    expect(discounted.finalPrice).toBe(300);
  });

  it('verifies all expected public exports exist on package root', () => {
    // Core error hierarchy
    expect(RootExports.MathToolkitError).toBeDefined();
    expect(RootExports.ValidationError).toBeDefined();
    expect(RootExports.CalculatorError).toBeDefined();
    expect(RootExports.PercentageError).toBeDefined();
    expect(RootExports.DiscountError).toBeDefined();
    expect(RootExports.GstError).toBeDefined();
    expect(RootExports.EmiError).toBeDefined();
    expect(RootExports.NumberFormatError).toBeDefined();

    // Rounding
    expect(typeof RootExports.round).toBe('function');

    // Calculator
    expect(typeof RootExports.calculate).toBe('function');
    expect(typeof RootExports.add).toBe('function');
    expect(typeof RootExports.subtract).toBe('function');
    expect(typeof RootExports.multiply).toBe('function');
    expect(typeof RootExports.divide).toBe('function');
    expect(typeof RootExports.modulo).toBe('function');
    expect(typeof RootExports.power).toBe('function');

    // Percentage
    expect(typeof RootExports.calculatePercentage).toBe('function');
    expect(typeof RootExports.calculatePercentageChange).toBe('function');
    expect(typeof RootExports.calculatePercentageDifference).toBe('function');
    expect(typeof RootExports.calculatePercentageOfTotal).toBe('function');
    expect(typeof RootExports.calculatePercentageChangeAmount).toBe('function');

    // Discount
    expect(typeof RootExports.calculateDiscount).toBe('function');

    // GST
    expect(typeof RootExports.calculateGST).toBe('function');
    expect(Array.isArray(RootExports.GST_RATE_PRESETS)).toBe(true);

    // EMI
    expect(typeof RootExports.calculateEMI).toBe('function');

    // Number format
    expect(typeof RootExports.formatNumber).toBe('function');
  });

  describe('Deterministic Mathematical Invariants', () => {
    it('invariant: a 0% discount always preserves original price', () => {
      const prices = [1, 49.99, 100, 9999.99];
      for (const p of prices) {
        const res = calculateDiscount(p, 0);
        expect(res.finalPrice).toBe(p);
        expect(res.discountAmount).toBe(0);
      }
    });

    it('invariant: a 100% discount results in zero final price', () => {
      const prices = [1, 50, 750, 100000];
      for (const p of prices) {
        const res = calculateDiscount(p, 100);
        expect(res.finalPrice).toBe(0);
        expect(res.discountAmount).toBe(p);
      }
    });

    it('invariant: 0% GST produces zero tax in both inclusive and exclusive modes', () => {
      const amounts = [100, 500, 1250.5];
      for (const amt of amounts) {
        const excl = calculateGST(amt, { rate: 0, mode: 'exclusive' });
        expect(excl.gstAmount).toBe(0);
        expect(excl.totalAmount).toBe(amt);

        const incl = calculateGST(amt, { rate: 0, mode: 'inclusive' });
        expect(incl.gstAmount).toBe(0);
        expect(incl.baseAmount).toBe(amt);
      }
    });

    it('invariant: zero interest EMI is strictly principal / tenureInMonths', () => {
      const testCases = [
        { p: 12000, n: 12 },
        { p: 60000, n: 24 },
        { p: 100000, n: 10 },
      ];
      for (const { p, n } of testCases) {
        const res = calculateEMI(p, 0, n);
        expect(res.monthlyEMI).toBe(p / n);
        expect(res.totalRepayment).toBe(p);
        expect(res.totalInterest).toBe(0);
      }
    });

    it('invariant: functions are strictly pure and deterministic across repeated calls', () => {
      for (let i = 0; i < 5; i++) {
        expect(calculate('((10 + 5) * 2) ^ 2')).toBe(900);
        expect(calculatePercentage(300, 15)).toBe(45);
        expect(calculateDiscount(2000, 20).finalPrice).toBe(1600);
        expect(calculateGST(1000, { rate: 18 }).totalAmount).toBe(1180);
        expect(calculateEMI(500000, 10, 36).tenureInMonths).toBe(36);
        expect(formatNumber(12345.6, { locale: 'en-US' })).toBe('12,345.6');
      }
    });

    it('invariant: round() handles standard half-even banker rounding and half-up properly', () => {
      // Half-up: 2.5 -> 3, 3.5 -> 4
      expect(round(2.5, 0, 'half-up')).toBe(3);
      expect(round(3.5, 0, 'half-up')).toBe(4);

      // Half-even: 2.5 -> 2 (even), 3.5 -> 4 (even)
      expect(round(2.5, 0, 'half-even')).toBe(2);
      expect(round(3.5, 0, 'half-even')).toBe(4);

      // Decimal precision
      expect(round(1.005, 2, 'half-up')).toBe(1.01);
      expect(round(1.004, 2, 'half-up')).toBe(1.0);
    });
  });
});
