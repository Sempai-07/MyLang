import { Token } from "./token/Token";
import { Position } from "./token/Position";
import { TokenType, TokenList, OperatorType, KeywordType, ReflectType } from "./token/TokenType";
import { SyntaxError, SyntaxCodeError } from "../errors/lexer/SyntaxError";

class Lexer {
  public offset: number = 0;
  public line: number = 1;
  public column: number = 1;
  public readonly code: string;
  public readonly tokenList: Token[] = [];
  public errors: SyntaxError[] = [];

  constructor(code: string) {
    this.code = code;
  }

  analyze(): { tokens: Token[]; errors: SyntaxError[] } {
    while (!this.eof()) {
      const char = this.current();

      if (/\s/.test(char)) {
        this.next();
        continue;
      }

      if (char === "/") {
        if (this.current(1) === "/") {
          this.next();
          this.skipSingleLineComment();
          continue;
        } else if (this.current(1) === "*") {
          this.next();
          this.skipMultiLineComment();
          continue;
        }
      }

      if (char === TokenList.QuoteDouble || char === TokenList.QuoteSingle) {
        this.processStringLiteral(char);
        continue;
      }

      if (/[0-9]/.test(char)) {
        this.processNumberLiteral();
        continue;
      }

      if (/[a-zA-Z_]/.test(char)) {
        this.processIdentifierLiteral();
        continue;
      }

      if (this.isOperatorStart(char)) {
        this.processOperator(char);
        continue;
      }

      if (Object.values(TokenList).includes(char as TokenList)) {
        this.processSymbol(char);
        continue;
      }

      this.addError(SyntaxCodeError.InvalidUnexpectedToken, {
        line: this.line,
        column: this.column,
      });
    }

    const position = new Position(this.line, this.column);
    this.tokenList.push(new Token("", TokenType.EndOf, position));

    return { tokens: this.tokenList, errors: this.errors };
  }

  processStringLiteral(quote: string): void {
    this.next();
    const startPosition = new Position(this.line, this.column);
    let token = "";

    while (!this.eof()) {
      const char = this.current();

      if (char === quote) {
        if (
          this.current(1) === TokenList.QuoteDouble ||
          this.current(1) === TokenList.QuoteSingle
        ) {
          this.addError(SyntaxCodeError.MultipleConsecutiveQuotes, {
            line: this.line,
            column: this.column,
          });
          return;
        }

        this.next();
        const position = new Position(this.line, this.column);
        this.tokenList.push(new Token(token, TokenType.String, position));
        return;
      } else if (startPosition.line !== this.line) {
        this.addError(SyntaxCodeError.InvalidUnexpectedToken, {
          line: this.line,
          column: this.column,
        });
        return;
      }

      token += char;
      this.next();
    }

    this.addError(SyntaxCodeError.UnterminatedStringLiteral, {
      line: startPosition.line,
      column: startPosition.column,
    });
  }

