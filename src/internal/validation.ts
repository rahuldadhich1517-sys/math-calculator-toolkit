import { ValidationError, type ToolkitErrorCode } from './errors.js';

type ErrorConstructor = new (message: string, code: ToolkitErrorCode, details?: Record<string, unknown>) => Error;

export function assertFiniteNumber(
  value: unknown,
  paramName: string,
  CustomError: ErrorConstructor = ValidationError,
): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new CustomError(
      `Parameter "${paramName}" must be a finite number. Received: ${typeof value === 'number' ? String(value) : typeof value}`,
      'NON_FINITE_NUMBER',
      { paramName, received: value },
    );
  }
}

export function assertNonNegativeNumber(
  value: unknown,
  paramName: string,
  CustomError: ErrorConstructor = ValidationError,
): asserts value is number {
  assertFiniteNumber(value, paramName, CustomError);
  if (value < 0) {
    throw new CustomError(
      `Parameter "${paramName}" must be a non-negative number (>= 0). Received: ${value}`,
      'OUT_OF_RANGE',
      { paramName, received: value },
    );
  }
}

export function assertPositiveNumber(
  value: unknown,
  paramName: string,
  CustomError: ErrorConstructor = ValidationError,
): asserts value is number {
  assertFiniteNumber(value, paramName, CustomError);
  if (value <= 0) {
    throw new CustomError(
      `Parameter "${paramName}" must be a strictly positive number (> 0). Received: ${value}`,
      'OUT_OF_RANGE',
      { paramName, received: value },
    );
  }
}

export function assertInRange(
  value: unknown,
  min: number,
  max: number,
  paramName: string,
  CustomError: ErrorConstructor = ValidationError,
): asserts value is number {
  assertFiniteNumber(value, paramName, CustomError);
  if (value < min || value > max) {
    throw new CustomError(
      `Parameter "${paramName}" must be between ${min} and ${max}. Received: ${value}`,
      'OUT_OF_RANGE',
      { paramName, received: value, min, max },
    );
  }
}

export function assertInteger(
  value: unknown,
  paramName: string,
  CustomError: ErrorConstructor = ValidationError,
): asserts value is number {
  assertFiniteNumber(value, paramName, CustomError);
  if (!Number.isInteger(value)) {
    throw new CustomError(
      `Parameter "${paramName}" must be an integer. Received: ${value}`,
      'INVALID_ARGUMENT',
      { paramName, received: value },
    );
  }
}
