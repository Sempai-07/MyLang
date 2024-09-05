import { Token } from "./lexer/Token";
import { TokenType, KeywordType, type OperatorType } from "./lexer/TokenType";
import { SyntaxError, SyntaxCodeError } from "./errors/SyntaxError";
/** AST */
import type { StmtType } from "./ast/StmtType";
import { StringLiteral } from "./ast/type/StringLiteral";
import { NumberLiteral } from "./ast/type/NumberLiteral";
import { BoolLiteral } from "./ast/type/BoolLiteral";
import { FunctionCall } from "./ast/function/FunctionCall";
import { FunctionDeclaration } from "./ast/function/FunctionDeclaration";
import { VariableDeclaration } from "./ast/declaration/VariableDeclaration";
import { ImportDeclaration } from "./ast/declaration/ImportDeclaration";
import { BinaryExpression } from "./ast/expression/BinaryExpression";
import { VisitUnaryExpression } from "./ast/expression/VisitUnaryExpression";
import { BlockStatement } from "./ast/expression/BlockStatement";
import { ReturnStatement } from "./ast/expression/ReturnStatement";
import { FunctionExpression } from "./ast/expression/FunctionExpression";
import { CallExpression } from "./ast/expression/CallExpression";
import { MemberExpression } from "./ast/expression/MemberExpression";
import { Assignment } from "./ast/expression/Assignment";
import { IdentifierLiteral } from "./ast/type/IdentifierLiteral";

class Parser {
  private offset: number = 0;
  private readonly tokens: Token[];
  private readonly paths: string[];
  private ast: StmtType[] = [];

  constructor(tokens: Token[], paths: string[] = []) {
    this.tokens = tokens;
    this.paths = paths;
  }

  public parse(): StmtType[] {
    while (!this.eof()) {
      const statement = this.parseStatement();
      if (statement) {
        this.ast.push(statement);
      }
    }

    return this.ast;
  }

  parseStatement(): StmtType {
    const token = this.peek();

    switch (token.type) {
      case TokenType.String:
      case TokenType.Number:
      case TokenType.Bool: {
        return this.parsePrimary();
      }
      case TokenType.Identifier: {
        if (this.peek(1).type === TokenType.OperatorAssign) {
          return this.parseAssignment(token);
        } else if (this.peek(1).type === TokenType.ParenthesisOpen) {
          return this.parseFunctionCall(token);
        } else if (
          this.peek(1).type === TokenType.Period &&
          this.peek(2).type === TokenType.Identifier &&
          this.peek(3).type === TokenType.ParenthesisOpen
        ) {
          this.next();
          return this.parseMethodCall(token);
        } else if (
          this.peek(1).type === TokenType.BracketOpen ||
          this.peek(1).type === TokenType.Period
        ) {
          this.next();
          return this.parseMemberExpressions(
            new IdentifierLiteral(token.value, token.position),
          );
        } else if (this.isOperator(this.peek(1).type)) {
          this.next();
          return this.parseExpression(
            new IdentifierLiteral(token.value, token.position),
          );
        }
        this.next();
        return new IdentifierLiteral(token.value, token.position);
      }
      case TokenType.Keyword: {
        return this.parseKeyword();
      }
      case TokenType.OperatorAdd:
      case TokenType.OperatorSubtract:
      case TokenType.OperatorNot: {
        return this.parseUnaryExpression(token);
      }
      case TokenType.ParenthesisOpen: {
        this.next(); // Skip '('
        const expr = this.parseExpression();
        this.expect(TokenType.ParenthesisClose);
        console.log(expr);
        this.next(); // Skip ')'
        return expr;
      }
      default:
        this.throwError(SyntaxCodeError.InvalidUnexpectedToken, token);
    }
  }

