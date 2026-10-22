import { describe, it, expect } from 'vitest';
import { calculate, CalculatorError } from '../src/calculator/index.js';

describe('Security & Sandboxing Test Suite', () => {
  const maliciousPayloads = [
    'process.exit()',
    'require("fs")',
    'import("node:fs")',
    'alert(1)',
    'console.log("pwned")',
    'constructor.constructor("return process")()',
    'Object.keys(this)',
    'this.__proto__',
    'window.location = "http://evil.com"',
    'document.cookie',
    'eval("1 + 1")',
    'Function("return 42")()',
    'globalThis.exit()',
    'setTimeout(() => {}, 1000)',
    'x + 5',
    'a = 10',
    '1; alert(1)',
    '[1, 2, 3].map(x => x * 2)',
    '{"a": 1}',
    '"string_literal"',
    'true || false',
    'null + 5',
    'undefined',
  ];

  it.each(maliciousPayloads)('strictly rejects dangerous input: "%s"', (payload) => {
    expect(() => calculate(payload)).toThrow(CalculatorError);
  });

  it('rejects property access with dot notation on identifiers', () => {
    expect(() => calculate('Math.PI')).toThrow(CalculatorError);
    expect(() => calculate('Number.MAX_VALUE')).toThrow(CalculatorError);
  });

  it('rejects array indexing', () => {
    expect(() => calculate('2[0]')).toThrow(CalculatorError);
  });

  it('rejects bitwise and logical operators not in arithmetic grammar', () => {
    expect(() => calculate('2 & 3')).toThrow(CalculatorError);
    expect(() => calculate('2 | 3')).toThrow(CalculatorError);
    expect(() => calculate('2 << 3')).toThrow(CalculatorError);
    expect(() => calculate('2 >> 3')).toThrow(CalculatorError);
    expect(() => calculate('2 && 3')).toThrow(CalculatorError);
    expect(() => calculate('2 || 3')).toThrow(CalculatorError);
  });

  it('prevents DoS via excessively large input length', () => {
    const hugeInput = '1 + '.repeat(10000) + '1';
    expect(() => calculate(hugeInput, { maxExpressionLength: 1000 })).toThrow(
      /exceeds maximum allowed length/,
    );
  });

  it('prevents call stack overflow via deep nesting', () => {
    const deeplyNested = '('.repeat(500) + '42' + ')'.repeat(500);
    expect(() => calculate(deeplyNested, { maxDepth: 50 })).toThrow(
      /Maximum expression nesting depth/,
    );
  });
});
