export type ToolkitErrorCode =
  | 'INVALID_ARGUMENT'
  | 'NON_FINITE_NUMBER'
  | 'OUT_OF_RANGE'
  | 'DIVISION_BY_ZERO'
  | 'SYNTAX_ERROR'
  | 'UNEXPECTED_TOKEN'
  | 'OVERFLOW'
  | 'EXPRESSION_TOO_LONG'
  | 'MAX_DEPTH_EXCEEDED'
  | 'ZERO_OLD_VALUE'
  | 'INVALID_MODE'
  | 'INVALID_TENURE'
  | 'INVALID_LOCALE'
  | 'INVALID_CURRENCY'
  | 'INVALID_OPTION';

export class MathToolkitError extends Error {
  readonly code: ToolkitErrorCode;
  readonly details?: Record<string, unknown> | undefined;

  constructor(message: string, code: ToolkitErrorCode, details?: Record<string, unknown>) {
    super(message);
    this.name = 'MathToolkitError';
    this.code = code;
    this.details = details;

    // Maintain proper prototype chain for instanceof checks in all environments
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends MathToolkitError {
  constructor(message: string, code: ToolkitErrorCode = 'INVALID_ARGUMENT', details?: Record<string, unknown>) {
    super(message, code, details);
    this.name = 'ValidationError';
  }
}

export class CalculatorError extends MathToolkitError {
  constructor(message: string, code: ToolkitErrorCode = 'SYNTAX_ERROR', details?: Record<string, unknown>) {
    super(message, code, details);
    this.name = 'CalculatorError';
  }
}

export class PercentageError extends MathToolkitError {
  constructor(message: string, code: ToolkitErrorCode = 'INVALID_ARGUMENT', details?: Record<string, unknown>) {
    super(message, code, details);
    this.name = 'PercentageError';
  }
}

export class DiscountError extends MathToolkitError {
  constructor(message: string, code: ToolkitErrorCode = 'INVALID_ARGUMENT', details?: Record<string, unknown>) {
    super(message, code, details);
    this.name = 'DiscountError';
  }
}

export class GstError extends MathToolkitError {
  constructor(message: string, code: ToolkitErrorCode = 'INVALID_ARGUMENT', details?: Record<string, unknown>) {
    super(message, code, details);
    this.name = 'GstError';
  }
}

export class EmiError extends MathToolkitError {
  constructor(message: string, code: ToolkitErrorCode = 'INVALID_ARGUMENT', details?: Record<string, unknown>) {
    super(message, code, details);
    this.name = 'EmiError';
  }
}

export class NumberFormatError extends MathToolkitError {
  constructor(message: string, code: ToolkitErrorCode = 'INVALID_ARGUMENT', details?: Record<string, unknown>) {
    super(message, code, details);
    this.name = 'NumberFormatError';
  }
}
