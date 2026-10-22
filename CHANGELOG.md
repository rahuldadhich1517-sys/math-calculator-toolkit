# Changelog

All notable changes to `@rahul_dadhich15/math-calculator-toolkit` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-10-22

### Added
- **Core Calculator Engine (`/calculator`)**:
  - Safe, dependency-free recursive-descent expression parser (`calculate`).
  - Zero `eval()`, zero `Function()`, and strict lexical sandboxing against arbitrary code execution.
  - Full support for `+`, `-`, `*`, `/`, `%` (remainder), and `^` / `**` (exponentiation with right-associativity).
  - Explicit operator precedence, parentheses nesting with recursion limits, unary plus/minus, and scientific notation.
  - Standalone arithmetic primitives: `add`, `subtract`, `multiply`, `divide`, `modulo`, and `power`.
- **Percentage Calculations (`/percentage`)**:
  - `calculatePercentage` for standard percentage of a value.
  - `calculatePercentageChange` for relative percentage change from old to new values, strictly handling zero-denominator starting values.
  - `calculatePercentageDifference` for symmetrical relative difference between two quantities.
  - `calculatePercentageOfTotal` and `calculatePercentageChangeAmount`.
- **Discount & Pricing Engine (`/discount`)**:
  - `calculateDiscount` providing structured breakdowns: original price, discount percentage, discount amount, final payable price, and savings percentage.
  - Configurable precision and rounding mode options.
- **Indian Goods and Services Tax (`/gst`)**:
  - `calculateGST` supporting both GST-exclusive base pricing and GST-inclusive gross pricing.
  - Intra-state CGST / SGST 50-50 splits and inter-state IGST tax assignment.
  - Predefined reference rates `[0, 5, 12, 18, 28]%` (`GST_RATE_PRESETS`).
- **Loan EMI Calculator (`/emi`)**:
  - `calculateEMI` computing standard amortizing loan payments.
  - Explicit support for month-based and year-based tenure units.
  - Exact zero-interest loan support without division-by-zero errors.
  - Comprehensive breakdown: monthly EMI, total interest, and total repayment amount.
- **Localized Number Formatter (`/number-format`)**:
  - `formatNumber` leveraging native ECMAScript `Intl.NumberFormat`.
  - Locale-aware thousands grouping and decimal separators.
  - Currency formatting across ISO 4217 codes (e.g., INR, USD, EUR, JPY) with correct minor-unit handling.
  - Compact notation (`1.5M`, `2K`) and percentage display.
- **Typed Error Hierarchy**:
  - Base `MathToolkitError` with standardized error codes.
  - Granular subclasses: `ValidationError`, `CalculatorError`, `PercentageError`, `DiscountError`, `GstError`, `EmiError`, and `NumberFormatError`.
- **Packaging & Build**:
  - Dual module distribution (ESM and CommonJS) via `tsup`.
  - Full TypeScript declaration files (`.d.ts` and `.d.cts`) with declaration sourcemaps.
  - Granular subpath exports configured in `package.json`.
  - GitHub Actions CI workflow covering Node.js 18.x, 20.x, and 22.x.
