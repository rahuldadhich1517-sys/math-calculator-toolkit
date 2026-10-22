import { CalculatorError } from '../internal/errors.js';
import type { CalculatorOptions } from './types.js';

type TokenType =
  | 'NUMBER'
  | 'PLUS'
  | 'MINUS'
  | 'STAR'
  | 'SLASH'
  | 'PERCENT'
  | 'CARET'
  | 'LPAREN'
  | 'RPAREN'
  | 'EOF';

interface Token {
  type: TokenType;
  text: string;
  value?: number;
  pos: number;
}

const DEFAULT_MAX_LENGTH = 10_000;
const DEFAULT_MAX_DEPTH = 100;

function tokenize(input: string, maxLength: number): Token[] {
  if (typeof input !== 'string') {
    throw new CalculatorError(
      `Expression must be a string, received: ${typeof input}`,
      'INVALID_ARGUMENT',
    );
  }

  const trimmed = input.trim();
  if (trimmed.length === 0) {
    throw new CalculatorError('Expression cannot be empty', 'SYNTAX_ERROR');
  }

  if (trimmed.length > maxLength) {
    throw new CalculatorError(
      `Expression length (${trimmed.length}) exceeds maximum allowed length of ${maxLength}`,
      'EXPRESSION_TOO_LONG',
      { length: trimmed.length, maxLength },
    );
  }

  const tokens: Token[] = [];
  let i = 0;
  const len = trimmed.length;

  while (i < len) {
    const ch = trimmed[i]!;

    // Ignore whitespace
    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    // Number literal: integers, decimals (.5, 5., 5.5), scientific notation (1e-3, 2.5E4)
    if (/\d/.test(ch) || (ch === '.' && i + 1 < len && /\d/.test(trimmed[i + 1]!))) {
      const start = i;
      let hasDot = ch === '.';
      let hasExp = false;
      i++;

      while (i < len) {
        const c = trimmed[i]!;
        if (/\d/.test(c)) {
          i++;
        } else if (c === '.' && !hasDot && !hasExp) {
          hasDot = true;
          i++;
        } else if ((c === 'e' || c === 'E') && !hasExp) {
          hasExp = true;
          i++;
          if (i < len && (trimmed[i] === '+' || trimmed[i] === '-')) {
            i++;
          }
        } else {
          break;
        }
      }

      const text = trimmed.slice(start, i);
      const val = Number(text);
      if (!Number.isFinite(val)) {
        throw new CalculatorError(
          `Invalid numeric literal "${text}" at position ${start}`,
          'SYNTAX_ERROR',
          { text, position: start },
        );
      }

      tokens.push({
        type: 'NUMBER',
        text,
        value: val,
        pos: start,
      });
      continue;
    }

    // Exponentiation operator ** or single *
    if (ch === '*') {
      if (i + 1 < len && trimmed[i + 1] === '*') {
        tokens.push({ type: 'CARET', text: '**', pos: i });
        i += 2;
      } else {
        tokens.push({ type: 'STAR', text: '*', pos: i });
        i++;
      }
      continue;
    }

    if (ch === '+') {
      tokens.push({ type: 'PLUS', text: '+', pos: i });
      i++;
      continue;
    }

    if (ch === '-') {
      tokens.push({ type: 'MINUS', text: '-', pos: i });
      i++;
      continue;
    }

    if (ch === '/') {
      tokens.push({ type: 'SLASH', text: '/', pos: i });
      i++;
      continue;
    }

    if (ch === '%') {
      tokens.push({ type: 'PERCENT', text: '%', pos: i });
      i++;
      continue;
    }

    if (ch === '^') {
      tokens.push({ type: 'CARET', text: '^', pos: i });
      i++;
      continue;
    }

    if (ch === '(') {
      tokens.push({ type: 'LPAREN', text: '(', pos: i });
      i++;
      continue;
    }

    if (ch === ')') {
      tokens.push({ type: 'RPAREN', text: ')', pos: i });
      i++;
      continue;
    }

    // Strict security check: reject any unsupported character immediately
    throw new CalculatorError(
      `Unexpected character "${ch}" at position ${i}. Arbitrary code execution, functions, and identifiers are strictly prohibited.`,
      'UNEXPECTED_TOKEN',
      { character: ch, position: i },
    );
  }

  tokens.push({ type: 'EOF', text: '<EOF>', pos: len });
  return tokens;
}

export class ExpressionParser {
  private readonly tokens: Token[];
  private current = 0;
  private depth = 0;
  private readonly maxDepth: number;

  constructor(expression: string, options: CalculatorOptions = {}) {
    const maxLength = options.maxExpressionLength ?? DEFAULT_MAX_LENGTH;
    this.maxDepth = options.maxDepth ?? DEFAULT_MAX_DEPTH;
    this.tokens = tokenize(expression, maxLength);
  }

  private peek(): Token {
    return this.tokens[this.current] ?? this.tokens[this.tokens.length - 1]!;
  }

