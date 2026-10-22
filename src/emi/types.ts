import type { RoundingMode } from '../internal/rounding.js';

export type TenureUnit = 'months' | 'years';

export interface EMIOptions {
  /**
   * Unit for the tenure parameter.
   * @default 'months'
   */
  tenureUnit?: TenureUnit;

  /**
   * Optional number of decimal places to round the monetary amounts.
   */
  precision?: number;

  /**
   * Rounding mode to apply when precision is specified.
   * @default 'half-up'
   */
  roundingMode?: RoundingMode;
}

export interface EMIResult {
  /**
   * The loan principal amount borrowed.
   */
  principal: number;

  /**
   * The annual interest rate in percent.
   */
  annualInterestRate: number;

  /**
   * The monthly interest rate as a decimal (annualInterestRate / 12 / 100).
   */
  monthlyInterestRate: number;

  /**
   * Total loan duration converted to whole months.
   */
  tenureInMonths: number;

  /**
   * The calculated monthly installment amount.
   */
  monthlyEMI: number;

  /**
   * The total repayment amount over the loan duration (monthlyEMI * tenureInMonths).
   */
  totalRepayment: number;

  /**
   * Total interest payable over the loan duration (totalRepayment - principal).
   */
  totalInterest: number;
}