  parseKeyword() {
    const token = this.peek();

    switch (token.value) {
      case KeywordType.Var:
        this.next();
        return this.parseVariableDeclaration(this.peek());
      case KeywordType.Func:
        this.next();
        return this.parseFunctionDeclaration(this.peek());
      case KeywordType.Import:
        if (
          this.peek(1).type === TokenType.BracketOpen ||
          this.peek(1).type === TokenType.Period
        ) {
          this.next();
          return this.parseMemberExpressions(
            new IdentifierLiteral(token.value, token.position),
          );
        }
        this.next();
        return this.parseImportDeclaration(this.peek());
      case KeywordType.Return:
        this.next();
        return this.parseReturnStatement(this.peek());
      default:
        this.throwError(SyntaxCodeError.InvalidUnexpectedToken, token.position);
    }
  }

  parseVariableDeclaration(identifier: Token): VariableDeclaration {
    this.next(); // Move past identifier
    this.expect(TokenType.OperatorAssign);
    this.next(); // Move past '='

    const expression = this.parseExpression();
    let constant = false;

    if (
      this.peek().type === TokenType.Keyword &&
      this.peek().value === KeywordType.As
    ) {
      this.next(); // Skip as

      if (
        this.peek().type === TokenType.Keyword &&
        this.peek().value === KeywordType.Const
      ) {
        this.next(); // Skip const
        constant = true;
      } else {
        this.throwError(SyntaxCodeError.Unexpected, identifier);
      }
    }

    this.expectSemicolonOrEnd();

    return new VariableDeclaration(
      identifier.value,
      expression,
      constant,
      identifier.position,
    );
  }

  parseFunctionDeclaration(
    identifier: Token,
    expression: boolean = false,
  ): FunctionDeclaration {
    this.next(); // Move past identifier
    this.expect(TokenType.ParenthesisOpen);
    this.next(); // Move past '('

    const args = this.parseArgumentsAndDefault();

    this.expect(TokenType.ParenthesisClose);
    this.next(); // Move past ')'
    this.expect(TokenType.BraceOpen);

    this.next(); // Move past '{'
    const statement = this.parseBlockStatement(identifier);
    this.next(); // Move past '}'

    return expression
      ? new FunctionExpression(
          identifier.value,
          args,
          statement,
          identifier.position,
        )
      : new FunctionDeclaration(
          identifier.value,
          args,
          statement,
          identifier.position,
        );
  }

  parseImportDeclaration(
    identifier: Token,
    expression: boolean = false,
  ): ImportDeclaration {
    if (this.peek().type !== TokenType.ParenthesisOpen && expression) {
      this.throwError(SyntaxCodeError.InvalidDynamicImportUsage, identifier);
    }

    if (this.peek().type === TokenType.ParenthesisOpen && !expression) {
      const packages: Record<string, StmtType> = {};

      this.next(); // Move past '('

      while (this.peek().type !== TokenType.ParenthesisClose) {
        if (this.peek().type === TokenType.String) {
          const packageName = this.peek().value;
          this.next(); // Move past string

          packages[packageName] = packageName;

          if (
            (this.peek().type !== TokenType.Identifier ||
              this.peek().type !== TokenType.String) &&
            this.peek().type !== TokenType.ParenthesisClose
          ) {
            this.expect(TokenType.Comma);
          }
        } else if (this.peek().type === TokenType.Identifier) {
          const packageName = this.peek();
          this.next(); // Move past identifier

          this.expect(TokenType.Colon);
          this.next(); // Move past ':'

          this.expect(TokenType.String);
          const importNamePackage = this.parsePrimary();

          packages[packageName.value] = importNamePackage;

          if (
            (this.peek().type !== TokenType.Identifier ||
              this.peek().type !== TokenType.String) &&
            this.peek().type !== TokenType.ParenthesisClose
          ) {
            this.expect(TokenType.Comma);
          }
        } else if (this.peek().type === TokenType.Comma) {
          this.next(); // Move past ','
        } else {
          this.throwError(SyntaxCodeError.Unexpected, identifier);
        }
      }
      this.expect(TokenType.ParenthesisClose);
      this.next(); // Move past ')'

      this.expectSemicolonOrEnd();

      return new ImportDeclaration(packages, expression, identifier.position);
    }

    if (this.peek().type === TokenType.ParenthesisOpen && expression) {
      this.next(); // Move past '('

      this.expect(TokenType.String);
      const packageName = this.peek().value;
      this.next(); // Move past string
      this.expect(TokenType.ParenthesisClose);
      this.next(); // Move past ')'

      this.expectSemicolonOrEnd();

      return new ImportDeclaration(
        packageName,
        expression,
        identifier.position,
      );
    }

    this.expect(TokenType.String);
    const packageName = this.peek().value;
    this.next(); // Move past string

    this.expectSemicolonOrEnd();

    return new ImportDeclaration(packageName, expression, identifier.position);
  }

