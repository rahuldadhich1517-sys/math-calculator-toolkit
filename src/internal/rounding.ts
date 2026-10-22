import { ValidationError } from './errors.js';

export type RoundingMode = 'half-up' | 'half-even' | 'ceil' | 'floor' | 'trunc';

/**
 * Rounds a finite number to the specified number of decimal places using the given rounding mode.
 * Utilizes exponential notation to avoid IEEE-754 representation pitfalls (e.g. 1.005 rounded to 2 places).
 */
export function round(value: number, decimalPlaces = 2, mode: RoundingMode = 'half-up'): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new ValidationError(`Cannot round non-finite value: ${String(value)}`, 'NON_FINITE_NUMBER');
  }
  if (!Number.isInteger(decimalPlaces) || decimalPlaces < 0 || decimalPlaces > 20) {
    throw new ValidationError(
      `decimalPlaces must be an integer between 0 and 20, received: ${decimalPlaces}`,
      'INVALID_ARGUMENT',
    );
  }

  if (value === 0) {
    return 0;
  }

  // Use exponent notation to shift the decimal point without floating-point multiplier drift
  const parts = value.toString().split('e');
  const currentExp = parts[1] ? +parts[1] : 0;
  const shifted = +(parts[0]! + 'e' + (currentExp + decimalPlaces));

  let roundedShifted: number;
  switch (mode) {
    case 'half-up':
      // Arithmetic round half away from zero (standard commercial/financial rounding)
      roundedShifted = Math.sign(shifted) * Math.round(Math.abs(shifted));
      break;

    case 'half-even': {
      // Banker's rounding: round half to nearest even integer
      const floor = Math.floor(shifted);
      const diff = shifted - floor;
      const epsilon = 1e-12;

      if (Math.abs(diff - 0.5) < epsilon) {
        roundedShifted = floor % 2 === 0 ? floor : floor + 1;
      } else {
        roundedShifted = Math.round(shifted);
      }
      break;
    }

    case 'ceil':
      roundedShifted = Math.ceil(shifted);
      break;

    case 'floor':
      roundedShifted = Math.floor(shifted);
      break;

    case 'trunc':
      roundedShifted = Math.trunc(shifted);
      break;

    default:
      throw new ValidationError(`Unsupported rounding mode: ${String(mode)}`, 'INVALID_OPTION');
  }

  // Shift back
  const shiftedParts = roundedShifted.toString().split('e');
  const shiftedExp = shiftedParts[1] ? +shiftedParts[1] : 0;
  const result = +(shiftedParts[0]! + 'e' + (shiftedExp - decimalPlaces));

  // Normalize negative zero
  return result || 0;
}
