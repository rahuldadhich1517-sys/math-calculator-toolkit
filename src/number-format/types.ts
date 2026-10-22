export interface NumberFormatOptions {
  /**
   * BCP 47 language tag or array of language tags.
   * Defaults to host runtime locale (or 'en-US' / system default).
   */
  locale?: string | string[];

  /**
   * Formatting style to use.
   * @default 'decimal'
   */
  style?: 'decimal' | 'currency' | 'percent' | 'unit';

  /**
   * ISO 4217 3-letter currency code (e.g. 'INR', 'USD', 'EUR', 'JPY').
   * Required when `style` is 'currency'.
   */
  currency?: string;

  /**
   * How to display the currency in currency formatting.
   * @default 'symbol'
   */
  currencyDisplay?: 'symbol' | 'narrowSymbol' | 'code' | 'name';

  /**
   * Minimum number of integer digits to use (1 to 21).
   */
  minimumIntegerDigits?: number;

  /**
   * Minimum number of fraction digits to use (0 to 20).
   */
  minimumFractionDigits?: number;

  /**
   * Maximum number of fraction digits to use (0 to 20).
   */
  maximumFractionDigits?: number;

  /**
   * Minimum number of significant digits to use (1 to 21).
   */
  minimumSignificantDigits?: number;

  /**
   * Maximum number of significant digits to use (1 to 21).
   */
  maximumSignificantDigits?: number;

  /**
   * Whether to use grouping separators (e.g. thousands separators).
   * @default true
   */
  useGrouping?: boolean;

  /**
   * Formatting notation.
   * @default 'standard'
   */
  notation?: 'standard' | 'scientific' | 'engineering' | 'compact';

  /**
   * Used only when notation is 'compact'.
   * @default 'short'
   */
  compactDisplay?: 'short' | 'long';

  /**
   * When to display the sign for the number.
   * @default 'auto'
   */
  signDisplay?: 'auto' | 'never' | 'always' | 'exceptZero';

  /**
   * Core unit identifier (e.g. 'kilometer', 'celsius', 'percent').
   * Required when `style` is 'unit'.
   */
  unit?: string;

  /**
   * How to display the unit.
   * @default 'short'
   */
  unitDisplay?: 'short' | 'long' | 'narrow';

  /**
   * Rounding mode recognized by ECMAScript Intl.NumberFormat.
   */
  roundingMode?:
    | 'ceil'
    | 'floor'
    | 'expand'
    | 'trunc'
    | 'halfCeil'
    | 'halfFloor'
    | 'halfExpand'
    | 'halfTrunc'
    | 'halfEven';
}