  processNumberLiteral(): void {
    let isFloat = false;
    let isBigInt = false;
    let hasExponent = false;
    let expectingExponentDigits = false;
    let charIndex = 0;
    let isHex = false;
    let isBinary = false;
    let isOctal = false;
    let isLegacyOctal = false;

    const firstChar = this.current();
    const secondChar = this.current(1);

    if (firstChar === "0" && secondChar) {
      const lowerSecond = secondChar.toLowerCase();
      if (lowerSecond === "x") {
        isHex = true;
      } else if (lowerSecond === "b") {
        isBinary = true;
      } else if (lowerSecond === "o") {
        isOctal = true;
      } else if (/[0-7]/.test(secondChar)) {
        isLegacyOctal = true;
      }
    }

    const token = this.searchToken((char, nextChar) => {
      charIndex++;

      if (charIndex <= 2 && firstChar === "0") {
        if (charIndex === 1) return true;
        if (charIndex === 2 && (isHex || isBinary || isOctal)) return true;
      }

      if (isHex && char === "\\" && nextChar === "u") {
        return true;
      }
      if (isHex && charIndex >= 3 && /[u\{\}]/.test(char)) {
        return true;
      }

      if (char === ".") {
        if (isFloat || hasExponent || isBigInt || isHex || isBinary || isOctal || isLegacyOctal) {
          return false;
        }
        isFloat = true;
        return true;
      } else if (char === "_") {
        if (nextChar && !expectingExponentDigits) {
          if (isHex && /[0-9a-fA-F]/.test(nextChar)) return true;
          if (isBinary && /[01]/.test(nextChar)) return true;
          if ((isOctal || isLegacyOctal) && /[0-7]/.test(nextChar)) return true;
          if (!isHex && !isBinary && !isOctal && !isLegacyOctal && /[0-9]/.test(nextChar))
            return true;
        }
        return false;
      } else if (char === "n") {
        if (!/[0-9a-fA-F]/.test(nextChar || "") && !isFloat && !hasExponent) {
          if (isBigInt) {
            this.addError(SyntaxCodeError.InvalidUnexpectedToken, {
              line: this.line,
              column: this.column,
            });
          }
          isBigInt = true;
          return true;
        }
        return false;
      } else if (
        (char === "e" || char === "E") &&
        !isHex &&
        !isBinary &&
        !isOctal &&
        !isLegacyOctal
      ) {
        if (hasExponent || isBigInt || charIndex === 1) {
          return false;
        }
        hasExponent = true;
        isFloat = true;
        expectingExponentDigits = true;

        if (nextChar && /[+\-0-9]/.test(nextChar)) {
          return true;
        }
        return false;
      } else if ((char === "+" || char === "-") && expectingExponentDigits) {
        expectingExponentDigits = false;
        if (nextChar && /[0-9]/.test(nextChar)) {
          return true;
        }
        return false;
      } else if (isHex && /[0-9a-fA-F]/.test(char)) {
        expectingExponentDigits = false;
        return true;
      } else if (isBinary && /[01]/.test(char)) {
        expectingExponentDigits = false;
        return true;
      } else if ((isOctal || isLegacyOctal) && /[0-7]/.test(char)) {
        expectingExponentDigits = false;
        return true;
      } else if (!isHex && !isBinary && !isOctal && !isLegacyOctal && /[0-9]/.test(char)) {
        expectingExponentDigits = false;
        return true;
      }

      return false;
    });

    if (hasExponent && expectingExponentDigits) {
      this.addError(SyntaxCodeError.InvalidUnexpectedToken, {
        line: this.line,
        column: this.column,
      });
    }

    const position = new Position(this.line, this.column);
    this.tokenList.push(
      new Token(token, isFloat || hasExponent ? TokenType.Float : TokenType.Int, position),
    );
  }

  processIdentifierLiteral(): void {
    const token = this.searchToken((char) => /^[a-zA-Z0-9_]$/.test(char));
    const position = new Position(this.line, this.column);

    if (token === "nil") {
      this.tokenList.push(new Token(token, TokenType.Nil, position));
      return;
    }

    if (token === "false" || token === "true") {
      this.tokenList.push(new Token(token, TokenType.Bool, position));
      return;
    }

    if (this.isKeyword(token)) {
      this.tokenList.push(new Token(token, TokenType.Keyword, position));
      return;
    }

    if (this.isReflect(token)) {
      this.tokenList.push(new Token(token, TokenType.Reflect, position));
      return;
    }

    this.tokenList.push(new Token(token, TokenType.Identifier, position));
  }

  processSymbol(char: string): void {
    const position = new Position(this.line, this.column);
    const [tokenType] = Object.entries(TokenList)
      .filter(([_, valueToken]) => valueToken === (char as TokenList))
      .shift()!;

    this.tokenList.push(new Token(char, tokenType as TokenType, position));
    this.next();
  }

