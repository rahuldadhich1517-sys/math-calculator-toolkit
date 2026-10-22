import { GstError } from '../internal/errors.js';
import { round } from '../internal/rounding.js';
import { assertNonNegativeNumber } from '../internal/validation.js';
import type { GSTOptions, GSTResult } from './types.js';

/**
 * Calculates GST components, base price, and total price for both exclusive and inclusive amounts.
 *
 * Formulas:
 * - Exclusive:
 *   - `gstAmount = baseAmount * (rate / 100)`
 *   - `totalAmount = baseAmount + gstAmount`
 * - Inclusive:
 *   - `baseAmount = (grossAmount * 100) / (100 + rate)`
 *   - `gstAmount = grossAmount - baseAmount`
 * - Components:
 *   - Intra-state: `cgst = gstAmount / 2`, `sgst = gstAmount / 2`, `igst = 0`
 *   - Inter-state: `cgst = 0`, `sgst = 0`, `igst = gstAmount`
 *
 * Disclaimer:
 * This function performs mathematical tax calculations only. It does not provide legal
 * or tax advice and does not determine applicable statutory GST classifications.
 *
 * @throws {GstError} When amount or rate is negative, or invalid mode/taxType options are passed.
 *
 * @example
 * calculateGST(1000, { rate: 18, mode: 'exclusive' });
 * // { baseAmount: 1000, gstAmount: 180, totalAmount: 1180, breakdown: { cgst: 90, sgst: 90, igst: 0 } }
 */
export function calculateGST(amount: number, options: GSTOptions): GSTResult {
  if (!options || typeof options !== 'object') {
    throw new GstError('GST calculation options object is required', 'INVALID_OPTION');
  }

  assertNonNegativeNumber(amount, 'amount', GstError);
  assertNonNegativeNumber(options.rate, 'options.rate', GstError);

  const mode = options.mode ?? 'exclusive';
  if (mode !== 'exclusive' && mode !== 'inclusive') {
    throw new GstError(
      `Invalid GST calculation mode: "${String(mode)}". Supported modes: 'exclusive' | 'inclusive'`,
      'INVALID_MODE',
      { mode },
    );
  }

  const taxType = options.taxType ?? 'intra-state';
  if (taxType !== 'intra-state' && taxType !== 'inter-state') {
    throw new GstError(
      `Invalid tax type: "${String(taxType)}". Supported tax types: 'intra-state' | 'inter-state'`,
      'INVALID_OPTION',
      { taxType },
    );
  }

  const rate = options.rate;
  let rawBase: number;
  let rawGst: number;
  let rawTotal: number;

  if (mode === 'exclusive') {
    rawBase = amount;
    rawGst = (amount * rate) / 100;
    rawTotal = rawBase + rawGst;
  } else {
    rawTotal = amount;
    rawBase = (amount * 100) / (100 + rate);
    rawGst = rawTotal - rawBase;
  }

  let rawCgst = 0;
  let rawSgst = 0;
  let rawIgst = 0;

  if (taxType === 'intra-state') {
    rawCgst = rawGst / 2;
    rawSgst = rawGst / 2;
  } else {
    rawIgst = rawGst;
  }

  if (typeof options.precision === 'number') {
    const p = options.precision;
    const m = options.roundingMode;

    const baseAmount = round(rawBase, p, m);
    const gstAmount = round(rawGst, p, m);
    const totalAmount = round(rawTotal, p, m);
    const cgst = round(rawCgst, p, m);
    const sgst = round(rawSgst, p, m);
    const igst = round(rawIgst, p, m);

    return {
      mode,
      taxType,
      rate,
      baseAmount,
      gstAmount,
      totalAmount,
      breakdown: {
        cgst,
        sgst,
        igst,
      },
    };
  }

  return {
    mode,
    taxType,
    rate,
    baseAmount: rawBase,
    gstAmount: rawGst,
    totalAmount: rawTotal,
    breakdown: {
      cgst: rawCgst,
      sgst: rawSgst,
      igst: rawIgst,
    },
  };
}