  parseAnonymousFunction(identifier: Token): FunctionDeclaration {
    this.next(); // Move past '('

    const args = this.parseArgumentsAndDefault();

    this.expect(TokenType.ParenthesisClose);
    this.next(); // Move past ')'
    this.expect(TokenType.BraceOpen);

    this.next(); // Move past '{'
    const statement = this.parseBlockStatement(identifier);
    this.next(); // Move past '}'

    return new FunctionDeclaration("", args, statement, identifier.position);
  }

  parseReturnStatement(identifier: Token): ReturnStatement {
    if (this.peek().type === TokenType.ParenthesisOpen) {
      this.next(); // Move past '('

      const value = this.parsePrimary();

      this.expect(TokenType.ParenthesisClose);
      this.next(); // Move past ')'

      this.expectSemicolonOrEnd();

      return new ReturnStatement(value, identifier.position);
    }
    const value = this.parsePrimary();
    this.expectSemicolonOrEnd();

    return new ReturnStatement(value, identifier.position);
  }

  parseFunctionCall(identifier: Token): FunctionCall {
    this.next(); // Move past identifier
    this.expect(TokenType.ParenthesisOpen);
    this.next(); // Move past '('

    const args = this.parseArguments();

    this.expect(TokenType.ParenthesisClose);
    this.next(); // Move past ')'
    this.expectSemicolonOrEnd();

    return new FunctionCall(identifier.value, args, identifier.position);
  }

  parseMethodCall(identifier: Token): CallExpression {
    this.next(); // Move past '.'

    const method = this.peek();
    this.next(); // Move past 'identifier' method

    this.expect(TokenType.ParenthesisOpen);
    this.next(); // Move past '('

    const args = this.parseArguments();

    this.expect(TokenType.ParenthesisClose);
    this.next(); // Move past ')'

    this.expectSemicolonOrEnd();

    return new CallExpression(
      identifier.value,
      method.value,
      null,
      args,
      identifier.position,
    );
  }

  parseAssignment(identifier: Token): Assignment {
    this.next(); // Move past identifier
    this.expect(TokenType.OperatorAssign);
    this.next(); // Move past '='

    const expression = this.parseExpression();
    this.expectSemicolonOrEnd();

    return new Assignment(identifier.value, expression, identifier.position);
  }

  parseArguments(): StmtType[] {
    const args: StmtType[] = [];

    while (this.peek().type !== TokenType.ParenthesisClose) {
      args.push(this.parseExpression());
      if (this.peek().type === TokenType.Comma) {
        this.next(); // Skip comma
      }
    }

    return args;
  }

  parseArgumentsAndDefault(): [string, StmtType | null][] {
    const args: [string, StmtType | null][] = [];

    while (this.peek().type !== TokenType.ParenthesisClose) {
      this.expect(TokenType.Identifier);
      const param = this.peek().value;
      this.next(); // Move past identifier

      if (this.peek().type === TokenType.OperatorAssign) {
        this.next(); // Move past '='
        const defaultParameters = this.parsePrimary();
        args.push([param, defaultParameters]);
        if (this.peek().type === TokenType.Comma) {
          this.next(); // Skip comma
        }
      } else {
        args.push([param, null]);
        if (this.peek().type === TokenType.Comma) {
          this.next(); // Skip comma
        }
      }
    }

    return args;
  }

  parseBlockStatement(identifier: Token): BlockStatement {
    const statement = [];
    while (this.peek().type !== TokenType.BraceClose) {
      statement.push(this.parseStatement());
    }
    return new BlockStatement(statement, identifier.position);
  }

