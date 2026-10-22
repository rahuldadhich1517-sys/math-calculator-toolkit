import { describe, it, expect } from 'vitest';
import { formatNumber, NumberFormatError } from '../src/number-format/index.js';

describe('NumberFormat Module', () => {
  describe('formatNumber()', () => {
    it('formats ordinary integers and decimals with en-US locale default', () => {
      const formatted = formatNumber(1234567.89, { locale: 'en-US' });
      expect(formatted).toBe('1,234,567.89');
    });

    it('formats zero and negative numbers', () => {
      expect(formatNumber(0, { locale: 'en-US' })).toBe('0');
      expect(formatNumber(-1234.5, { locale: 'en-US' })).toBe('-1,234.5');
    });

    it('formats numbers with custom fraction digits', () => {
      expect(formatNumber(1234.5678, { maximumFractionDigits: 2, locale: 'en-US' })).toBe('1,234.57');
      expect(formatNumber(1234, { minimumFractionDigits: 2, locale: 'en-US' })).toBe('1,234.00');
    });

    it('formats currencies (USD, INR, EUR, JPY)', () => {
      const usd = formatNumber(1234.56, { style: 'currency', currency: 'USD', locale: 'en-US' });
      expect(usd).toBe('$1,234.56');

      const inr = formatNumber(100000, { style: 'currency', currency: 'INR', locale: 'en-IN' });
      // en-IN format uses ₹ and Indian numbering system (1,00,000.00)
      expect(inr).toContain('1,00,000.00');

      const eur = formatNumber(1000, { style: 'currency', currency: 'EUR', locale: 'de-DE' });
      expect(eur).toContain('1.000,00');

      // JPY has 0 minor fraction digits by standard
      const jpy = formatNumber(500, { style: 'currency', currency: 'JPY', locale: 'ja-JP' });
      expect(jpy).toContain('500');
      expect(jpy).not.toContain('.00');
    });

    it('formats percentages using Intl standard (0.15 => 15%)', () => {
      expect(formatNumber(0.15, { style: 'percent', locale: 'en-US' })).toBe('15%');
      expect(formatNumber(0.125, { style: 'percent', maximumFractionDigits: 1, locale: 'en-US' })).toBe('12.5%');
    });

    it('formats compact notation (thousands, millions)', () => {
      const compact1 = formatNumber(1500, { notation: 'compact', locale: 'en-US' });
      expect(compact1).toBe('1.5K');

      const compact2 = formatNumber(2500000, { notation: 'compact', locale: 'en-US' });
      expect(compact2).toBe('2.5M');
    });

    it('supports signDisplay and useGrouping options', () => {
      const alwaysSign = formatNumber(42, { signDisplay: 'always', locale: 'en-US' });
      expect(alwaysSign).toBe('+42');

      const noGrouping = formatNumber(1000000, { useGrouping: false, locale: 'en-US' });
      expect(noGrouping).toBe('1000000');

      const minIntDigits = formatNumber(5, { minimumIntegerDigits: 3, locale: 'en-US' });
      expect(minIntDigits).toBe('005');

      const currencyCode = formatNumber(100, { style: 'currency', currency: 'USD', currencyDisplay: 'code', locale: 'en-US' });
      expect(currencyCode).toContain('USD');

      const unitFormatted = formatNumber(50, { style: 'unit', unit: 'kilometer', unitDisplay: 'long', locale: 'en-US' });
      expect(unitFormatted).toContain('kilometer');

      const compactLong = formatNumber(2000000, { notation: 'compact', compactDisplay: 'long', locale: 'en-US' });
      expect(compactLong).toContain('million');

      const engineeringNotation = formatNumber(50000, { notation: 'engineering', locale: 'en-US' });
      expect(engineeringNotation).toContain('E');

      const signExceptZero = formatNumber(0, { signDisplay: 'exceptZero', locale: 'en-US' });
      expect(signExceptZero).toBe('0');

      const roundedTrunc = formatNumber(1.239, { maximumFractionDigits: 2, roundingMode: 'trunc', locale: 'en-US' });
      const nativeRoundedTrunc = new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 2,
        roundingMode: 'trunc',
      } as Intl.NumberFormatOptions).format(1.239);
      expect(roundedTrunc).toBe(nativeRoundedTrunc);
    });

    it('rejects non-finite values (NaN, Infinity)', () => {
      // @ts-expect-error Testing NaN
      expect(() => formatNumber(NaN)).toThrow(NumberFormatError);
      // @ts-expect-error Testing Infinity
      expect(() => formatNumber(Infinity)).toThrow(NumberFormatError);
      // @ts-expect-error Testing non-numeric input
      expect(() => formatNumber('123')).toThrow(NumberFormatError);
    });

    it('rejects invalid fraction digit combinations', () => {
      expect(() =>
        formatNumber(123, { minimumFractionDigits: 4, maximumFractionDigits: 2 }),
      ).toThrow(NumberFormatError);

      expect(() => formatNumber(123, { minimumFractionDigits: -1 })).toThrow(NumberFormatError);
      expect(() => formatNumber(123, { maximumFractionDigits: -1 })).toThrow(NumberFormatError);
      expect(() => formatNumber(123, { maximumFractionDigits: 25 })).toThrow(NumberFormatError);
    });

    it('rejects invalid significant digit combinations', () => {
      expect(() =>
        formatNumber(123, { minimumSignificantDigits: 5, maximumSignificantDigits: 2 }),
      ).toThrow(NumberFormatError);

      expect(() => formatNumber(123, { minimumSignificantDigits: 0 })).toThrow(NumberFormatError);
      expect(() => formatNumber(123, { maximumSignificantDigits: 0 })).toThrow(NumberFormatError);
      expect(() => formatNumber(123, { maximumSignificantDigits: 25 })).toThrow(NumberFormatError);
    });

    it('rejects missing or invalid currency code', () => {
      expect(() => formatNumber(100, { style: 'currency' })).toThrow(/valid ISO 4217/);
      expect(() => formatNumber(100, { style: 'currency', currency: 'INVALID_CODE_123' })).toThrow(
        NumberFormatError,
      );
    });

    it('rejects missing unit when style is unit', () => {
      expect(() => formatNumber(100, { style: 'unit' })).toThrow(/valid unit identifier/);
    });

    it('rejects invalid locale strings', () => {
      expect(() => formatNumber(100, { locale: 'definitely_not_a_valid_locale_!!' })).toThrow(
        NumberFormatError,
      );
    });
  });
});