  processOperator(operator: string): void {
    const position = new Position(this.line, this.column);

    switch (operator) {
      case OperatorType.Add:
        if (this.current(1) === OperatorType.Assign) {
          this.tokenList.push(
            new Token(OperatorType.AssignPlus, TokenType.OperatorAssignPlus, position),
          );
          this.next();
        } else if (this.current(1) === OperatorType.Add) {
          this.tokenList.push(
            new Token(OperatorType.PlusPlus, TokenType.OperatorPlusPlus, position),
          );
          this.next();
        } else {
          this.tokenList.push(new Token(OperatorType.Add, TokenType.OperatorAdd, position));
        }
        this.next();
        break;
      case OperatorType.Subtract:
        if (this.current(1) === OperatorType.Assign) {
          this.tokenList.push(
            new Token(OperatorType.AssignMinus, TokenType.OperatorAssignMinus, position),
          );
          this.next();
        } else if (this.current(1) === OperatorType.Subtract) {
          this.tokenList.push(
            new Token(OperatorType.MinusMinus, TokenType.OperatorMinusMinus, position),
          );
          this.next();
        } else {
          this.tokenList.push(
            new Token(OperatorType.Subtract, TokenType.OperatorSubtract, position),
          );
        }
        this.next();
        break;
      case OperatorType.Multiply:
        if (this.current(1) === OperatorType.Multiply) {
          if (this.current(2) === OperatorType.Assign) {
            this.tokenList.push(
              new Token(OperatorType.AssignPow, TokenType.OperatorAssignPow, position),
            );
            this.next();
          } else {
            this.tokenList.push(
              new Token(OperatorType.Exponentiation, TokenType.OperatorExponentiation, position),
            );
          }
          this.next();
        } else if (this.current(1) === OperatorType.Assign) {
          this.tokenList.push(
            new Token(OperatorType.AssignMultiply, TokenType.OperatorAssignMultiply, position),
          );
          this.next();
        } else {
          this.tokenList.push(
            new Token(OperatorType.Multiply, TokenType.OperatorMultiply, position),
          );
        }
        this.next();
        break;
      case OperatorType.Divide:
        if (this.current(1) === OperatorType.Assign) {
          this.tokenList.push(
            new Token(OperatorType.AssignDivide, TokenType.OperatorAssignDivide, position),
          );
          this.next();
        } else {
          this.tokenList.push(new Token(OperatorType.Divide, TokenType.OperatorDivide, position));
        }
        this.next();
        break;
      case OperatorType.Modulo:
        if (this.current(1) === OperatorType.Assign) {
          this.tokenList.push(
            new Token(OperatorType.AssignModule, TokenType.OperatorAssignModule, position),
          );
          this.next();
        } else
          this.tokenList.push(new Token(OperatorType.Modulo, TokenType.OperatorModulo, position));
        this.next();
        break;
      case OperatorType.Assign:
        if (OperatorType.Assign === this.current(1)) {
          this.tokenList.push(new Token(OperatorType.Equal, TokenType.OperatorEqual, position));
          this.next();
        } else {
          this.tokenList.push(new Token(OperatorType.Assign, TokenType.OperatorAssign, position));
        }
        this.next();
        break;
      case OperatorType.Not:
        if (OperatorType.Assign === this.current(1)) {
          this.tokenList.push(
            new Token(OperatorType.NotEqual, TokenType.OperatorNotEqual, position),
          );
          this.next();
        } else {
          this.tokenList.push(new Token(OperatorType.Not, TokenType.OperatorNot, position));
        }
        this.next();
        break;
      case OperatorType.BitNot:
        this.tokenList.push(new Token(OperatorType.BitNot, TokenType.OperatorBitNot, position));
        this.next();
        break;
      case OperatorType.GreaterThan:
        if (OperatorType.GreaterThan === this.current(1)) {
          if (OperatorType.Assign === this.current(2)) {
            this.tokenList.push(
              new Token(
                OperatorType.ShiftRightAssign,
                TokenType.OperatorShiftRightAssign,
                position,
              ),
            );
            this.next();
          } else if (OperatorType.GreaterThan === this.current(2)) {
            if (OperatorType.Assign === this.current(3)) {
              this.tokenList.push(
                new Token(
                  OperatorType.ShiftRightZeroFillAssign,
                  TokenType.OperatorShiftRightZeroFillAssign,
                  position,
                ),
              );
              this.next();
            } else {
              this.tokenList.push(
                new Token(
                  OperatorType.ShiftRightZeroFill,
                  TokenType.OperatorShiftRightZeroFill,
                  position,
                ),
              );
            }
            this.next();
          } else {
            this.tokenList.push(
              new Token(OperatorType.ShiftRight, TokenType.OperatorShiftRight, position),
            );
          }
          this.next();
        } else if (OperatorType.Assign === this.current(1)) {
          this.tokenList.push(
            new Token(
              OperatorType.GreaterThanOrEqual,
              TokenType.OperatorGreaterThanOrEqual,
              position,
            ),
          );
          this.next();
        } else {
          this.tokenList.push(
            new Token(OperatorType.GreaterThan, TokenType.OperatorGreaterThan, position),
          );
        }
        this.next();
        break;
      case OperatorType.LessThan:
        if (OperatorType.LessThan === this.current(1)) {
          if (OperatorType.Assign === this.current(2)) {
            this.tokenList.push(
              new Token(OperatorType.ShiftLeftAssign, TokenType.OperatorShiftLeftAssign, position),
            );
            this.next();
          } else {
            this.tokenList.push(
              new Token(OperatorType.ShiftLeft, TokenType.OperatorShiftLeft, position),
            );
          }
          this.next();
        } else if (OperatorType.Assign === this.current(1)) {
          this.tokenList.push(
            new Token(OperatorType.LessThanOrEqual, TokenType.OperatorLessThanOrEqual, position),
          );
          this.next();
        } else {
          this.tokenList.push(
            new Token(OperatorType.LessThan, TokenType.OperatorLessThan, position),
          );
        }
        this.next();
        break;
      case OperatorType.BitXor:
        if (OperatorType.Assign === this.current(1)) {
          this.tokenList.push(
            new Token(OperatorType.BitXorAssign, TokenType.OperatorBitXorAssign, position),
          );
          this.next();
        } else {
          this.tokenList.push(new Token(OperatorType.BitXor, TokenType.OperatorBitXor, position));
        }
        this.next();
        break;
      case OperatorType.LogicalAnd:
        if (OperatorType.Assign === this.current(1)) {
          this.tokenList.push(
            new Token(OperatorType.BitAndAssign, TokenType.OperatorBitAndAssign, position),
          );
          this.next();
        } else if (OperatorType.LogicalAnd === this.current(1)) {
          if (this.current(2) === OperatorType.Assign) {
            this.tokenList.push(
              new Token(OperatorType.AndAssign, TokenType.OperatorAndAssign, position),
            );
            this.next();
          } else {
            this.tokenList.push(new Token(OperatorType.And, TokenType.OperatorAnd, position));
          }
          this.next();
        } else {
          this.tokenList.push(
            new Token(OperatorType.LogicalAnd, TokenType.OperatorLogicalAnd, position),
          );
        }
        this.next();
        break;
      case OperatorType.QuestionMark: {
        this.tokenList.push(new Token(OperatorType.QuestionMark, TokenType.QuestionMark, position));
        this.next();
        break;
      }
      case OperatorType.LogicalOr:
        if (OperatorType.Assign === this.current(1)) {
          this.tokenList.push(
            new Token(OperatorType.BitOrAssign, TokenType.OperatorBitOrAssign, position),
          );
          this.next();
        } else if (OperatorType.LogicalOr === this.current(1)) {
          if (this.current(2) === OperatorType.Assign) {
            this.tokenList.push(
              new Token(OperatorType.OrAssign, TokenType.OperatorOrAssign, position),
            );
            this.next();
          } else {
            this.tokenList.push(new Token(OperatorType.Or, TokenType.OperatorOr, position));
          }
          this.next();
        } else {
          this.tokenList.push(
            new Token(OperatorType.LogicalOr, TokenType.OperatorLogicalOr, position),
          );
        }
        this.next();
        break;
      case OperatorType.Period:
        if (OperatorType.Period === this.current(1) && OperatorType.Period === this.current(2)) {
          this.tokenList.push(new Token(OperatorType.Rest, TokenType.OperatorRest, position));
          this.next();
          this.next();
        } else {
          this.tokenList.push(new Token(OperatorType.Period, TokenType.Period, position));
        }
        this.next();
        break;
      default:
        this.addError(SyntaxCodeError.UnexpectedOperator, {
          operator,
          line: this.line,
          column: this.column,
        });
    }
  }

