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
import { UpdateExpression } from "./expression/UpdateExpression";
import { ArrayExpression } from "./expression/ArrayExpression";
import { ObjectExpression } from "./expression/ObjectExpression";
import { TernaryExpression } from "./expression/TernaryExpression";
import { ImportDeclaration } from "./declaration/ImportDeclaration";
import { ExportsDeclaration } from "./declaration/ExportsDeclaration";
import { VariableDeclaration } from "./declaration/VariableDeclaration";
import { FunctionDeclaration } from "./declaration/FunctionDeclaration";
import { EnumDeclaration } from "./declaration/EnumDeclaration";
import { ThrowDeclaration } from "./declaration/ThrowDeclaration";
import { BlockStatement } from "./statement/BlockStatement";
import { ReturnStatement } from "./statement/ReturnStatement";
import { ForStatement } from "./statement/ForStatement";
import { BreakStatement } from "./statement/BreakStatement";
import { ContinueStatement } from "./statement/ContinueStatement";
import { IfStatement } from "./statement/IfStatement";
import { WhileStatement } from "./statement/WhileStatement";
import { TryCatchStatement } from "./statement/TryCatchStatement";
import { MatchStatement } from "./statement/MatchStatement";

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
        if (this.peek().type === TokenType.QuestionMark) {
          return this.parseTernaryExpression(expr);
        }
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

  parseArrayExpression(identifier: Token) {
    this.next(); // Skip '['

    const elements = [];

    while (this.peek().type !== TokenType.BracketClose) {
      elements.push(this.parsePrimary());

      if (this.peek().type === TokenType.Comma) {
        this.next(); // Skip ','
      } else if (this.peek().type === TokenType.BracketClose) {
        break;
      } else {
        this.expect(TokenType.BracketClose);
      }
    }

    this.next(); // Skip ']'

    this.expectSemicolonOrEnd();

    const arrayExpression = new ArrayExpression(elements, identifier.position);

    if (
      this.peek(-1).type !== TokenType.Semicolon &&
      (this.peek().type === TokenType.BracketOpen ||
        this.peek().type === TokenType.Period)
    ) {
      return this.parseMemberExpressions(arrayExpression);
    } else if (this.isOperator(this.peek().type)) {
      return this.parseExpression(arrayExpression);
    } else if (this.peek().type === TokenType.QuestionMark) {
      return this.parseTernaryExpression(arrayExpression);
    }

    return arrayExpression;
  }

  parseObjectExpression(identifier: Token) {
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
      this.peek(-1).type !== TokenType.Semicolon &&
      (this.peek().type === TokenType.BracketOpen ||
        this.peek().type === TokenType.Period)
    ) {
      return this.parseMemberExpressions(objExpression);
    } else if (this.isOperator(this.peek().type)) {
      return this.parseExpression(objExpression);
    } else if (this.peek().type === TokenType.QuestionMark) {
      return this.parseTernaryExpression(objExpression);
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
      case KeywordType.Return:
        this.next();
        return this.parseReturnStatement(this.peek());
      case KeywordType.If:
        this.next();
        return this.parseIfStatement(this.peek());
      case KeywordType.For:
        this.next();
        return this.parseForStatement(this.peek());
      case KeywordType.While:
        this.next();
        return this.parseWhileStatement(this.peek());
      case KeywordType.Break:
        return this.parseBreakStatement(this.peek());
      case KeywordType.Continue:
        return this.parseContinueStatement(this.peek());
      case KeywordType.Try:
        this.next();
        return this.parseTryCatchStatement(this.peek());
      case KeywordType.Throw:
        this.next();
        return this.parseThrowDeclaration(this.peek(-1));
      case KeywordType.Match:
        this.next();
        return this.parseMatchStatement(this.peek());
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
      case KeywordType.Enum:
        this.next();
        return this.parseEnumDeclaration(this.peek());
      default:
        this.throwError(SyntaxCodeError.InvalidUnexpectedToken, token.position);
    }
  }

  parseVariableDeclaration(identifier: Token): VariableDeclaration {
    this.next(); // Move past identifier

    if (this.peek().type !== TokenType.OperatorAssign) {
      this.expectSemicolonOrEnd();

      return new VariableDeclaration(
        identifier.value,
        new NilLiteral(identifier.position),
        { constant: false },
        identifier.position,
      );
    }

    this.expect(TokenType.OperatorAssign);
    this.next(); // Move past '='

    const expression = this.parseExpression();

    if (this.peek().value === KeywordType.As) {
      this.next(); // Move past 'as

      if (this.peek().value === KeywordType.Const) {
        this.next(); // Move past 'const'

        this.expectSemicolonOrEnd();

        return new VariableDeclaration(
          identifier.value,
          expression,
          { constant: true },
          identifier.position,
        );
      } else if (this.peek().value === KeywordType.Readonly) {
        this.next(); // Move past 'readonly'

        this.expectSemicolonOrEnd();

        return new VariableDeclaration(
          identifier.value,
          expression,
          { constant: true, readonly: true },
          identifier.position,
        );
      }
    }

    this.expectSemicolonOrEnd();

    return new VariableDeclaration(
      identifier.value,
      expression,
      { constant: false },
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

  parseReturnStatement(identifier: Token): ReturnStatement {
    if (this.peek().type === TokenType.Semicolon) {
      this.next(); // Move past ';'
      return new ReturnStatement(
        new NilLiteral(identifier.position),
        identifier.position,
      );
    }

    if (this.peek().type === TokenType.ParenthesisOpen) {
      this.next(); // Move past '('

      const valueExpression = this.parsePrimary();

      if (this.peek().type === TokenType.Comma) {
        this.next(); // Move past ','

        const valuesExpression = [valueExpression];

        while (this.peek().type !== TokenType.ParenthesisClose) {
          valuesExpression.push(this.parsePrimary());

          if (this.peek().type === TokenType.Comma) {
            this.next();
          }
        }

        this.expect(TokenType.ParenthesisClose);
        this.next(); // Move past ')'
        this.expectSemicolonOrEnd();

        return new ReturnStatement(valuesExpression, identifier.position);
      }

      const returns = new ReturnStatement(valueExpression, identifier.position);

      this.expect(TokenType.ParenthesisClose);
      this.next(); // Move past ')'

      this.expectSemicolonOrEnd();

      return returns;
    }

    const valueExpression = this.parsePrimary();

    if (this.peek().type === TokenType.Comma) {
      this.next(); // Move past ','

      const valuesExpression = [valueExpression];

      while (this.peek().type !== TokenType.Semicolon) {
        valuesExpression.push(this.parsePrimary());

        if (this.peek().type === TokenType.Comma) {
          this.next();
        }
      }

      this.expectSemicolonOrEnd();

      return new ReturnStatement(valuesExpression, identifier.position);
    }

    this.expectSemicolonOrEnd();

    return new ReturnStatement(valueExpression, identifier.position);
  }

  parseIfStatement(identifier: Token): IfStatement {
    this.expect(TokenType.ParenthesisOpen);
    this.next(); // Move past '('
    let test = this.parsePrimary();
    this.expect(TokenType.ParenthesisClose);
    this.next(); // Move past ')'

    let consequent: StmtType | null = null;

    if (this.peek().type === TokenType.BraceOpen) {
      this.next(); // Move past '{'
      consequent = this.parseBlockStatement(identifier);
      this.expect(TokenType.BraceClose);
      this.next(); // Move past '}'
    } else {
      consequent = this.parseStatement();
    }

    if (
      this.peek().type === TokenType.Keyword &&
      this.peek().value === KeywordType.Else
    ) {
      this.next(); // Move past 'else'
      if (
        this.peek().type === TokenType.Keyword &&
        this.peek().value === KeywordType.If
      ) {
        this.next(); // Move past 'if'
        const alternate = this.parseIfStatement(identifier);
        return new IfStatement(
          test,
          consequent,
          alternate,
          identifier.position,
        );
      }

      let alternate: StmtType | null = null;

      if (this.peek().type === TokenType.BraceOpen) {
        this.next(); // Move past '{'
        alternate = this.parseBlockStatement(identifier);
        this.expect(TokenType.BraceClose);
        this.next(); // Move past '}'
      } else {
        alternate = this.parseStatement();
      }

      this.expectSemicolonOrEnd();

      return new IfStatement(test, consequent, alternate, identifier.position);
    }

    this.expectSemicolonOrEnd();

    return new IfStatement(test, consequent, null, identifier.position);
  }

  parseForStatement(identifier: Token): ForStatement {
    this.expect(TokenType.ParenthesisOpen);
    this.next(); // Move past '('

    const init = this.parseStatement();

    if (this.peek(-1).type !== TokenType.Semicolon) {
      this.expect(TokenType.Semicolon);
      this.next(); // Move past ';'
    }

    const test = this.parseExpression();

    if (this.peek(-1).type !== TokenType.Semicolon) {
      this.expect(TokenType.Semicolon);
      this.next(); // Move past ';'
    }

    const update = this.parseExpression();

    this.expect(TokenType.ParenthesisClose);
    this.next(); // Move past ')'

    this.expect(TokenType.BraceOpen);
    this.next(); // Move past '{'
    const statement = this.parseBlockStatement(identifier);
    this.next(); // Move past '}'

    this.expectSemicolonOrEnd();

    return new ForStatement(init, test, update, statement, identifier.position);
  }

  parseWhileStatement(identifier: Token): WhileStatement {
    this.expect(TokenType.ParenthesisOpen);
    this.next(); // Move past '('

    const test = this.parsePrimary();

    this.expect(TokenType.ParenthesisClose);
    this.next(); // Move past ')'

    this.expect(TokenType.BraceOpen);
    this.next(); // Move past '{'
    const statement = this.parseBlockStatement(identifier);
    this.next(); // Move past '}'

    this.expectSemicolonOrEnd();

    return new WhileStatement(test, statement, identifier.position);
  }

  parseBreakStatement(identifier: Token): BreakStatement {
    this.next(); // Move past 'break'
    this.expectSemicolonOrEnd();
    return new BreakStatement(identifier.position);
  }

  parseContinueStatement(identifier: Token): ContinueStatement {
    this.next(); // Move past 'continue'
    this.expectSemicolonOrEnd();
    return new ContinueStatement(identifier.position);
  }

  parseTryCatchStatement(identifier: Token): TryCatchStatement {
    this.expect(TokenType.BraceOpen);
    this.next(); // Move past '{'

    const tryBlock = this.parseBlockStatement(identifier);
    this.next(); // Move past '}'

    if (
      this.peek().value !== KeywordType.Catch &&
      this.peek().value !== KeywordType.Finally
    ) {
      this.throwError(SyntaxCodeError.MissingCatchOrTry, {
        line: this.peek().position.line,
        column: this.peek().position.column,
      });
    }

    if (this.peek().value === KeywordType.Finally) {
      this.next(); // Move past 'finally'

      this.expect(TokenType.BraceOpen);
      this.next(); // Move past '{'
      const finallyBlock = this.parseBlockStatement(identifier);
      this.next(); // Move past '}'

      return new TryCatchStatement(
        tryBlock,
        null,
        finallyBlock,
        identifier.position,
      );
    }

    this.next(); // Move past 'catch'

    let catchVariables = null;

    if (this.peek().type === TokenType.ParenthesisOpen) {
      this.next(); // Move past '('

      this.expect(TokenType.Identifier);
      catchVariables = this.peek().value;
      this.next(); // Move past 'identifier'

      this.expect(TokenType.ParenthesisClose);
      this.next(); // Move past ')'
    }

    this.expect(TokenType.BraceOpen);
    this.next(); // Move past '{'
    const catchBlock: [string | null, BlockStatement] = [
      catchVariables,
      this.parseBlockStatement(identifier),
    ];
    this.next(); // Move past '}'

    if (this.peek().value === KeywordType.Finally) {
      this.next(); // Move past 'finally'

      this.expect(TokenType.BraceOpen);
      this.next(); // Move past '{'
      const finallyBlock = this.parseBlockStatement(identifier);
      this.next(); // Move past '}'

      return new TryCatchStatement(
        tryBlock,
        catchBlock,
        finallyBlock,
        identifier.position,
      );
    }

    return new TryCatchStatement(
      tryBlock,
      catchBlock,
      null,
      identifier.position,
    );
  }

  parseThrowDeclaration(identifier: Token): ThrowDeclaration {
    const expression = this.parsePrimary();
    this.expectSemicolonOrEnd();
    return new ThrowDeclaration(expression, identifier.position);
  }

  parseMatchStatement(identifier: Token): MatchStatement {
    this.expect(TokenType.ParenthesisOpen);
    this.next(); // Move past '('

    const test = this.parsePrimary();

    this.expect(TokenType.ParenthesisClose);
    this.next(); // Move past ')'

    this.expect(TokenType.BraceOpen);
    this.next(); // Move past '{'

    let defaultCase: StmtType | null = null;
    const cases: { condition: StmtType; block: StmtType }[] = [];

    while (this.peek().type !== TokenType.BraceClose) {
      if (this.peek().value === KeywordType.Case) {
        this.next(); // Move past 'case'
        this.expect(TokenType.ParenthesisOpen);
        this.next(); // Move past '('

        const condition = this.parsePrimary();

        this.expect(TokenType.ParenthesisClose);
        this.next(); // Move past ')'

        this.expect(TokenType.Colon);
        this.next(); // Move past ':'

        const listCase = [];

        if (this.peek().value === KeywordType.Case) {
          while (this.peek().value === KeywordType.Case) {
            this.next(); // Move past 'case'
            this.expect(TokenType.ParenthesisOpen);
            this.next(); // Move past '('

            const condition = this.parsePrimary();

            this.expect(TokenType.ParenthesisClose);
            this.next(); // Move past ')'

            this.expect(TokenType.Colon);
            this.next(); // Move past ':'

            listCase.push(condition);
          }
        }

        if (this.peek().type === TokenType.BraceOpen) {
          this.next(); // Move past '{'
          const blockStatement = this.parseBlockStatement(this.peek(-1));
          cases.push({
            condition,
            block: blockStatement,
          });
          cases.push(
            ...listCase.map((condition) => ({
              condition,
              block: blockStatement,
            })),
          );
          this.next(); // Move past '}'
        } else if (this.peek().value === KeywordType.Return) {
          this.next(); // Move past 'return'
          const returnStatement = this.parseReturnStatement(this.peek(-1));
          cases.push({
            condition,
            block: new BlockStatement(
              [returnStatement],
              returnStatement.position,
            ),
          });
          cases.push(
            ...listCase.map((condition) => ({
              condition,
              block: new BlockStatement(
                [returnStatement],
                returnStatement.position,
              ),
            })),
          );
        } else {
          const parsePrimary = this.parsePrimary();
          cases.push({
            condition,
            block: parsePrimary,
          });
          cases.push(
            ...listCase.map((condition) => ({
              condition,
              block: parsePrimary,
            })),
          );
        }
      } else if (this.peek().value === KeywordType.Default) {
        this.next(); // Move past 'default'
        this.expect(TokenType.Colon);
        this.next(); // Move past ':'

        if (this.peek().type === TokenType.BraceOpen) {
          this.next(); // Move past '{'
          defaultCase = this.parseBlockStatement(this.peek(-1));
          this.next(); // Move past '}'
        } else if (this.peek().value === KeywordType.Return) {
          this.next(); // Move past 'return'
          const returnStatement = this.parseReturnStatement(this.peek(-1));
          defaultCase = new BlockStatement(
            [returnStatement],
            returnStatement.position,
          );
        } else {
          defaultCase = this.parsePrimary();
        }
      } else {
        this.throwError(SyntaxCodeError.Unexpected, this.peek());
      }
    }

    this.next(); // Move past '}'

    return new MatchStatement(test, cases, defaultCase, identifier.position);
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

    this.expectSemicolonOrEnd();

    return new FunctionExpression(
      functionName,
      args,
      statement,
      identifier.position,
    );
  }

  parseFunctionCall(identifier: Token) {
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
    } else if (this.isOperator(this.peek().type)) {
      return this.parseExpression(functionCall);
    } else if (this.peek().type === TokenType.QuestionMark) {
      return this.parseTernaryExpression(functionCall);
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

  parseEnumDeclaration(identifier: Token): EnumDeclaration {
    this.expect(TokenType.Identifier);
    this.next(); // Move past 'identifier'
    this.expect(TokenType.BraceOpen);
    this.next(); // Move past '{'

    const identifierList: { name: IdentifierLiteral; value?: StmtType }[] = [];
    const functionsList: FunctionDeclaration[] = [];

    while (this.peek().type !== TokenType.BraceClose) {
      if (this.peek().type === TokenType.Identifier) {
        const name = new IdentifierLiteral(
          this.peek().value,
          this.peek().position,
        );
        this.next(); // Move past identifier

        if (this.peek().type === TokenType.Semicolon) {
          this.next(); // Move past ';'
          identifierList.push({
            name,
          });
          continue;
        }

        this.expect(TokenType.OperatorAssign);
        this.next(); // Move past '='

        const value = this.parsePrimary();

        identifierList.push({
          name,
          value,
        });

        this.expectSemicolonOrEnd();
      } else if (this.peek().value === KeywordType.Func) {
        this.next(); // Move past 'func'
        functionsList.push(this.parseFunctionDeclaration(this.peek()));
        this.expectSemicolonOrEnd();
      } else this.expect(TokenType.BraceClose);
    }

    this.next(); // Move past '}'

    this.expectSemicolonOrEnd();

    return new EnumDeclaration(
      identifier.value,
      identifierList,
      functionsList,
      identifier.position,
    );
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

  parseUpdateExpression(identifier: IdentifierLiteral): UpdateExpression {
    const operator = this.peek();

    this.next(); // Move past '++' or '--'

    this.expectSemicolonOrEnd();

    return new UpdateExpression(
      identifier,
      operator.value as OperatorType,
      operator.position,
    );
  }

  parseTernaryExpression(condition: StmtType): TernaryExpression {
    this.next(); // Move past '?'
    const expressionIfTrue = this.parsePrimary();

    if (this.peek().type === TokenType.QuestionMark) {
      return this.parseTernaryExpression(expressionIfTrue);
    }

    this.expect(TokenType.Colon);
    this.next(); // Move past ':'

    const expressionIfFalse = this.parsePrimary();

    if (this.peek().type === TokenType.QuestionMark) {
      return this.parseTernaryExpression(expressionIfFalse);
    }

    this.expectSemicolonOrEnd();

    return new TernaryExpression(
      condition,
      expressionIfTrue,
      expressionIfFalse,
      condition.position,
    );
  }

  parseUnaryExpression(operator: Token): VisitUnaryExpression {
    this.next(); // Move past '!', '+' and '-'

    const right = this.parsePrimary();

    this.expectSemicolonOrEnd();

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

  parseMethodCall(identifier: Token) {
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
    } else if (this.isOperator(this.peek().type)) {
      return this.parseExpression(callExpression);
    } else if (this.peek().type === TokenType.QuestionMark) {
      return this.parseTernaryExpression(callExpression);
    }

    this.expectSemicolonOrEnd();

    return callExpression;
  }

  parseMemberExpressions(identifier: StmtType) {
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
        if (this.peek(1).type === TokenType.ParenthesisOpen) {
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
      } else {
        this.throwError(SyntaxCodeError.Unexpected, this.peek());
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
    } else if (this.isOperator(this.peek().type)) {
      return this.parseExpression(object);
    } else if (this.peek().type === TokenType.QuestionMark) {
      return this.parseTernaryExpression(object);
    }

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
        } else if (this.peek(1).type === TokenType.QuestionMark) {
          this.next();
          return this.parseTernaryExpression(strings);
        }
        this.next();
        return strings;
      }
      case TokenType.Int: {
        const ints = new IntLiteral(token.value, token.position);
        if (this.isOperator(this.peek(1).type)) {
          this.next();
          return this.parseExpression(ints);
        } else if (this.peek(1).type === TokenType.QuestionMark) {
          this.next();
          return this.parseTernaryExpression(ints);
        }
        this.next();
        return ints;
      }
      case TokenType.Float: {
        const floats = new FloatLiteral(token.value, token.position);
        if (this.isOperator(this.peek(1).type)) {
          this.next();
          return this.parseExpression(floats);
        } else if (this.peek(1).type === TokenType.QuestionMark) {
          this.next();
          return this.parseTernaryExpression(floats);
        }
        this.next();
        return floats;
      }
      case TokenType.Bool: {
        const bools = new BoolLiteral(token.value, token.position);
        if (this.isOperator(this.peek(1).type)) {
          this.next();
          return this.parseExpression(bools);
        } else if (this.peek(1).type === TokenType.QuestionMark) {
          this.next();
          return this.parseTernaryExpression(bools);
        }
        this.next();
        return bools;
      }
      case TokenType.Nil: {
        const nils = new NilLiteral(token.position);
        if (this.isOperator(this.peek(1).type)) {
          this.next();
          return this.parseExpression(nils);
        } else if (this.peek(1).type === TokenType.QuestionMark) {
          this.next();
          return this.parseTernaryExpression(nils);
        }
        this.next();
        return nils;
      }
      case TokenType.Identifier: {
        const identifier = new IdentifierLiteral(token.value, token.position);
        if (this.isOperator(this.peek(1).type)) {
          this.next();
          return this.parseExpression(identifier);
        } else if (
          [OperatorType.PlusPlus, OperatorType.MinusMinus].includes(
            this.peek(1).value as OperatorType,
          )
        ) {
          this.next();
          return this.parseUpdateExpression(identifier);
        }
        if (this.peek(1).type === TokenType.ParenthesisOpen) {
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
        } else if (this.peek(1).type === TokenType.QuestionMark) {
          this.next();
          return this.parseTernaryExpression(identifier);
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

          if (
            this.peek().type === TokenType.BracketOpen ||
            this.peek().type === TokenType.Period
          ) {
            return this.parseMemberExpressions(importDeclaration);
          } else if (this.peek().type === TokenType.QuestionMark) {
            return this.parseTernaryExpression(importDeclaration);
          }

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
        const unary = this.parseUnaryExpression(token);
        if (this.peek().type === TokenType.QuestionMark) {
          return this.parseTernaryExpression(unary);
        }
        return unary;
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

        if (this.peek().type === TokenType.QuestionMark) {
          return this.parseTernaryExpression(expr);
        } else if (this.isOperator(this.peek().type)) {
          return this.parseExpression(expr);
        }

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

    throw new SyntaxError(code, {
      line: format.position.line,
      column: format.position.column,
      ...format,
    }).genereteMessage([]);
  }
}

export { Parser };
