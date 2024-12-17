import { type StmtType } from "./StmtType";
import { type Token } from "../lexer/Token";
import { TokenType, OperatorType, KeywordType } from "../lexer/TokenType";
import { SyntaxError, SyntaxCodeError } from "../errors/SyntaxError";

import { StringLiteral } from "./types/StringLiteral";
import { IntLiteral } from "./types/IntLiteral";
import { FloatLiteral } from "./types/FloatLiteral";
import { BoolLiteral } from "./types/BoolLiteral";
import { NilLiteral } from "./types/NilLiteral";
import { IdentifierLiteral } from "./types/IdentifierLiteral";
import { BinaryExpression } from "./expression/BinaryExpression";
import { CallExpression } from "./expression/CallExpression";
import { VisitUnaryExpression } from "./expression/VisitUnaryExpression";
import { FunctionCall } from "./expression/FunctionCall";
import { FunctionExpression } from "./expression/FunctionExpression";
import { MemberExpression } from "./expression/MemberExpression";
import { AssignmentExpression } from "./expression/AssignmentExpression";
import { ArrayExpression } from "./expression/ArrayExpression";
import { ObjectExpression } from "./expression/ObjectExpression";
import { ImportDeclaration } from "./declaration/ImportDeclaration";
import { ExportsDeclaration } from "./declaration/ExportsDeclaration";
import { VariableDeclaration } from "./declaration/VariableDeclaration";
import { FunctionDeclaration } from "./declaration/FunctionDeclaration";
import { BlockStatement } from "./statement/BlockStatement";