  parseExpression(left?: StmtType): StmtType {
    left ??= this.parsePrimary();

    while (this.isOperator(this.peek().type)) {
      const operator = this.peek();
      this.next();

      const right = this.parsePrimary();

      left = new BinaryExpression(
        operator.value as OperatorType,
        left,
        right,
        operator.position,
      );
    }

    return left;
  }

  parseUnaryExpression(operator: Token): VisitUnaryExpression {
    this.next(); // Move past '!', '+' and '-'

    const right = this.parsePrimary();

    return new VisitUnaryExpression(
      operator.value as OperatorType,
      right,
      operator.position,
    );
  }

  parseMemberExpressions(identifier: StmtType): MemberExpression {
    const isMemberExpression = (token: TokenType) =>
      token === TokenType.BracketOpen || token === TokenType.Period;

    let object = identifier;

    while (isMemberExpression(this.peek().type)) {
      const tokenType = this.peek().type;
      this.next();

      let property;

      if (tokenType === TokenType.BracketOpen) {
        const token = this.peek();
        property = this.parsePrimary();
        this.expect(TokenType.BracketClose);
        this.next(); // Move past ']'

        if (this.peek().type === TokenType.ParenthesisOpen) {
          const methodName = new StringLiteral(token.value, token.position);

          this.next(); // Move past '('
          const args = this.parseArguments();
          this.expect(TokenType.ParenthesisClose);
          this.next(); // Move past ')'

          this.expectSemicolonOrEnd();

          return new CallExpression(
            methodName.value,
            methodName.value,
            object,
            args,
            methodName.position,
          );
        }
      } else if (tokenType === TokenType.Period) {
        this.expect(TokenType.Identifier);

        if (
          this.peek().type === TokenType.Identifier &&
          this.peek(1).type === TokenType.ParenthesisOpen
        ) {
          const methodName = new StringLiteral(
            this.peek().value,
            this.peek().position,
          );
          this.next(); // Move past identifier

          this.next(); // Move past '('
          const args = this.parseArguments();
          this.expect(TokenType.ParenthesisClose);
          this.next(); // Move past ')'

          this.expectSemicolonOrEnd();

          return new CallExpression(
            methodName.value,
            methodName.value,
            object,
            args,
            methodName.position,
          );
        } // else if (this.peek(1).type === TokenType.OperatorAssign) {
        //           const assignment = this.peek();
        //           this.next();
        //           this.next(); // Move past '='
        //
        //           const expression = this.parseExpression();
        //           this.expectSemicolonOrEnd();
        //
        //           return new Assignment(assignment.value, object, expression, identifier.position);
        //         }

        property = new StringLiteral(this.peek().value, this.peek().position);
        this.next(); // Move past identifier
      }

      object = new MemberExpression(object, property, object.position);
    }

    return object;
  }

