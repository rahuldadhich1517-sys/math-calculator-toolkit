import type { RoundingMode } from '../internal/rounding.js';

export interface CalculatorOptions {
  /**
   * Optional number of decimal places to round the final result.
   * If omitted, the raw IEEE-754 floating-point result is returned.
   */
  precision?: number;

  /**
   * Rounding mode to apply when precision is specified.
   * @default 'half-up'
   */
  roundingMode?: RoundingMode;

  /**
   * Maximum allowed expression string length to prevent denial-of-service.
   * @default 10000
   */
  maxExpressionLength?: number;

  /**
   * Maximum allowed nesting depth of parentheses.
   * @default 100
   */
  maxDepth?: number;
}
