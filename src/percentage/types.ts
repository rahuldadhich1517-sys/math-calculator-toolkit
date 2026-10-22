import type { RoundingMode } from '../internal/rounding.js';

export interface PercentageOptions {
  /**
   * Optional number of decimal places to round the result.
   */
  precision?: number;

  /**
   * Rounding mode to apply when precision is specified.
   * @default 'half-up'
   */
  roundingMode?: RoundingMode;
}

export interface PercentageChangeOptions extends PercentageOptions {
  /**
   * Optional fallback value to return when oldValue is zero.
   * If omitted, a PercentageError is thrown.
   */
  zeroOldValueFallback?: number;
}
