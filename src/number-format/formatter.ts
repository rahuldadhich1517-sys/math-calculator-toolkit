import { NumberFormatError } from '../internal/errors.js';
import { assertFiniteNumber } from '../internal/validation.js';
import type { NumberFormatOptions } from './types.js';

/**
 * Formats a numeric value into a human-readable string using the runtime's native Intl.NumberFormat.
 *
 * Supports locale-aware formatting, currency display (INR, USD, EUR, JPY, etc.),
 * compact notation (e.g. 1.5K, 2.3M), percentage formatting, and custom fraction precision.
 *
 * Note: Formatting is purely presentation logic; it does not alter the underlying numeric value.
 * When `style: 'percent'` is used, native Intl formats 0.15 as 15%.
 *
 * @throws {NumberFormatError} On non-finite values, invalid locales, missing/invalid currency codes, or contradictory options.
 *
 * @example
 * formatNumber(1234567.89); // "1,234,567.89" (in en-US)
 * formatNumber(1500000, { notation: 'compact' }); // "1.5M"
 * formatNumber(1000, { style: 'currency', currency: 'INR', locale: 'en-IN' }); // "₹1,000.00"
 */
export function formatNumber(value: number, options: NumberFormatOptions = {}): string {
  assertFiniteNumber(value, 'value', NumberFormatError);

  if (options.minimumFractionDigits !== undefined) {
    if (
      !Number.isInteger(options.minimumFractionDigits) ||
      options.minimumFractionDigits < 0 ||
      options.minimumFractionDigits > 20
    ) {
      throw new NumberFormatError(
        `minimumFractionDigits must be an integer between 0 and 20, received: ${options.minimumFractionDigits}`,
        'INVALID_OPTION',
      );
    }
  }

  if (options.maximumFractionDigits !== undefined) {
    if (
      !Number.isInteger(options.maximumFractionDigits) ||
      options.maximumFractionDigits < 0 ||
      options.maximumFractionDigits > 20
    ) {
      throw new NumberFormatError(
        `maximumFractionDigits must be an integer between 0 and 20, received: ${options.maximumFractionDigits}`,
        'INVALID_OPTION',
      );
    }
  }

  if (
    options.minimumFractionDigits !== undefined &&
    options.maximumFractionDigits !== undefined &&
    options.minimumFractionDigits > options.maximumFractionDigits
  ) {
    throw new NumberFormatError(
      `minimumFractionDigits (${options.minimumFractionDigits}) cannot be greater than maximumFractionDigits (${options.maximumFractionDigits})`,
      'INVALID_OPTION',
    );
  }

  if (options.minimumSignificantDigits !== undefined) {
    if (
      !Number.isInteger(options.minimumSignificantDigits) ||
      options.minimumSignificantDigits < 1 ||
      options.minimumSignificantDigits > 21
    ) {
      throw new NumberFormatError(
        `minimumSignificantDigits must be an integer between 1 and 21, received: ${options.minimumSignificantDigits}`,
        'INVALID_OPTION',
      );
    }
  }

  if (options.maximumSignificantDigits !== undefined) {
    if (
      !Number.isInteger(options.maximumSignificantDigits) ||
      options.maximumSignificantDigits < 1 ||
      options.maximumSignificantDigits > 21
    ) {
      throw new NumberFormatError(
        `maximumSignificantDigits must be an integer between 1 and 21, received: ${options.maximumSignificantDigits}`,
        'INVALID_OPTION',
      );
    }
  }

  if (
    options.minimumSignificantDigits !== undefined &&
    options.maximumSignificantDigits !== undefined &&
    options.minimumSignificantDigits > options.maximumSignificantDigits
  ) {
    throw new NumberFormatError(
      `minimumSignificantDigits (${options.minimumSignificantDigits}) cannot be greater than maximumSignificantDigits (${options.maximumSignificantDigits})`,
      'INVALID_OPTION',
    );
  }

  if (options.style === 'currency') {
    if (!options.currency || typeof options.currency !== 'string') {
      throw new NumberFormatError(
        'A valid ISO 4217 currency code (e.g. "INR", "USD", "EUR") is required when style is "currency"',
        'INVALID_CURRENCY',
      );
    }
  }

  if (options.style === 'unit') {
    if (!options.unit || typeof options.unit !== 'string') {
      throw new NumberFormatError(
        'A valid unit identifier is required when style is "unit"',
        'INVALID_OPTION',
      );
    }
  }

  // Construct Intl.NumberFormatOptions object, omitting undefined properties
  const intlOptions: Intl.NumberFormatOptions = {};

  if (options.style !== undefined) intlOptions.style = options.style;
  if (options.currency !== undefined) intlOptions.currency = options.currency;
  if (options.currencyDisplay !== undefined) intlOptions.currencyDisplay = options.currencyDisplay;
  if (options.minimumIntegerDigits !== undefined) intlOptions.minimumIntegerDigits = options.minimumIntegerDigits;
  if (options.minimumFractionDigits !== undefined) intlOptions.minimumFractionDigits = options.minimumFractionDigits;
  if (options.maximumFractionDigits !== undefined) intlOptions.maximumFractionDigits = options.maximumFractionDigits;
  if (options.minimumSignificantDigits !== undefined) intlOptions.minimumSignificantDigits = options.minimumSignificantDigits;
  if (options.maximumSignificantDigits !== undefined) intlOptions.maximumSignificantDigits = options.maximumSignificantDigits;
  if (options.useGrouping !== undefined) intlOptions.useGrouping = options.useGrouping;
  if (options.notation !== undefined) intlOptions.notation = options.notation;
  if (options.compactDisplay !== undefined) intlOptions.compactDisplay = options.compactDisplay;
  if (options.signDisplay !== undefined) intlOptions.signDisplay = options.signDisplay;
  if (options.unit !== undefined) intlOptions.unit = options.unit;
  if (options.unitDisplay !== undefined) intlOptions.unitDisplay = options.unitDisplay;
  if (options.roundingMode !== undefined) {
    // TypeScript lib may require casting for recent Intl roundingMode additions
    (intlOptions as { roundingMode?: string }).roundingMode = options.roundingMode;
  }

  try {
    const formatter = new Intl.NumberFormat(options.locale, intlOptions);
    return formatter.format(value);
  } catch (err) {
    if (err instanceof RangeError) {
      if (err.message.includes('currency') || err.message.includes('Currency')) {
        throw new NumberFormatError(
          `Invalid or unsupported currency code: "${String(options.currency)}"`,
          'INVALID_CURRENCY',
          { currency: options.currency, originalError: err.message },
        );
      }
      throw new NumberFormatError(
        `Invalid formatting options or locale: ${err.message}`,
        'INVALID_OPTION',
        { originalError: err.message },
      );
    }
    throw err;
  }
}