class Parser {
  private offset: number = 0;
  private ast: StmtType[] = [];
  public readonly tokens: Token[];

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): StmtType[] {
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
      case TokenType.Int:
      case TokenType.Float:
      case TokenType.Bool:
      case TokenType.Nil:
      case TokenType.Identifier: {
        return this.parsePrimary();
      }
      case TokenType.Keyword: {
        return this.parseKeyword();
      }
      case TokenType.BracketOpen: {
        return this.parseArrayExpression(token);
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
        this.next(); // Skip ')'
        return expr;
      }
      case TokenType.BraceOpen: {
        this.next(); // Skip '{'
        const expr = this.parseBlockStatement(token);
        this.expect(TokenType.BraceClose);
        this.next(); // Skip '}'
        return expr;
      }
      default:
        this.throwError(SyntaxCodeError.InvalidUnexpectedToken, token);
    }
  }

  parseArrayExpression(
    identifier: Token,
  ):
    | ArrayExpression
    | MemberExpression
    | CallExpression
    | AssignmentExpression {
    this.next(); // Skip '['

    const elements = [];

    while (this.peek().type !== TokenType.BracketClose) {
      elements.push(this.parsePrimary());

      if (this.peek().type === TokenType.Comma) {
        this.next(); // Skip ','
      } else this.expect(TokenType.BracketClose);
    }

    this.expect(TokenType.BracketClose);
    this.next(); // Skip ']'

    this.expectSemicolonOrEnd();

    const arrayExpression = new ArrayExpression(elements, identifier.position);
    if (
      this.peek().type === TokenType.BracketOpen ||
      this.peek().type === TokenType.Period
    ) {
      return this.parseMemberExpressions(arrayExpression);
    }

    return arrayExpression;
  }

  parseObjectExpression(
    identifier: Token,
  ):
    | ObjectExpression
    | MemberExpression
    | CallExpression
    | AssignmentExpression {
    this.next(); // Skip '{'

    const obj: {
      key: StmtType | string;
      value: StmtType | null;
      computed?: true;
    }[] = [];

    while (this.peek().type !== TokenType.BraceClose) {
      if (this.peek().type === TokenType.Identifier) {
        const propertyName = this.parsePrimary();

        if (this.peek().type === TokenType.Colon) {
          this.next(); // Move past ':'
          obj.push({ key: propertyName, value: this.parsePrimary() });
        } else
          obj.push({
            key: (<IdentifierLiteral>propertyName).value,
            value: propertyName,
          });
      } else if (this.peek().type === TokenType.String) {
        const propertyName = this.parsePrimary();

        if (this.peek().type === TokenType.Colon) {
          this.next(); // Move past ':'
          obj.push({ key: propertyName, value: this.parsePrimary() });
        }
      } else if (this.peek().type === TokenType.BracketOpen) {
        this.next(); // Move past '['
        const propertyName = this.parsePrimary();
        this.expect(TokenType.BracketClose);
        this.next(); // Move past ']'

        this.expect(TokenType.Colon);
        this.next(); // Move past ':'

        const propertyValue = this.parsePrimary();

        obj.push({ key: propertyName, value: propertyValue, computed: true });
      }

      if (this.peek().type === TokenType.Comma) {
        this.next(); // Skip ','
      } else this.expect(TokenType.BraceClose);
    }

    this.expect(TokenType.BraceClose);
    this.next(); // Skip ']'

    this.expectSemicolonOrEnd();

    const objExpression = new ObjectExpression(obj, identifier.position);
    if (
      this.peek().type === TokenType.BracketOpen ||
      this.peek().type === TokenType.Period
    ) {
      return this.parseMemberExpressions(objExpression);
    }

    return objExpression;
  }

  parseKeyword(): StmtType {
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
      case KeywordType.Export:
        this.next();
        return this.parseExportDeclaration(this.peek());
      default:
        this.throwError(SyntaxCodeError.InvalidUnexpectedToken, token.position);
    }
  }

  parseVariableDeclaration(identifier: Token): VariableDeclaration {
    this.next(); // Move past identifier
    this.expect(TokenType.OperatorAssign);
    this.next(); // Move past '='

    const expression = this.parseExpression();

    this.expectSemicolonOrEnd();

    return new VariableDeclaration(
      identifier.value,
      expression,
      identifier.position,
    );
  }

  parseFunctionDeclaration(identifier: Token): FunctionDeclaration {
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

    return new FunctionDeclaration(
      identifier.value,
      args,
      statement,
      identifier.position,
    );
  }

  parseFunctionExpression(identifier: Token): FunctionExpression {
    let functionName = null;

    if (this.peek().type === TokenType.Identifier) {
      functionName = this.peek().value;
      this.next();
    }

    this.expect(TokenType.ParenthesisOpen);
    this.next(); // Move past '('

    const args = this.parseArgumentsAndDefault();

    this.expect(TokenType.ParenthesisClose);
    this.next(); // Move past ')'
    this.expect(TokenType.BraceOpen);

    this.next(); // Move past '{'
    const statement = this.parseBlockStatement(identifier);
    this.next(); // Move past '}'

    return new FunctionExpression(
      functionName,
      args,
      statement,
      identifier.position,
    );
  }

  parseFunctionCall(
    identifier: Token,
  ): FunctionCall | MemberExpression | CallExpression | AssignmentExpression {
    this.next(); // Move past identifier
    this.expect(TokenType.ParenthesisOpen);
    this.next(); // Move past '('

    const args = this.parseArguments();

    this.expect(TokenType.ParenthesisClose);
    this.next(); // Move past ')'

    const functionCall = new FunctionCall(
      identifier.value,
      args,
      identifier.position,
    );

    if (
      this.peek().type === TokenType.BracketOpen ||
      this.peek().type === TokenType.Period
    ) {
      return this.parseMemberExpressions(functionCall);
    }

    this.expectSemicolonOrEnd();

    return functionCall;
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

          // @ts-ignore
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

  parseExportDeclaration(identifier: Token): ExportsDeclaration {
    this.expect(TokenType.ParenthesisOpen);
    const exports: Record<string, StmtType> = {};

    this.next(); // Move past '('

    while (this.peek().type !== TokenType.ParenthesisClose) {
      if (this.peek().type === TokenType.Identifier) {
        const exportName = this.peek();
        this.next(); // Move past identifier

        if (this.peek().type === TokenType.Colon) {
          this.next(); // Move past ':'

          const importValue = this.parsePrimary();

          exports[exportName.value] = importValue;

          if (
            (this.peek().type !== TokenType.Identifier ||
              this.peek().type !== TokenType.String) &&
            this.peek().type !== TokenType.ParenthesisClose
          ) {
            this.expect(TokenType.Comma);
          } else continue;
        }

        exports[exportName.value] = new IdentifierLiteral(
          exportName.value,
          exportName.position,
        );

        if (
          (this.peek().type !== TokenType.Identifier ||
            this.peek().type !== TokenType.String) &&
          this.peek().type !== TokenType.ParenthesisClose
        ) {
          this.expect(TokenType.Comma);
        }
      } else if (this.peek().type === TokenType.String) {
        const exportName = this.peek();
        this.next(); // Move past string

        this.expect(TokenType.Colon);
        this.next(); // Move past ':'

        const importValue = this.parsePrimary();

        exports[exportName.value] = importValue;

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

    return new ExportsDeclaration(exports, identifier.position);
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

  parseArgumentsAndDefault(): [string, StmtType][] {
    const args: [string, StmtType][] = [];

    while (this.peek().type !== TokenType.ParenthesisClose) {
      this.expect(TokenType.Identifier);
      const param = this.peek();
      this.next(); // Move past identifier

      if (this.peek().type === TokenType.OperatorAssign) {
        this.next(); // Move past '='
        const defaultParameters = this.parsePrimary();
        args.push([param.value, defaultParameters]);
        if (this.peek().type === TokenType.Comma) {
          this.next(); // Skip comma
        }
      } else {
        args.push([param.value, new NilLiteral(param.position)]);
        if (this.peek().type === TokenType.Comma) {
          this.next(); // Skip comma
        }
      }
    }

    return args;
  }

  parseMethodCall(
    identifier: Token,
  ): CallExpression | MemberExpression | AssignmentExpression {
    this.next(); // Move past '.'

    const method = this.peek();
    this.next(); // Move past 'identifier' method

    this.expect(TokenType.ParenthesisOpen);
    this.next(); // Move past '('

    const args = this.parseArguments();

    this.expect(TokenType.ParenthesisClose);
    this.next(); // Move past ')'

    const callExpression = new CallExpression(
      identifier.value,
      method.value,
      new IdentifierLiteral(identifier.value, identifier.position),
      args,
      identifier.position,
    );

    if (
      this.peek().type === TokenType.BracketOpen ||
      this.peek().type === TokenType.Period
    ) {
      return this.parseMemberExpressions(callExpression);
    }

    this.expectSemicolonOrEnd();

    return callExpression;
  }

  parseMemberExpressions(
    identifier: StmtType,
  ): CallExpression | MemberExpression | AssignmentExpression {
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
            object as MemberExpression,
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
            object as MemberExpression,
            args,
            methodName.position,
          );
        }

        property = new StringLiteral(this.peek().value, this.peek().position);
        this.next(); // Move past identifier
      }

      object = new MemberExpression(
        object,
        property as MemberExpression,
        object.position,
      );
    }

    if (
      this.peek().type === TokenType.OperatorAssign ||
      this.peek().type === TokenType.OperatorAssignPlus ||
      this.peek().type == TokenType.OperatorAssignMinus
    ) {
      const tokenType = this.peek();
      this.next(); // Move past '=', '+=' or '-='
      const expression = this.parsePrimary();

      this.expectSemicolonOrEnd();

      return new AssignmentExpression(
        object,
        tokenType.type,
        expression,
        tokenType.position,
      );
    }

    // @ts-expect-error
    return object;
  }

  parseAssignmentExpression(token: StmtType): AssignmentExpression {
    if (
      this.peek().type !== TokenType.OperatorAssign &&
      this.peek().type !== TokenType.OperatorAssignPlus &&
      this.peek().type !== TokenType.OperatorAssignMinus
    ) {
      throw `Unexpected assignment ${this.peek().type}`;
    }

    const tokenType = this.peek();
    this.next(); // Move past '=', '+=' or '-='

    const expression = this.parsePrimary();

    this.expectSemicolonOrEnd();

    return new AssignmentExpression(
      token,
      tokenType.type,
      expression,
      tokenType.position,
    );
  }

  parsePrimary(): StmtType {
    const token = this.peek();

    switch (token.type) {
      case TokenType.String: {
        const strings = new StringLiteral(token.value, token.position);
        if (this.isOperator(this.peek(1).type)) {
          this.next();
          return this.parseExpression(strings);
        }
        this.next();
        return strings;
      }
      case TokenType.Int: {
        const ints = new IntLiteral(token.value, token.position);
        if (this.isOperator(this.peek(1).type)) {
          this.next();
          return this.parseExpression(ints);
        }
        this.next();
        return ints;
      }
      case TokenType.Float: {
        const floats = new FloatLiteral(token.value, token.position);
        if (this.isOperator(this.peek(1).type)) {
          this.next();
          return this.parseExpression(floats);
        }
        this.next();
        return floats;
      }
      case TokenType.Bool: {
        const bools = new BoolLiteral(token.value, token.position);
        if (this.isOperator(this.peek(1).type)) {
          this.next();
          return this.parseExpression(bools);
        }
        this.next();
        return bools;
      }
      case TokenType.Nil: {
        const nils = new NilLiteral(token.position);
        if (this.isOperator(this.peek(1).type)) {
          this.next();
          return this.parseExpression(nils);
        }
        this.next();
        return nils;
      }
      case TokenType.Identifier: {
        const identifier = new IdentifierLiteral(token.value, token.position);
        if (this.isOperator(this.peek(1).type)) {
          this.next();
          return this.parseExpression(identifier);
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
        } else if (
          this.peek(1).type === TokenType.OperatorAssign ||
          this.peek(1).type === TokenType.OperatorAssignPlus ||
          this.peek(1).type === TokenType.OperatorAssignMinus
        ) {
          this.next();
          return this.parseAssignmentExpression(identifier);
        }
        this.next();
        return identifier;
      }
      case TokenType.Keyword: {
        if (token.value === KeywordType.Import) {
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
          return importDeclaration;
        } else if (token.value === KeywordType.Func) {
          if (
            (this.peek(1).type === TokenType.Identifier &&
              this.peek(2).type === TokenType.ParenthesisOpen) ||
            this.peek(1).type === TokenType.ParenthesisOpen
          ) {
            this.next();
            return this.parseFunctionExpression(token);
          }
        }
        this.throwError(SyntaxCodeError.Unexpected, token);
      }
      case TokenType.BracketOpen: {
        return this.parseArrayExpression(token);
      }
      case TokenType.BraceOpen: {
        return this.parseObjectExpression(token);
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

  parseBlockStatement(identifier: Token): BlockStatement {
    const statement = [];
    while (this.peek().type !== TokenType.BraceClose) {
      statement.push(this.parseStatement());
    }
    return new BlockStatement(statement, identifier.position);
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
    return this.peek() ? this.peek().type === TokenType.EndOf : true;
  }

  throwError(code: SyntaxCodeError, format: Record<string, any>): never {
    format.position ? null : (format = { position: format });

    console.log(
      new SyntaxError(code, {
        line: format.position.line,
        column: format.position.column,
        ...format,
      }).genereteMessage([]),
    );
    process.exit(1);
  }
}

export { Parser };
