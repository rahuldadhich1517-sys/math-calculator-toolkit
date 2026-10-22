import { PercentageError } from '../internal/errors.js';
import { round } from '../internal/rounding.js';
import { assertFiniteNumber } from '../internal/validation.js';
import type { PercentageOptions, PercentageChangeOptions } from './types.js';

function applyRounding(value: number, options?: PercentageOptions): number {
  if (typeof options?.precision === 'number') {
    return round(value, options.precision, options.roundingMode);
  }
  return value || 0;
}

/**
 * Calculates a percentage of a given value.
 *
 * Formula: `(value * percentage) / 100`
 *
 * @example
 * calculatePercentage(200, 15); // 30
 */
export function calculatePercentage(
  value: number,
  percentage: number,
  options?: PercentageOptions,
): number {
  assertFiniteNumber(value, 'value', PercentageError);
  assertFiniteNumber(percentage, 'percentage', PercentageError);

  const raw = (value * percentage) / 100;
  if (!Number.isFinite(raw)) {
    throw new PercentageError('Percentage calculation resulted in numerical overflow', 'OVERFLOW');
  }

  return applyRounding(raw, options);
}

/**
 * Calculates the percentage change from an old value to a new value.
 *
 * Formula: `((newValue - oldValue) / oldValue) * 100`
 *
 * @throws {PercentageError} When oldValue is zero and no fallback option is provided.
 *
 * @example
 * calculatePercentageChange(100, 150); // 50 (50% increase)
 * calculatePercentageChange(100, 75);  // -25 (25% decrease)
 */
export function calculatePercentageChange(
  oldValue: number,
  newValue: number,
  options?: PercentageChangeOptions,
): number {
  assertFiniteNumber(oldValue, 'oldValue', PercentageError);
  assertFiniteNumber(newValue, 'newValue', PercentageError);

  if (oldValue === 0) {
    if (options?.zeroOldValueFallback !== undefined) {
      assertFiniteNumber(options.zeroOldValueFallback, 'zeroOldValueFallback', PercentageError);
      return applyRounding(options.zeroOldValueFallback, options);
    }
    throw new PercentageError(
      'Percentage change is mathematically undefined when the starting value (oldValue) is zero.',
      'ZERO_OLD_VALUE',
      { oldValue, newValue },
    );
  }

  const raw = ((newValue - oldValue) / oldValue) * 100;
  if (!Number.isFinite(raw)) {
    throw new PercentageError('Percentage change calculation resulted in numerical overflow', 'OVERFLOW');
  }

  return applyRounding(raw, options);
}

/**
 * Calculates the relative percentage difference between two values.
 *
 * Formula: `(|valueA - valueB| / ((|valueA| + |valueB|) / 2)) * 100`
 *
 * When both valueA and valueB are 0, the difference is 0%.
 *
 * @example
 * calculatePercentageDifference(100, 120); // ~18.18%
 * calculatePercentageDifference(0, 0);     // 0%
 */
export function calculatePercentageDifference(
  valueA: number,
  valueB: number,
  options?: PercentageOptions,
): number {
  assertFiniteNumber(valueA, 'valueA', PercentageError);
  assertFiniteNumber(valueB, 'valueB', PercentageError);

  if (valueA === 0 && valueB === 0) {
    return 0;
  }

  const absDiff = Math.abs(valueA - valueB);
  const avg = (Math.abs(valueA) + Math.abs(valueB)) / 2;

  const raw = (absDiff / avg) * 100;
  if (!Number.isFinite(raw)) {
    throw new PercentageError('Percentage difference calculation resulted in numerical overflow', 'OVERFLOW');
  }

  return applyRounding(raw, options);
}

/**
 * Calculates what percentage a part represents of a total amount.
 *
 * Formula: `(part / total) * 100`
 *
 * @throws {PercentageError} When total is zero.
 *
 * @example
 * calculatePercentageOfTotal(25, 200); // 12.5%
 */
export function calculatePercentageOfTotal(
  part: number,
  total: number,
  options?: PercentageOptions,
): number {
  assertFiniteNumber(part, 'part', PercentageError);
  assertFiniteNumber(total, 'total', PercentageError);

  if (total === 0) {
    throw new PercentageError('Cannot calculate percentage of zero total', 'DIVISION_BY_ZERO', {
      part,
      total,
    });
  }

  const raw = (part / total) * 100;
  if (!Number.isFinite(raw)) {
    throw new PercentageError('Percentage of total calculation resulted in numerical overflow', 'OVERFLOW');
  }

  return applyRounding(raw, options);
}

/**
 * Calculates the absolute numeric change amount between an old and new value.
 *
 * Formula: `newValue - oldValue`
 *
 * @example
 * calculatePercentageChangeAmount(100, 125); // 25
 */
export function calculatePercentageChangeAmount(
  oldValue: number,
  newValue: number,
  options?: PercentageOptions,
): number {
  assertFiniteNumber(oldValue, 'oldValue', PercentageError);
  assertFiniteNumber(newValue, 'newValue', PercentageError);

  const raw = newValue - oldValue;
  return applyRounding(raw, options);
}
