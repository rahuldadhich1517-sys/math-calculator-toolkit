import { describe, it, expect } from 'vitest';
import {
  calculate,
  add,
  subtract,
  multiply,
  divide,
  modulo,
  power,
  CalculatorError,
} from '../src/calculator/index.js';

describe('Calculator Module', () => {
  describe('calculate() - Basic arithmetic & expressions', () => {
    it('evaluates simple addition and subtraction', () => {
      expect(calculate('2 + 3')).toBe(5);
      expect(calculate('10 - 4')).toBe(6);
      expect(calculate('100 - 30 + 15')).toBe(85);
    });

    it('evaluates multiplication and division', () => {
      expect(calculate('4 * 5')).toBe(20);
      expect(calculate('10 / 2')).toBe(5);
      expect(calculate('2.5 * 4')).toBe(10);
    });

    it('respects standard operator precedence', () => {
      expect(calculate('2 + 3 * 4')).toBe(14);
      expect(calculate('10 - 2 * 3')).toBe(4);
      expect(calculate('20 / 4 + 2 * 3')).toBe(11);
    });

    it('handles nested parentheses correctly', () => {
      expect(calculate('(2 + 3) * 4')).toBe(20);
      expect(calculate('((2 + 3) * (4 - 1))')).toBe(15);
      expect(calculate('100 / (2 * (3 + 2))')).toBe(10);
    });

    it('handles unary plus and minus', () => {
      expect(calculate('-5 + 8')).toBe(3);
      expect(calculate('+5')).toBe(5);
      expect(calculate('-(-5)')).toBe(5);
      expect(calculate('2 * -3')).toBe(-6);
      expect(calculate('-5 - -3')).toBe(-2);
    });

    it('handles exponentiation with ^ and ** (right-associative)', () => {
      expect(calculate('2 ^ 3')).toBe(8);
      expect(calculate('2 ** 3')).toBe(8);
      // Right-associative: 2 ^ 3 ^ 2 = 2 ^ 9 = 512
      expect(calculate('2 ^ 3 ^ 2')).toBe(512);
      expect(calculate('2 ** 3 ** 2')).toBe(512);
      // Unary with exponentiation
      expect(calculate('(-2) ^ 2')).toBe(4);
      expect(calculate('-2 ^ 2')).toBe(-4);
      expect(calculate('2 ^ -2')).toBe(0.25);
    });

    it('handles modulo/remainder operator %', () => {
      expect(calculate('10 % 3')).toBe(1);
      expect(calculate('14 % 5')).toBe(4);
      expect(calculate('-10 % 3')).toBe(-1);
    });

    it('handles decimal numbers and scientific notation', () => {
      expect(calculate('0.1 + 0.2')).toBeCloseTo(0.3, 10);
      expect(calculate('.5 * 2')).toBe(1);
      expect(calculate('1e3 + 200')).toBe(1200);
      expect(calculate('2.5e-1 * 4')).toBe(1);
    });

    it('supports precision and rounding options', () => {
      expect(calculate('10 / 3', { precision: 2 })).toBe(3.33);
      expect(calculate('10 / 3', { precision: 4 })).toBe(3.3333);
      expect(calculate('2.555', { precision: 2, roundingMode: 'half-up' })).toBe(2.56);
      expect(calculate('2.555', { precision: 2, roundingMode: 'floor' })).toBe(2.55);
    });

    it('handles negative zero normalization', () => {
      expect(Object.is(calculate('-0'), 0)).toBe(true);
      expect(Object.is(calculate('0 * -1'), 0)).toBe(true);
    });
  });

  describe('calculate() - Error conditions & validation', () => {
    it('throws CalculatorError on division by zero', () => {
      expect(() => calculate('10 / 0')).toThrow(CalculatorError);
      expect(() => calculate('10 / 0')).toThrow(/Division by zero/);
    });

    it('throws CalculatorError on modulo by zero', () => {
      expect(() => calculate('10 % 0')).toThrow(CalculatorError);
      expect(() => calculate('10 % 0')).toThrow(/Modulo by zero/);
    });

    it('throws CalculatorError on empty or whitespace expression', () => {
      expect(() => calculate('')).toThrow(CalculatorError);
      expect(() => calculate('   ')).toThrow(CalculatorError);
    });

    it('throws CalculatorError on non-string input', () => {
      // @ts-expect-error Testing invalid runtime input
      expect(() => calculate(123)).toThrow(CalculatorError);
      // @ts-expect-error Testing invalid runtime input
      expect(() => calculate(null)).toThrow(CalculatorError);
    });

    it('throws CalculatorError on empty parentheses', () => {
      expect(() => calculate('()')).toThrow(CalculatorError);
      expect(() => calculate('2 + ()')).toThrow(CalculatorError);
    });

    it('throws CalculatorError on mismatched parentheses', () => {
      expect(() => calculate('(2 + 3')).toThrow(/Mismatched parentheses/);
      expect(() => calculate('2 + 3)')).toThrow(/Unexpected token/);
    });

    it('throws CalculatorError on non-finite numeric literals like 1e999', () => {
      expect(() => calculate('1e999')).toThrow(CalculatorError);
      expect(() => calculate('1e999')).toThrow(/Invalid numeric literal/);
    });

    it('throws CalculatorError on unexpected trailing or missing tokens', () => {
      expect(() => calculate('2 +')).toThrow(/Unexpected end of expression/);
      expect(() => calculate('2 * / 3')).toThrow(/Unexpected token/);
    });

    it('throws CalculatorError on numerical overflow', () => {
      expect(() => calculate('1e308 * 10')).toThrow(CalculatorError);
      expect(() => calculate('1e308 * 10')).toThrow(/overflow/i);
    });

    it('throws CalculatorError when expression exceeds maxExpressionLength', () => {
      const longExpr = '1 + '.repeat(5000) + '1';
      expect(() => calculate(longExpr, { maxExpressionLength: 100 })).toThrow(/exceeds maximum allowed length/);
    });

    it('throws CalculatorError when parentheses depth exceeds maxDepth', () => {
      const nested = '('.repeat(15) + '1' + ')'.repeat(15);
      expect(() => calculate(nested, { maxDepth: 10 })).toThrow(/nesting depth/);
    });
  });

  describe('Arithmetic standalone helpers', () => {
    it('add() adds numbers and validates finite inputs', () => {
      expect(add(10, 25)).toBe(35);
      expect(add(-5, 5)).toBe(0);
      // @ts-expect-error Testing invalid runtime input
      expect(() => add(NaN, 5)).toThrow(CalculatorError);
      expect(() => add(1e308, 1e308)).toThrow(/overflow/i);
    });

    it('subtract() subtracts numbers and validates finite inputs', () => {
      expect(subtract(10, 3)).toBe(7);
      expect(subtract(3, 10)).toBe(-7);
      // @ts-expect-error Testing invalid runtime input
      expect(() => subtract(10, Infinity)).toThrow(CalculatorError);
      expect(() => subtract(-1e308, 1e308)).toThrow(/overflow/i);
    });

    it('multiply() multiplies numbers and validates finite inputs', () => {
      expect(multiply(4, 5)).toBe(20);
      expect(multiply(-3, 6)).toBe(-18);
      expect(() => multiply(1e308, 2)).toThrow(/overflow/i);
    });

    it('divide() divides numbers and rejects zero divisor', () => {
      expect(divide(20, 4)).toBe(5);
      expect(() => divide(10, 0)).toThrow(/Division by zero/);
      expect(() => divide(1e308, 1e-308)).toThrow(/overflow/i);
    });

    it('modulo() calculates remainder and rejects zero divisor', () => {
      expect(modulo(17, 5)).toBe(2);
      expect(() => modulo(10, 0)).toThrow(/Modulo by zero/);
    });

    it('power() calculates exponentiation and rejects overflow', () => {
      expect(power(2, 8)).toBe(256);
      expect(power(9, 0.5)).toBe(3);
      expect(() => power(10, 500)).toThrow(/overflow/i);
    });
  });
});
