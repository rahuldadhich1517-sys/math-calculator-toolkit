import { EmiError } from '../internal/errors.js';
import { round } from '../internal/rounding.js';
import { assertNonNegativeNumber, assertPositiveNumber } from '../internal/validation.js';
import type { EMIOptions, EMIResult } from './types.js';

const MAX_TENURE_MONTHS = 1200; // 100 years

/**
 * Calculates Equated Monthly Installment (EMI) for standard amortizing loans.
 *
 * Formulas:
 * - `r = annualInterestRate / 12 / 100` (monthly interest rate)
 * - `n = tenure in months`
 * - When `r === 0`:
 *   - `EMI = principal / n`
 *   - `totalRepayment = principal`
 *   - `totalInterest = 0`
 * - When `r > 0`:
 *   - `EMI = (P * r * (1 + r)^n) / ((1 + r)^n - 1)`
 *   - `totalRepayment = EMI * n`
 *   - `totalInterest = totalRepayment - principal`
 *
 * Disclaimer:
 * This calculation is a mathematical amortization model. Actual lender terms,
 * processing fees, insurance charges, and prepayment terms may vary.
 *
 * @throws {EmiError} When principal <= 0, interest < 0, tenure <= 0, non-integer months, or overflow.
 *
 * @example
 * calculateEMI(1000000, 8.5, 20, { tenureUnit: 'years' });
 */
export function calculateEMI(
  principal: number,
  annualInterestRate: number,
  tenure: number,
  options?: EMIOptions,
): EMIResult {
  assertPositiveNumber(principal, 'principal', EmiError);
  assertNonNegativeNumber(annualInterestRate, 'annualInterestRate', EmiError);
  assertPositiveNumber(tenure, 'tenure', EmiError);

  const tenureUnit = options?.tenureUnit ?? 'months';
  if (tenureUnit !== 'months' && tenureUnit !== 'years') {
    throw new EmiError(
      `Invalid tenureUnit: "${String(tenureUnit)}". Supported units: 'months' | 'years'`,
      'INVALID_TENURE',
      { tenureUnit },
    );
  }

  const rawTenureMonths = tenureUnit === 'years' ? tenure * 12 : tenure;
  if (!Number.isInteger(rawTenureMonths)) {
    throw new EmiError(
      `Tenure must resolve to a whole number of monthly payment cycles. Received: ${rawTenureMonths} months`,
      'INVALID_TENURE',
      { tenure, tenureUnit, rawTenureMonths },
    );
  }

  const tenureInMonths = rawTenureMonths;
  if (tenureInMonths > MAX_TENURE_MONTHS) {
    throw new EmiError(
      `Tenure of ${tenureInMonths} months exceeds the maximum supported duration of ${MAX_TENURE_MONTHS} months (100 years)`,
      'OUT_OF_RANGE',
      { tenureInMonths, maxTenureMonths: MAX_TENURE_MONTHS },
    );
  }

  const monthlyInterestRate = annualInterestRate / 12 / 100;
  let rawEmi: number;
  let rawTotalRepayment: number;
  let rawTotalInterest: number;

  if (annualInterestRate === 0) {
    rawEmi = principal / tenureInMonths;
    rawTotalRepayment = principal;
    rawTotalInterest = 0;
  } else {
    const factor = Math.pow(1 + monthlyInterestRate, tenureInMonths);
    if (!Number.isFinite(factor) || factor <= 1) {
      throw new EmiError('Interest rate and tenure calculation resulted in numerical overflow', 'OVERFLOW');
    }

    rawEmi = (principal * monthlyInterestRate * factor) / (factor - 1);
    if (!Number.isFinite(rawEmi)) {
      throw new EmiError('EMI calculation resulted in numerical overflow', 'OVERFLOW');
    }

    rawTotalRepayment = rawEmi * tenureInMonths;
    rawTotalInterest = Math.max(0, rawTotalRepayment - principal);
  }

  if (typeof options?.precision === 'number') {
    const p = options.precision;
    const m = options.roundingMode;

    const monthlyEMI = round(rawEmi, p, m);
    const totalRepayment = round(rawTotalRepayment, p, m);
    const totalInterest = round(rawTotalInterest, p, m);

    return {
      principal,
      annualInterestRate,
      monthlyInterestRate,
      tenureInMonths,
      monthlyEMI,
      totalRepayment,
      totalInterest,
    };
  }

  return {
    principal,
    annualInterestRate,
    monthlyInterestRate,
    tenureInMonths,
    monthlyEMI: rawEmi,
    totalRepayment: rawTotalRepayment,
    totalInterest: rawTotalInterest,
  };
}