  private consume(): Token {
    const tok = this.peek();
    if (tok.type !== 'EOF') {
      this.current++;
    }
    return tok;
  }

  private checkFinite(val: number, operation: string, pos: number): void {
    if (!Number.isFinite(val)) {
      throw new CalculatorError(
        `Numerical overflow or non-finite result encountered during ${operation} at position ${pos}`,
        'OVERFLOW',
        { operation, position: pos },
      );
    }
  }

  public parse(): number {
    const result = this.parseExpression();

    const remaining = this.peek();
    if (remaining.type !== 'EOF') {
      throw new CalculatorError(
        `Unexpected token "${remaining.text}" at position ${remaining.pos}`,
        'SYNTAX_ERROR',
        { token: remaining.text, position: remaining.pos },
      );
    }

    return result || 0;
  }

  // Precedence level 1: Addition and Subtraction
  private parseExpression(): number {
    let left = this.parseTerm();

    while (this.peek().type === 'PLUS' || this.peek().type === 'MINUS') {
      const op = this.consume();
      const right = this.parseTerm();
      if (op.type === 'PLUS') {
        left = left + right;
      } else {
        left = left - right;
      }
      this.checkFinite(left, `addition/subtraction "${op.text}"`, op.pos);
    }

    return left;
  }

  // Precedence level 2: Multiplication, Division, and Modulo
  private parseTerm(): number {
    let left = this.parseUnary();

    while (
      this.peek().type === 'STAR' ||
      this.peek().type === 'SLASH' ||
      this.peek().type === 'PERCENT'
    ) {
      const op = this.consume();
      const right = this.parseUnary();

      if (op.type === 'STAR') {
        left = left * right;
      } else if (op.type === 'SLASH') {
        if (right === 0) {
          throw new CalculatorError('Division by zero is undefined', 'DIVISION_BY_ZERO', {
            position: op.pos,
          });
        }
        left = left / right;
      } else if (op.type === 'PERCENT') {
        if (right === 0) {
          throw new CalculatorError('Modulo by zero is undefined', 'DIVISION_BY_ZERO', {
            position: op.pos,
          });
        }
        left = left % right;
      }

      this.checkFinite(left, `multiplication/division/modulo "${op.text}"`, op.pos);
    }

    return left;
  }

  // Precedence level 3: Unary Plus and Unary Minus
  private parseUnary(): number {
    const tok = this.peek();
    if (tok.type === 'PLUS') {
      this.consume();
      return this.parseUnary();
    }
    if (tok.type === 'MINUS') {
      this.consume();
      const operand = this.parseUnary();
      const result = -operand;
      this.checkFinite(result, 'unary negation', tok.pos);
      return result || 0;
    }

    return this.parsePower();
  }

  // Precedence level 4: Exponentiation (^ and **) - Right-associative
  private parsePower(): number {
    const left = this.parsePrimary();

    if (this.peek().type === 'CARET') {
      const op = this.consume();
      // Right-associative: 2 ^ 3 ^ 2 => 2 ^ (3 ^ 2)
      const right = this.parseUnary();
      const result = Math.pow(left, right);
      this.checkFinite(result, 'exponentiation', op.pos);
      return result;
    }

    return left;
  }

  // Precedence level 5: Numbers and Parentheses
  private parsePrimary(): number {
    const tok = this.peek();

    if (tok.type === 'NUMBER') {
      this.consume();
      return tok.value!;
    }

    if (tok.type === 'LPAREN') {
      const pos = tok.pos;
      this.depth++;
      if (this.depth > this.maxDepth) {
        throw new CalculatorError(
          `Maximum expression nesting depth of ${this.maxDepth} exceeded at position ${pos}`,
          'MAX_DEPTH_EXCEEDED',
          { maxDepth: this.maxDepth, position: pos },
        );
      }

      this.consume(); // consume '('

      if (this.peek().type === 'RPAREN') {
        throw new CalculatorError(
          `Empty parentheses are not allowed at position ${pos}`,
          'SYNTAX_ERROR',
          { position: pos },
        );
      }

      const value = this.parseExpression();

      const closing = this.peek();
      if (closing.type !== 'RPAREN') {
        throw new CalculatorError(
          `Mismatched parentheses: missing closing ")" for "(" at position ${pos}`,
          'SYNTAX_ERROR',
          { openPosition: pos },
        );
      }
      this.consume(); // consume ')'
      this.depth--;
      return value;
    }

    if (tok.type === 'EOF') {
      throw new CalculatorError(
        'Unexpected end of expression: operand expected',
        'SYNTAX_ERROR',
        { position: tok.pos },
      );
    }

    throw new CalculatorError(
      `Unexpected token "${tok.text}" at position ${tok.pos}. Expected number or "("`,
      'SYNTAX_ERROR',
      { token: tok.text, position: tok.pos },
    );
  }
}