  addError(code: SyntaxCodeError, format?: Record<string, any>): void {
    this.errors.push(new SyntaxError(code, format));
    this.next();
  }

  isKeyword(char: string): boolean {
    return Object.values(KeywordType).includes(char as KeywordType);
  }

  isReflect(char: string): boolean {
    return Object.values(ReflectType).includes(char as ReflectType);
  }

  isOperatorStart(char: string): boolean {
    return Object.values(OperatorType).some((op) => op.startsWith(char));
  }

  isValidDigitForBase(char: string, base: number): boolean {
    switch (base) {
      case 2:
        return /[01]/.test(char);
      case 8:
        return /[0-7]/.test(char);
      case 10:
        return /[0-9]/.test(char);
      case 16:
        return /[0-9a-fA-F]/.test(char);
      default:
        return false;
    }
  }

  validateNumberForBase(token: string, base: number, hasPrefix: boolean): boolean {
    let numberPart = token;

    if (numberPart.endsWith("n") || numberPart.endsWith("N")) {
      numberPart = numberPart.slice(0, -1);
    }

    if (hasPrefix) {
      numberPart = numberPart.slice(2);
    }

    numberPart = numberPart.replace(/_/g, "");

    if (numberPart.length === 0) {
      return false;
    }

    for (const char of numberPart) {
      if (char === "." || char === "e" || char === "E" || char === "+" || char === "-") {
        continue;
      }
      if (!this.isValidDigitForBase(char, base)) {
        return false;
      }
    }

    return true;
  }

  searchToken(predicate: (char: string, nextChar?: string) => boolean): string {
    let buffer = "";

    while (!this.eof()) {
      const char = this.current();
      if (!predicate(char, this.current(1))) break;
      buffer += char;
      this.next();
    }

    return buffer;
  }

  skipSingleLineComment(): void {
    while (!this.eof()) {
      const char = this.current();
      if (char === "\n") break;
      this.next();
    }
  }

  skipMultiLineComment(): void {
    while (!this.eof()) {
      const char = this.current();
      const nextChar = this.current(1);

      if (char === "*" && nextChar === "/") {
        this.next();
        this.next();
        return;
      }

      this.next();
    }
  }

  current(offset: number = 0): string {
    return this.code[this.offset + offset]!;
  }

  next(): void {
    const char = this.code[this.offset];
    if (char === "\n") {
      this.line++;
      this.column = 0;
    } else {
      this.column++;
    }
    this.offset++;
  }

  eof(): boolean {
    return this.offset >= this.code.length;
  }
}

export { Lexer };
