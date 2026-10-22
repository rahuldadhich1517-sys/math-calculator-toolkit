import { DiscountError } from '../internal/errors.js';
import { round } from '../internal/rounding.js';
import { assertNonNegativeNumber } from '../internal/validation.js';
import type { DiscountOptions, DiscountResult } from './types.js';

/**
 * Calculates discount amount, final price, and savings breakdown.
 *
 * Formulas:
 * - `discountAmount = originalPrice * (discountPercentage / 100)`
 * - `finalPrice = originalPrice - discountAmount`
 * - `savingsPercentage = discountPercentage`
 *
 * @throws {DiscountError} When price is negative, discount is out of range, or inputs are non-finite.
 *
 * @example
 * calculateDiscount(1000, 20);
 * // { originalPrice: 1000, discountPercentage: 20, discountAmount: 200, finalPrice: 800, savingsPercentage: 20 }
 */
export function calculateDiscount(
  originalPrice: number,
  discountPercentage: number,
  options?: DiscountOptions,
): DiscountResult {
  assertNonNegativeNumber(originalPrice, 'originalPrice', DiscountError);
  assertNonNegativeNumber(discountPercentage, 'discountPercentage', DiscountError);

  const allowAbove100 = options?.allowGreaterThan100 ?? false;
  if (!allowAbove100 && discountPercentage > 100) {
    throw new DiscountError(
      `discountPercentage cannot exceed 100% unless allowGreaterThan100 is enabled. Received: ${discountPercentage}`,
      'OUT_OF_RANGE',
      { discountPercentage },
    );
  }

  const rawDiscountAmount = (originalPrice * discountPercentage) / 100;
  const rawFinalPrice = Math.max(0, originalPrice - rawDiscountAmount);
  const rawSavingsPercentage = originalPrice === 0 ? discountPercentage : (rawDiscountAmount / originalPrice) * 100;

  if (typeof options?.precision === 'number') {
    const precision = options.precision;
    const mode = options.roundingMode;
    const discountAmount = round(rawDiscountAmount, precision, mode);
    const finalPrice = round(rawFinalPrice, precision, mode);
    const savings = round(rawSavingsPercentage, precision, mode);

    return {
      originalPrice,
      discountPercentage,
      discountAmount,
      finalPrice,
      savingsPercentage: savings,
    };
  }

  return {
    originalPrice,
    discountPercentage,
    discountAmount: rawDiscountAmount,
    finalPrice: rawFinalPrice,
    savingsPercentage: rawSavingsPercentage,
  };
}
