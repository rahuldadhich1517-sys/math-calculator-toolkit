import type { RoundingMode } from '../internal/rounding.js';

export interface DiscountOptions {
  /**
   * Number of decimal places to round the currency amounts.
   * If omitted, raw numbers are returned without rounding.
   */
  precision?: number;

  /**
   * Rounding mode to apply when precision is specified.
   * @default 'half-up'
   */
  roundingMode?: RoundingMode;

  /**
   * Whether to allow discounts greater than 100%.
   * @default false
   */
  allowGreaterThan100?: boolean;
}

export interface DiscountResult {
  /**
   * Original non-negative price before discount.
   */
  originalPrice: number;

  /**
   * Discount percentage applied (0 - 100, or higher if allowGreaterThan100 is true).
   */
  discountPercentage: number;

  /**
   * The calculated discount amount deducted from original price.
   */
  discountAmount: number;

  /**
   * The final price payable after discount.
   */
  finalPrice: number;

  /**
   * The percentage saved relative to original price.
   */
  savingsPercentage: number;
}
