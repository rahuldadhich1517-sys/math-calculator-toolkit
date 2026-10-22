import type { RoundingMode } from '../internal/rounding.js';

export type GSTMode = 'exclusive' | 'inclusive';
export type GSTTaxType = 'intra-state' | 'inter-state';

/**
 * Standard Indian GST rate tiers (for reference/convenience only).
 * Note: These presets do NOT constitute legal tax advice or product classification.
 */
export const GST_RATE_PRESETS = [0, 5, 12, 18, 28] as const;
export type GSTRatePreset = (typeof GST_RATE_PRESETS)[number];

export interface GSTBreakdown {
  /**
   * Central Goods and Services Tax (half of GST for intra-state transactions).
   */
  cgst: number;

  /**
   * State Goods and Services Tax (half of GST for intra-state transactions).
   */
  sgst: number;

  /**
   * Integrated Goods and Services Tax (full GST for inter-state transactions).
   */
  igst: number;
}

export interface GSTOptions {
  /**
   * The GST tax rate in percent (e.g. 18 for 18%).
   */
  rate: number;

  /**
   * Whether the input amount is GST-exclusive or GST-inclusive.
   * @default 'exclusive'
   */
  mode?: GSTMode;

  /**
   * Whether the transaction is intra-state (split CGST/SGST) or inter-state (IGST).
   * @default 'intra-state'
   */
  taxType?: GSTTaxType;

  /**
   * Optional number of decimal places to round amounts.
   */
  precision?: number;

  /**
   * Rounding mode to apply when precision is specified.
   * @default 'half-up'
   */
  roundingMode?: RoundingMode;
}

export interface GSTResult {
  /**
   * Calculation mode used ('exclusive' or 'inclusive').
   */
  mode: GSTMode;

  /**
   * Tax transaction type ('intra-state' or 'inter-state').
   */
  taxType: GSTTaxType;

  /**
   * The applicable GST tax rate in percent.
   */
  rate: number;

  /**
   * The net base price before tax.
   */
  baseAmount: number;

  /**
   * The total GST tax amount.
   */
  gstAmount: number;

  /**
   * The gross total price including tax.
   */
  totalAmount: number;

  /**
   * Detailed tax component breakdown.
   */
  breakdown: GSTBreakdown;
}
