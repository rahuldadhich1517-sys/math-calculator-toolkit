import { CalculatorError } from '../internal/errors.js';
import { round } from '../internal/rounding.js';
import { assertFiniteNumber } from '../internal/validation.js';
import { ExpressionParser } from './parser.js';
import type { CalculatorOptions } from './types.js';

/**
 * Safely calculates the numeric result of an arithmetic expression string.
 *
 * Supported features:
 * - Addition (+), Subtraction (-)
 * - Multiplication (*), Division (/), Remainder/Modulo (%)
 * - Exponentiation (^ or **)
 * - Unary plus (+) and Unary minus (-)
 * - Parentheses with unlimited nesting (up to maxDepth)
 * - Scientific notation (e.g. 1e3, 2.5e-2)
 *
 * Security:
 * - Pure tokenizer and recursive-descent parser.
 * - Absolutely zero eval(), Function(), or dynamic execution.
 * - Strictly rejects all identifiers, properties, and JS code.
 *
 * @throws {CalculatorError} On syntax errors, division by zero, or numerical overflow.
 */
export function calculate(expression: string, options: CalculatorOptions = {}): number {
  const parser = new ExpressionParser(expression, options);
  const rawResult = parser.parse();

  if (typeof options.precision === 'number') {
    return round(rawResult, options.precision, options.roundingMode);
  }

  return rawResult;
}

/**
 * Adds two finite numbers.
 */
export function add(a: number, b: number): number {
  assertFiniteNumber(a, 'a', CalculatorError);
  assertFiniteNumber(b, 'b', CalculatorError);
  const result = a + b;
  if (!Number.isFinite(result)) {
    throw new CalculatorError('Addition resulted in numerical overflow', 'OVERFLOW', { a, b });
  }
  return result || 0;
}

/**
 * Subtracts b from a.
 */
export function subtract(a: number, b: number): number {
  assertFiniteNumber(a, 'a', CalculatorError);
  assertFiniteNumber(b, 'b', CalculatorError);
  const result = a - b;
  if (!Number.isFinite(result)) {
    throw new CalculatorError('Subtraction resulted in numerical overflow', 'OVERFLOW', { a, b });
  }
  return result || 0;
}

/**
 * Multiplies two finite numbers.
 */
export function multiply(a: number, b: number): number {
  assertFiniteNumber(a, 'a', CalculatorError);
  assertFiniteNumber(b, 'b', CalculatorError);
  const result = a * b;
  if (!Number.isFinite(result)) {
    throw new CalculatorError('Multiplication resulted in numerical overflow', 'OVERFLOW', { a, b });
  }
  return result || 0;
}

/**
 * Divides a by b.
 * @throws {CalculatorError} When b is 0.
 */
export function divide(a: number, b: number): number {
  assertFiniteNumber(a, 'a', CalculatorError);
  assertFiniteNumber(b, 'b', CalculatorError);
  if (b === 0) {
    throw new CalculatorError('Division by zero is undefined', 'DIVISION_BY_ZERO', { a, b });
  }
  const result = a / b;
  if (!Number.isFinite(result)) {
    throw new CalculatorError('Division resulted in numerical overflow', 'OVERFLOW', { a, b });
  }
  return result || 0;
}

/**
 * Calculates the remainder of a divided by b (a % b).
 * @throws {CalculatorError} When b is 0.
 */
export function modulo(a: number, b: number): number {
  assertFiniteNumber(a, 'a', CalculatorError);
  assertFiniteNumber(b, 'b', CalculatorError);
  if (b === 0) {
    throw new CalculatorError('Modulo by zero is undefined', 'DIVISION_BY_ZERO', { a, b });
  }
  const result = a % b;
  return result || 0;
}

/**
 * Raises base to exponent.
 */
export function power(base: number, exponent: number): number {
  assertFiniteNumber(base, 'base', CalculatorError);
  assertFiniteNumber(exponent, 'exponent', CalculatorError);
  const result = Math.pow(base, exponent);
  if (!Number.isFinite(result)) {
    throw new CalculatorError('Exponentiation resulted in numerical overflow or non-finite result', 'OVERFLOW', { base, exponent });
  }
  return result || 0;
}
