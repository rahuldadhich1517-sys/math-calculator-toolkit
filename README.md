# @rahul_dadhich15/math-calculator-toolkit

> Production-ready, dependency-free TypeScript toolkit for safe arithmetic expression evaluation, percentage calculations, discounts, Indian GST, loan EMI amortization, and localized number formatting.

[![CI](https://github.com/rahuldadhich1517-sys/math-calculator-toolkit/actions/workflows/ci.yml/badge.svg)](https://github.com/rahuldadhich1517-sys/math-calculator-toolkit/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)]()

---

## Table of Contents

1. [Package Overview](#package-overview)
2. [Features](#features)
3. [Installation](#installation)
4. [Quick Start](#quick-start)
5. [Calculator — Safe Arithmetic Expressions](#calculator--safe-arithmetic-expressions)
6. [Percentage — Calculations & Changes](#percentage--calculations--changes)
7. [Discount — Pricing & Breakdowns](#discount--pricing--breakdowns)
8. [GST — Goods & Services Tax (India)](#gst--goods--services-tax-india)
9. [EMI — Amortizing Loan Payments](#emi--amortizing-loan-payments)
10. [Number Formatting — Localized Intl](#number-formatting--localized-intl)
11. [API Reference](#api-reference)
12. [TypeScript Usage & Subpath Exports](#typescript-usage--subpath-exports)
13. [Input Validation & Error Handling](#input-validation--error-handling)
14. [Numerical Precision & Rounding Policy](#numerical-precision--rounding-policy)
15. [Security & Sandboxing](#security--sandboxing)
16. [Performance Considerations](#performance-considerations)
17. [Development & Testing](#development--testing)
18. [Build & Packaging Verification](#build--packaging-verification)
19. [Supported Environments](#supported-environments)
20. [Known Limitations](#known-limitations)
21. [Legal & Financial Disclaimers](#legal--financial-disclaimers)
22. [Contribution Instructions](#contribution-instructions)
23. [License](#license)
24. [Changelog](#changelog)

---

## Package Overview

`@rahul_dadhich15/math-calculator-toolkit` is an enterprise-grade numerical computing library engineered for modern Node.js and web applications. It provides six modular, self-contained mathematical utilities:

- **Calculator**: Pure recursive-descent math parser (zero `eval`, zero code execution).
- **Percentage**: Percentage calculations, percentage change, and symmetric percentage difference.
- **Discount**: Single and promotional discount breakdowns with customizable rounding.
- **GST**: Indian Goods & Services Tax engine supporting GST-exclusive and GST-inclusive pricing, alongside intra-state CGST/SGST splits and inter-state IGST.
- **EMI**: Standard amortizing loan payment calculator supporting monthly/annual tenures and zero-rate loans.
- **Number Format**: High-performance human-readable number formatting wrapping native `Intl.NumberFormat`.

---

## Features

- **Zero Runtime Dependencies**: Ultra-lightweight footprint with zero external dependency overhead or supply chain risk.
- **Strict Security Guarantee**: Expression parser built strictly from lexical tokens; inputs like `process.exit()`, `require()`, `alert(1)`, or `constructor.constructor` cannot execute.
- **Full TypeScript Type Safety**: Compiled with strict null checks, explicit return types, and complete declaration definitions (`.d.ts` and `.d.cts`).
- **Dual Module Output**: Native ESM and CommonJS support with dedicated modular subpath exports.
- **Exhaustively Tested**: >96% branch coverage and >99% statement coverage across unit, property, invariant, and security test suites.

---

## Installation

```bash
# Using npm
npm install @rahul_dadhich15/math-calculator-toolkit

# Using pnpm
pnpm add @rahul_dadhich15/math-calculator-toolkit

# Using yarn
yarn add @rahul_dadhich15/math-calculator-toolkit
```

---

## Quick Start

```ts
import {
  calculate,
  calculatePercentage,
  calculateDiscount,
  calculateGST,
  calculateEMI,
  formatNumber,
} from '@rahul_dadhich15/math-calculator-toolkit';

// 1. Safe expression evaluation
const invoiceSubtotal = calculate('(45 * 12) + (18.5 * 4)'); // 614

// 2. Promotional discount
const discount = calculateDiscount(invoiceSubtotal, 10, { precision: 2 });
// discount.finalPrice => 552.6

// 3. Indian GST (18% exclusive)
const gst = calculateGST(discount.finalPrice, { rate: 18, mode: 'exclusive', precision: 2 });
// gst.totalAmount => 652.07, breakdown: { cgst: 49.73, sgst: 49.73, igst: 0 }

// 4. Currency presentation
const formatted = formatNumber(gst.totalAmount, {
  style: 'currency',
  currency: 'INR',
  locale: 'en-IN',
});
// "₹652.07"
```

---

## Calculator — Safe Arithmetic Expressions

Evaluates mathematical strings safely without invoking dynamic JavaScript execution.

### Supported Operators & Precedence

| Precedence | Operator | Description | Associativity | Example |
|---|---|---|---|---|
| **1 (Highest)** | `( ... )` | Parentheses grouping | N/A | `(2 + 3) * 4 => 20` |
| **2** | `^`, `**` | Exponentiation | **Right** | `2 ^ 3 ^ 2 => 512` |
| **3** | `+`, `-` | Unary positive and negation | Right | `-5 + 8 => 3`, `-(2^2) => -4` |
| **4** | `*`, `/`, `%` | Multiplication, Division, Remainder | Left | `10 % 3 => 1`, `10 / 2 => 5` |
| **5 (Lowest)** | `+`, `-` | Binary addition and subtraction | Left | `2 + 3 * 4 => 14` |

### Examples

```ts
import { calculate, add, multiply } from '@rahul_dadhich15/math-calculator-toolkit/calculator';

calculate('2 + 3 * 4');                 // 14
calculate('(2 + 3) * 4');               // 20
calculate('10 / 2');                    // 5
calculate('-5 + 8');                    // 3
calculate('2.5 * 4');                   // 10
calculate('2 ^ 3 ^ 2');                 // 512 (right-associative: 2 ^ 9)
calculate('10 / 3', { precision: 2 });  // 3.33

// Individual arithmetic primitives
add(15, 25);       // 40
multiply(4, 2.5);  // 10
```

---

## Percentage — Calculations & Changes

```ts
import {
  calculatePercentage,
  calculatePercentageChange,
  calculatePercentageDifference,
  calculatePercentageOfTotal,
} from '@rahul_dadhich15/math-calculator-toolkit/percentage';

// 1. Percentage of a value: (value * percentage) / 100
calculatePercentage(200, 15); // 30
calculatePercentage(80, 12.5); // 10

// 2. Percentage change: ((new - old) / old) * 100
calculatePercentageChange(100, 150); // 50 (50% increase)
calculatePercentageChange(100, 75);  // -25 (25% decrease)

// Note: Starting from 0 throws a PercentageError unless fallback is specified:
calculatePercentageChange(0, 100, { zeroOldValueFallback: 0 }); // 0

// 3. Symmetrical percentage difference
calculatePercentageDifference(100, 120, { precision: 2 }); // 18.18%

// 4. Percentage of total: (part / total) * 100
calculatePercentageOfTotal(25, 200); // 12.5%
```

---

## Discount — Pricing & Breakdowns

Computes standard commercial discounts with non-negative validation and structured breakdowns.

```ts
import { calculateDiscount } from '@rahul_dadhich15/math-calculator-toolkit/discount';

const result = calculateDiscount(1000, 20, { precision: 2 });

console.log(result);
// {
//   originalPrice: 1000,
//   discountPercentage: 20,
//   discountAmount: 200,
//   finalPrice: 800,
//   savingsPercentage: 20
// }
```

---

## GST — Goods & Services Tax (India)

Computes GST for both exclusive prices (tax added on top) and inclusive prices (tax extracted from gross total).

```ts
import { calculateGST, GST_RATE_PRESETS } from '@rahul_dadhich15/math-calculator-toolkit/gst';

// Exclusive: Base price ₹10,000 + 18% GST (Intra-state split: 9% CGST + 9% SGST)
const exclusive = calculateGST(10000, {
  rate: 18,
  mode: 'exclusive',
  taxType: 'intra-state',
  precision: 2,
});
// {
//   mode: 'exclusive',
//   taxType: 'intra-state',
//   rate: 18,
//   baseAmount: 10000,
//   gstAmount: 1800,
//   totalAmount: 11800,
//   breakdown: { cgst: 900, sgst: 900, igst: 0 }
// }

// Inclusive: Gross price ₹11,800 contains 18% GST (Inter-state IGST)
const inclusive = calculateGST(11800, {
  rate: 18,
  mode: 'inclusive',
  taxType: 'inter-state',
  precision: 2,
});
// {
//   mode: 'inclusive',
//   taxType: 'inter-state',
//   rate: 18,
//   baseAmount: 10000,
//   gstAmount: 1800,
//   totalAmount: 11800,
//   breakdown: { cgst: 0, sgst: 0, igst: 1800 }
// }
```

---

## EMI — Amortizing Loan Payments

Calculates monthly installments for standard amortizing loans under compound interest, correctly handling 0% interest loans without division-by-zero.

Formula:
$$r = \frac{\text{annualInterestRate}}{12 \times 100}, \quad n = \text{tenureInMonths}$$
$$\text{EMI} = \frac{P \times r \times (1 + r)^n}{(1 + r)^n - 1}$$

```ts
import { calculateEMI } from '@rahul_dadhich15/math-calculator-toolkit/emi';

// Home loan: ₹5,000,000 at 8.75% for 20 years
const loan = calculateEMI(5000000, 8.75, 20, {
  tenureUnit: 'years',
  precision: 2,
});

console.log(loan);
// {
//   principal: 5000000,
//   annualInterestRate: 8.75,
//   monthlyInterestRate: 0.007291666666666667,
//   tenureInMonths: 240,
//   monthlyEMI: 44185.74,
//   totalRepayment: 10604577.6,
//   totalInterest: 5604577.6
// }

// Zero interest promo: ₹60,000 for 12 months
const zeroInterest = calculateEMI(60000, 0, 12);
// zeroInterest.monthlyEMI => 5000, totalInterest => 0
```

---

## Number Formatting — Localized Intl

Utilizes the runtime's native `Intl.NumberFormat` for high-performance localized string rendering.

```ts
import { formatNumber } from '@rahul_dadhich15/math-calculator-toolkit/number-format';

// Standard formatting
formatNumber(1234567.89, { locale: 'en-US' }); // "1,234,567.89"
formatNumber(1234567.89, { locale: 'de-DE' }); // "1.234.567.89"

// Currency formatting
formatNumber(100000, { style: 'currency', currency: 'INR', locale: 'en-IN' }); // "₹1,00,000.00"
formatNumber(1234.5, { style: 'currency', currency: 'USD', locale: 'en-US' });  // "$1,234.50"
formatNumber(500, { style: 'currency', currency: 'JPY', locale: 'ja-JP' });    // "￥500"

// Compact notation
formatNumber(1500000, { notation: 'compact', locale: 'en-US' }); // "1.5M"
formatNumber(2500, { notation: 'compact', locale: 'en-US' });    // "2.5K"

// Percentage
formatNumber(0.18, { style: 'percent', locale: 'en-US' }); // "18%"
```

---

## API Reference

### Calculator (`/calculator`)
- `calculate(expression: string, options?: CalculatorOptions): number`
- `add(a: number, b: number): number`
- `subtract(a: number, b: number): number`
- `multiply(a: number, b: number): number`
- `divide(a: number, b: number): number`
- `modulo(a: number, b: number): number`
- `power(base: number, exponent: number): number`

### Percentage (`/percentage`)
- `calculatePercentage(value: number, percentage: number, options?: PercentageOptions): number`
- `calculatePercentageChange(oldValue: number, newValue: number, options?: PercentageChangeOptions): number`
- `calculatePercentageDifference(valueA: number, valueB: number, options?: PercentageOptions): number`
- `calculatePercentageOfTotal(part: number, total: number, options?: PercentageOptions): number`
- `calculatePercentageChangeAmount(oldValue: number, newValue: number, options?: PercentageOptions): number`

### Discount (`/discount`)
- `calculateDiscount(originalPrice: number, discountPercentage: number, options?: DiscountOptions): DiscountResult`

### GST (`/gst`)
- `calculateGST(amount: number, options: GSTOptions): GSTResult`
- `GST_RATE_PRESETS`: readonly `[0, 5, 12, 18, 28]`

### EMI (`/emi`)
- `calculateEMI(principal: number, annualInterestRate: number, tenure: number, options?: EMIOptions): EMIResult`

### Number Format (`/number-format`)
- `formatNumber(value: number, options?: NumberFormatOptions): string`

---

## TypeScript Usage & Subpath Exports

This package exposes clean subpath imports allowing bundlers and runtimes to tree-shake unused code:

```ts
// Full root import
import { calculate, calculateGST } from '@rahul_dadhich15/math-calculator-toolkit';

// Or dedicated subpath imports
import { calculate } from '@rahul_dadhich15/math-calculator-toolkit/calculator';
import { calculatePercentage } from '@rahul_dadhich15/math-calculator-toolkit/percentage';
import { calculateDiscount } from '@rahul_dadhich15/math-calculator-toolkit/discount';
import { calculateGST } from '@rahul_dadhich15/math-calculator-toolkit/gst';
import { calculateEMI } from '@rahul_dadhich15/math-calculator-toolkit/emi';
import { formatNumber } from '@rahul_dadhich15/math-calculator-toolkit/number-format';
```

---

## Input Validation & Error Handling

All public functions validate runtime arguments and throw structured, typed errors inheriting from `MathToolkitError`:

```ts
import { MathToolkitError, CalculatorError, EmiError } from '@rahul_dadhich15/math-calculator-toolkit';

try {
  calculate('10 / 0');
} catch (error) {
  if (error instanceof CalculatorError) {
    console.error(error.message); // "Division by zero is undefined"
    console.error(error.code);    // "DIVISION_BY_ZERO"
    console.error(error.details); // { position: 3 }
  }
}
```

### Error Code Reference
- `INVALID_ARGUMENT`: Non-number, NaN, or non-finite arguments.
- `OUT_OF_RANGE`: Number outside allowed boundaries (e.g. negative prices or loan tenure > 100 years).
- `DIVISION_BY_ZERO`: Attempted division or modulo by zero.
- `SYNTAX_ERROR`: Malformed mathematical expressions or mismatched parentheses.
- `UNEXPECTED_TOKEN`: Disallowed identifiers or characters detected.
- `OVERFLOW`: Value exceeded IEEE-754 finite numerical limits.
- `ZERO_OLD_VALUE`: Undefined percentage change starting from zero.
- `INVALID_MODE`: Unsupported calculation mode.
- `INVALID_TENURE`: Non-integer payment cycle resolution.
- `INVALID_CURRENCY`: Unknown or missing ISO 4217 currency code.

---

## Numerical Precision & Rounding Policy

### Floating-Point Arithmetic
JavaScript numbers follow the IEEE-754 binary double-precision standard. Binary representation artifacts (such as `0.1 + 0.2 === 0.30000000000000004`) are inherent to standard JavaScript floating-point numbers.

### Rounding Policy
1. **Raw Calculations**: Unless the `precision` option is explicitly passed, all helpers return unrounded floating-point calculations.
2. **Intermediate Precision**: Intermediate calculations are never rounded silently, avoiding cumulative rounding drift.
3. **Decimals Rounding**: When `precision` is passed, the toolkit uses exponential scaling (`value + "e" + decimals`) to avoid binary rounding artifacts before applying the chosen rounding algorithm (`half-up`, `half-even`, `floor`, `ceil`, or `trunc`).

---

## Security & Sandboxing

The expression engine does **NOT** use `eval()`, `new Function()`, or dynamic code evaluation. It uses a handwritten recursive-descent parser:

- **Token Allow-list**: Only numeric literals, whitespace, parentheses, and arithmetic operator tokens are accepted.
- **Identifier Rejection**: Character sequences that resemble identifiers, variables, or function names are immediately rejected at scan time.
- **DoS Protection**: Max expression length (default: 10,000 characters) and max parentheses nesting depth (default: 100 levels) protect against resource exhaustion.

---

## Performance Considerations

- **Zero Allocation in Critical Paths**: The tokenizer processes inputs in a single linear pass $O(N)$.
- **Referential Determinism**: Every function is pure with zero side-effects.
- **Native Platform Capabilities**: Relies directly on V8/JavaScript engine optimizations (`Math`, `Intl`).

---

## Development & Testing

```bash
# Install dependencies
npm install

# Run static type checking
npm run typecheck

# Run test suite with Vitest
npm run test:run

# Run test suite with coverage report
npm run test:coverage

# Build distributable bundles (ESM, CJS, d.ts)
npm run build
```

---

## Build & Packaging Verification

```bash
# Verify npm packaging contents
npm pack --dry-run
```

---

## Supported Environments

- **Node.js**: >= 18.0.0 (Tested against 18.x, 20.x, and 22.x).
- **Browsers**: Modern evergreen browsers supporting ES2022 and native `Intl.NumberFormat`.
- **Runtimes**: Bun, Deno, Cloudflare Workers, AWS Lambda.

---

## Known Limitations

- **Floating-Point Limits**: Calculations operate on 64-bit IEEE-754 floats. Values beyond $\approx 1.79 \times 10^{308}$ overflow to `OVERFLOW` errors.
- **Amortization Assumption**: The EMI model assumes standard periodic compounding without prepayment penalties or irregular payment schedules.
- **Presentation vs Settlement**: `formatNumber` formats strings for display; it does not replace financial ledger rounding rules.

---

## Legal & Financial Disclaimers

> [!IMPORTANT]
> **No Financial or Tax Advice**:
> The calculations provided by this library are mathematical estimations. GST calculation rates and classifications do not determine statutory tax liability. Loan EMI amortization outputs do not constitute formal lending agreements or loan offers. Consult a certified financial advisor or legal professional for commercial transactions.

---

## Contribution Instructions

Contributions are welcome! Please ensure that:
1. All changes maintain strict TypeScript types.
2. New features include comprehensive Vitest test coverage (>95%).
3. Code adheres to zero runtime dependencies.
4. Run `npm run typecheck`, `npm run test:coverage`, and `npm run build` before opening a pull request.

---

## License

MIT © [Rahul Dadhich](LICENSE)

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for full version history and release notes.