  parsePrimary(): StmtType {
    const token = this.peek();

    switch (token.type) {
      case TokenType.Number: {
        const numbers = new NumberLiteral(token.value, token.position);
        if (this.isOperator(this.peek(1).type)) {
          this.next();
          return this.parseExpression(numbers);
        }
        this.next();
        return numbers;
      }
      case TokenType.String: {
        const strings = new StringLiteral(token.value, token.position);
        if (this.isOperator(this.peek(1).type)) {
          this.next();
          return this.parseExpression(strings);
        } else if (this.peek(1).type === TokenType.BracketOpen) {
          this.next();
          return this.parseMemberExpressions(strings);
        }
        this.next();
        return strings;
      }
      case TokenType.Bool: {
        const booleans = new BoolLiteral(token.value, token.position);
        if (this.isOperator(this.peek(1).type)) {
          this.next();
          return this.parseExpression(booleans);
        }
        this.next();
        return booleans;
      }
      case TokenType.Identifier: {
        const identifier = new IdentifierLiteral(token.value, token.position);
        if (this.isOperator(this.peek(1).type)) {
          this.next();
          return this.parseExpression(identifier);
        } else if (this.peek(1).type === TokenType.OperatorAssign) {
          return this.parseAssignment(token);
        } else if (this.peek(1).type === TokenType.ParenthesisOpen) {
          return this.parseFunctionCall(token);
        } else if (
          this.peek(1).type === TokenType.Period &&
          this.peek(2).type === TokenType.Identifier &&
          this.peek(3).type === TokenType.ParenthesisOpen
        ) {
          this.next();
          return this.parseMethodCall(token);
        } else if (
          this.peek(1).type === TokenType.BracketOpen ||
          this.peek(1).type === TokenType.Period
        ) {
          this.next();
          return this.parseMemberExpressions(identifier);
        }
        this.next();
        return identifier;
      }
      case TokenType.Keyword: {
        if (token.value === KeywordType.Var) {
          this.next();
          return this.parseVariableDeclaration(this.peek());
        } else if (token.value === KeywordType.Func) {
          if (this.peek(1).type === TokenType.ParenthesisOpen) {
            this.next();
            return this.parseAnonymousFunction(token);
          }
          this.next();
          return this.parseFunctionDeclaration(this.peek(), true);
        } else if (token.value === KeywordType.Import) {
          if (
            this.peek(1).type === TokenType.BracketOpen ||
            this.peek(1).type === TokenType.Period
          ) {
            this.next();
            return this.parseMemberExpressions(
              new IdentifierLiteral(token.value, token.position),
            );
          }
          this.next();
          const importDeclaration = this.parseImportDeclaration(
            this.peek(),
            true,
          );
          if (
            this.peek().type === TokenType.BracketOpen ||
            this.peek().type === TokenType.Period
          ) {
            return this.parseMemberExpressions(importDeclaration);
          }
          return importDeclaration;
        } else if (this.peek(1).type === TokenType.Period) {
          this.next();
          return this.parseMethodCall(this.peek());
        }
        this.throwError(SyntaxCodeError.Unexpected, token);
      }
      case TokenType.OperatorAdd:
      case TokenType.OperatorSubtract:
      case TokenType.OperatorNot: {
        return this.parseUnaryExpression(token);
      }
      case TokenType.ParenthesisOpen: {
        const identifier = this.peek(-1);
        if (identifier.type === TokenType.Identifier) {
          this.next(); // Skip '('
          const args = this.parseArguments();
          this.expect(TokenType.ParenthesisClose);
          this.next(); // Skip ')'
          return new FunctionCall(identifier.value, args, identifier.position);
        }

        this.next(); // Skip '('
        const expr = this.parseExpression();
        this.expect(TokenType.ParenthesisClose);
        this.next(); // Skip ')'
        return expr;
      }
      default:
        this.throwError(SyntaxCodeError.Unexpected, token);
    }
  }

  expectSemicolonOrEnd(): void {
    const token = this.peek();

    if (token.type === TokenType.Semicolon) {
      this.next();
    }
  }

  isOperator(tokenType: TokenType): boolean {
    return [
      TokenType.OperatorAdd,
      TokenType.OperatorSubtract,
      TokenType.OperatorMultiply,
      TokenType.OperatorDivide,
      TokenType.OperatorNotEqual,
      TokenType.OperatorEqual,
      TokenType.OperatorModulo,
      TokenType.OperatorGreaterThanOrEqual,
      TokenType.OperatorLessThan,
      TokenType.OperatorGreaterThan,
      TokenType.OperatorLessThanOrEqual,
      TokenType.OperatorAnd,
      TokenType.OperatorLogicalAnd,
      TokenType.OperatorOr,
      TokenType.OperatorLogicalOr,
    ].includes(tokenType);
  }

  peek(offset = 0): Token {
    return this.tokens[this.offset + offset]!;
  }

  next(): void {
    this.offset++;
  }

  expect(tokenType: TokenType): Token {
    const token = this.peek();

    if (token.type !== tokenType) {
      this.throwError(SyntaxCodeError.ExpectedToken, {
        ...token,
        expectedTokenType: tokenType,
        foundTokenType: token.type,
      });
    }

    return token;
  }

  eof(): boolean {
    return this.peek()?.type === TokenType.EndOf;
  }

  throwError(code: SyntaxCodeError, format: Record<string, any>): never {
    console.log(format);
    console.log(
      new SyntaxError(code, {
        line: format.position.line,
        column: format.position.column,
        ...format,
      }).genereteMessage(this.paths),
    );
    process.exit(1);
  }
}

export { Parser };
