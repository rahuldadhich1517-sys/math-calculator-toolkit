import { describe, it, expect } from 'vitest';
import { round } from '../src/internal/rounding.js';
import {
  assertFiniteNumber,
  assertNonNegativeNumber,
  assertPositiveNumber,
  assertInRange,
  assertInteger,
} from '../src/internal/validation.js';
import {
  MathToolkitError,
  ValidationError,
  CalculatorError,
  PercentageError,
  DiscountError,
  GstError,
  EmiError,
  NumberFormatError,
} from '../src/internal/errors.js';

describe('Internal Utilities & Errors', () => {
  describe('Error hierarchy', () => {
    it('creates all error classes with correct names and inheritance', () => {
      const base = new MathToolkitError('base', 'INVALID_ARGUMENT', { a: 1 });
      expect(base).toBeInstanceOf(Error);
      expect(base).toBeInstanceOf(MathToolkitError);
      expect(base.name).toBe('MathToolkitError');
      expect(base.code).toBe('INVALID_ARGUMENT');
      expect(base.details).toEqual({ a: 1 });

      const val = new ValidationError('validation');
      expect(val).toBeInstanceOf(ValidationError);
      expect(val).toBeInstanceOf(MathToolkitError);
      expect(val.name).toBe('ValidationError');

      const calc = new CalculatorError('calc');
      expect(calc).toBeInstanceOf(CalculatorError);

      const pct = new PercentageError('pct');
      expect(pct).toBeInstanceOf(PercentageError);

      const disc = new DiscountError('disc');
      expect(disc).toBeInstanceOf(DiscountError);

      const gst = new GstError('gst');
      expect(gst).toBeInstanceOf(GstError);

      const emi = new EmiError('emi');
      expect(emi).toBeInstanceOf(EmiError);

      const fmt = new NumberFormatError('fmt');
      expect(fmt).toBeInstanceOf(NumberFormatError);
    });
  });

  describe('Rounding utility', () => {
    it('rounds 0 to 0', () => {
      expect(round(0, 2)).toBe(0);
    });

    it('rejects non-finite input values', () => {
      // @ts-expect-error Testing invalid runtime value
      expect(() => round(NaN)).toThrow(ValidationError);
      // @ts-expect-error Testing invalid runtime value
      expect(() => round(Infinity)).toThrow(ValidationError);
    });

    it('rejects invalid decimalPlaces arguments', () => {
      expect(() => round(10.5, -1)).toThrow(ValidationError);
      expect(() => round(10.5, 25)).toThrow(ValidationError);
      expect(() => round(10.5, 1.5)).toThrow(ValidationError);
    });

    it('supports half-even (banker rounding) on even, odd, and non-half values', () => {
      expect(round(1.5, 0, 'half-even')).toBe(2);
      expect(round(2.5, 0, 'half-even')).toBe(2);
      expect(round(2.6, 0, 'half-even')).toBe(3);
      expect(round(2.4, 0, 'half-even')).toBe(2);
    });

    it('supports trunc, ceil, and floor modes', () => {
      expect(round(1.555, 2, 'trunc')).toBe(1.55);
      expect(round(-1.555, 2, 'trunc')).toBe(-1.55);

      expect(round(1.551, 2, 'ceil')).toBe(1.56);
      expect(round(-1.559, 2, 'ceil')).toBe(-1.55);

      expect(round(1.559, 2, 'floor')).toBe(1.55);
      expect(round(-1.551, 2, 'floor')).toBe(-1.56);
    });

    it('rejects unsupported rounding modes', () => {
      // @ts-expect-error Testing invalid mode
      expect(() => round(1.5, 2, 'unsupported_mode')).toThrow(ValidationError);
    });
  });

  describe('Validation utilities', () => {
    it('assertFiniteNumber accepts finite numbers and rejects others', () => {
      expect(() => assertFiniteNumber(42, 'test')).not.toThrow();
      expect(() => assertFiniteNumber('42', 'test')).toThrow(ValidationError);
      expect(() => assertFiniteNumber(NaN, 'test')).toThrow(ValidationError);
    });

    it('assertNonNegativeNumber checks >= 0', () => {
      expect(() => assertNonNegativeNumber(0, 'test')).not.toThrow();
      expect(() => assertNonNegativeNumber(5, 'test')).not.toThrow();
      expect(() => assertNonNegativeNumber(-1, 'test')).toThrow(ValidationError);
    });

    it('assertPositiveNumber checks > 0', () => {
      expect(() => assertPositiveNumber(5, 'test')).not.toThrow();
      expect(() => assertPositiveNumber(0, 'test')).toThrow(ValidationError);
      expect(() => assertPositiveNumber(-5, 'test')).toThrow(ValidationError);
    });

    it('assertInRange checks inclusive bounds', () => {
      expect(() => assertInRange(5, 1, 10, 'test')).not.toThrow();
      expect(() => assertInRange(1, 1, 10, 'test')).not.toThrow();
      expect(() => assertInRange(10, 1, 10, 'test')).not.toThrow();
      expect(() => assertInRange(0, 1, 10, 'test')).toThrow(ValidationError);
      expect(() => assertInRange(11, 1, 10, 'test')).toThrow(ValidationError);
    });

    it('assertInteger checks integer values', () => {
      expect(() => assertInteger(5, 'test')).not.toThrow();
      expect(() => assertInteger(0, 'test')).not.toThrow();
      expect(() => assertInteger(5.5, 'test')).toThrow(ValidationError);
    });
  });
});
