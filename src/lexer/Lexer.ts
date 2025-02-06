import { Token } from "./Token";
import { Position } from "./Position";
import { TokenType, TokenList, OperatorType, KeywordType } from "./TokenType";
import { SyntaxError, SyntaxCodeError } from "../errors/SyntaxError";

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
    this.next(); // Skip first ' or "
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
    const token = this.searchToken((char) => {
      if (char === ".") {
        if (isFloat) return false;
        isFloat = true;
        return true;
      }
      return /[0-9]/.test(char);
    });

    const position = new Position(this.line, this.column);
    this.tokenList.push(
      new Token(token, isFloat ? TokenType.Float : TokenType.Int, position),
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
            new Token(
              OperatorType.AssignPlus,
              TokenType.OperatorAssignPlus,
              position,
            ),
          );
          this.next();
        } else if (this.current(1) === OperatorType.Add) {
          this.tokenList.push(
            new Token(
              OperatorType.PlusPlus,
              TokenType.OperatorPlusPlus,
              position,
            ),
          );
          this.next();
        } else {
          this.tokenList.push(
            new Token(OperatorType.Add, TokenType.OperatorAdd, position),
          );
        }
        this.next();
        break;
      case OperatorType.Subtract:
        if (this.current(1) === OperatorType.Assign) {
          this.tokenList.push(
            new Token(
              OperatorType.AssignMinus,
              TokenType.OperatorAssignMinus,
              position,
            ),
          );
          this.next();
        } else if (this.current(1) === OperatorType.Subtract) {
          this.tokenList.push(
            new Token(
              OperatorType.MinusMinus,
              TokenType.OperatorMinusMinus,
              position,
            ),
          );
          this.next();
        } else {
          this.tokenList.push(
            new Token(
              OperatorType.Subtract,
              TokenType.OperatorSubtract,
              position,
            ),
          );
        }
        this.next();
        break;
      case OperatorType.Multiply:
        this.tokenList.push(
          new Token(
            OperatorType.Multiply,
            TokenType.OperatorMultiply,
            position,
          ),
        );
        this.next();
        break;
      case OperatorType.Divide:
        this.tokenList.push(
          new Token(OperatorType.Divide, TokenType.OperatorDivide, position),
        );
        this.next();
        break;
      case OperatorType.Modulo:
        this.tokenList.push(
          new Token(OperatorType.Modulo, TokenType.OperatorModulo, position),
        );
        this.next();
        break;
      case OperatorType.Assign:
        if (OperatorType.Assign === this.current(1)) {
          this.tokenList.push(
            new Token(OperatorType.Equal, TokenType.OperatorEqual, position),
          );
          this.next();
        } else {
          this.tokenList.push(
            new Token(OperatorType.Assign, TokenType.OperatorAssign, position),
          );
        }
        this.next();
        break;
      case OperatorType.Not:
        if (OperatorType.Assign === this.current(1)) {
          this.tokenList.push(
            new Token(
              OperatorType.NotEqual,
              TokenType.OperatorNotEqual,
              position,
            ),
          );
          this.next();
        } else {
          this.tokenList.push(
            new Token(OperatorType.Not, TokenType.OperatorNot, position),
          );
        }
        this.next();
        break;
      case OperatorType.GreaterThan:
        if (OperatorType.Assign === this.current(1)) {
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
            new Token(
              OperatorType.GreaterThan,
              TokenType.OperatorGreaterThan,
              position,
            ),
          );
        }
        this.next();
        break;
      case OperatorType.LessThan:
        if (OperatorType.Assign === this.current(1)) {
          this.tokenList.push(
            new Token(
              OperatorType.LessThanOrEqual,
              TokenType.OperatorLessThanOrEqual,
              position,
            ),
          );
          this.next();
        } else {
          this.tokenList.push(
            new Token(
              OperatorType.LessThan,
              TokenType.OperatorLessThan,
              position,
            ),
          );
        }
        this.next();
        break;
      case OperatorType.LogicalAnd:
        if (OperatorType.LogicalAnd === this.current(1)) {
          this.tokenList.push(
            new Token(OperatorType.And, TokenType.OperatorAnd, position),
          );
          this.next();
        } else {
          this.tokenList.push(
            new Token(
              OperatorType.LogicalAnd,
              TokenType.OperatorLogicalAnd,
              position,
            ),
          );
        }
        this.next();
        break;
      case OperatorType.QuestionMark: {
        this.tokenList.push(
          new Token(
            OperatorType.QuestionMark,
            TokenType.QuestionMark,
            position,
          ),
        );
        this.next();
        break;
      }
      case OperatorType.LogicalOr:
        if (OperatorType.LogicalOr === this.current(1)) {
          this.tokenList.push(
            new Token(OperatorType.Or, TokenType.OperatorOr, position),
          );
          this.next();
        } else {
          this.tokenList.push(
            new Token(
              OperatorType.LogicalOr,
              TokenType.OperatorLogicalOr,
              position,
            ),
          );
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

  isOperatorStart(char: string): boolean {
    return Object.values(OperatorType).some((op) => op.startsWith(char));
  }

  searchToken(predicate: (char: string) => boolean): string {
    let buffer = "";

    while (!this.eof()) {
      const char = this.current();
      if (!predicate(char)) break;
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
