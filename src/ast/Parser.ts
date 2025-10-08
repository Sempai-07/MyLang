import { type StmtType } from "./StmtType";
import { Token } from "../lexer/token/Token";
import { TokenType, OperatorType, KeywordType, ReflectType } from "../lexer/token/TokenType";
import { SyntaxError, SyntaxCodeError } from "../errors/lexer/SyntaxError";

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
import { StructExpression } from "./expression/StructExpression";
import { ReflectionExpression } from "./expression/ReflectionExpression";
import { DeferDeclaration } from "./declaration/DeferDeclaration";
import { ImportDeclaration } from "./declaration/ImportDeclaration";
import { ExportsDeclaration } from "./declaration/ExportsDeclaration";
import { VariableDeclaration } from "./declaration/VariableDeclaration";
import { CombinedVariableDeclaration } from "./declaration/CombinedVariableDeclaration";
import { FunctionDeclaration } from "./declaration/FunctionDeclaration";
import { EnumDeclaration } from "./declaration/EnumDeclaration";
import { ThrowDeclaration } from "./declaration/ThrowDeclaration";
import { StructDeclaration } from "./declaration/StructDeclaration";
import { WaitExpression } from "./expression/WaitExpression";
import { SpawnExpression } from "./expression/SpawnExpression";
import { BlockStatement } from "./statement/BlockStatement";
import { ReturnStatement } from "./statement/ReturnStatement";
import { ForStatement } from "./statement/ForStatement";
import { ForInStatement } from "./statement/ForInStatement";
import { BreakStatement } from "./statement/BreakStatement";
import { ContinueStatement } from "./statement/ContinueStatement";
import { IfStatement } from "./statement/IfStatement";
import { WhileStatement } from "./statement/WhileStatement";
import { TryCatchStatement } from "./statement/TryCatchStatement";
import { MatchStatement } from "./statement/MatchStatement";
import { emitWarning } from "../errors/utils/WarningError";

import { type IOptionsVar } from "../Environment";

let isSpawnExperimental = false;

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
      case TokenType.OperatorNot:
      case TokenType.OperatorBitNot: {
        return this.parseUnaryExpression(token);
      }
      case TokenType.Reflect: {
        return this.parseReflectExpression(token);
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
      default: {
        this.throwError(SyntaxCodeError.InvalidUnexpectedToken, token);
      }
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
        this.peek().type === TokenType.Period ||
        (this.peek(0).type === TokenType.QuestionMark &&
          (this.peek(1).type === TokenType.BracketOpen || this.peek(1).type === TokenType.Period)))
    ) {
      return this.parseMemberExpressions(arrayExpression);
    } else if (this.isOperator(this.peek().type)) {
      return this.parseExpression(arrayExpression);
    } else if (this.isReflectOperator(this.peek().value)) {
      return this.parseReflectExpression(arrayExpression);
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
        this.peek().type === TokenType.Period ||
        (this.peek().type === TokenType.QuestionMark &&
          (this.peek(1).type === TokenType.BracketOpen || this.peek(1).type === TokenType.Period)))
    ) {
      return this.parseMemberExpressions(objExpression);
    } else if (this.isOperator(this.peek().type)) {
      return this.parseExpression(objExpression);
    } else if (this.isReflectOperator(this.peek().value)) {
      return this.parseReflectExpression(objExpression);
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
      case KeywordType.Defer:
        this.next();
        return this.parseDeferDeclaration(this.peek(-1));
      case KeywordType.Import:
        if (
          this.peek(1).type === TokenType.BracketOpen ||
          this.peek(1).type === TokenType.Period ||
          (this.peek(1).type === TokenType.QuestionMark &&
            (this.peek(2).type === TokenType.BracketOpen || this.peek(2).type === TokenType.Period))
        ) {
          this.next();
          return this.parseMemberExpressions(new IdentifierLiteral(token.value, token.position));
        }
        this.next();
        return this.parseImportDeclaration(this.peek());
      case KeywordType.Export:
        this.next();
        return this.parseExportDeclaration(this.peek());
      case KeywordType.Enum:
        this.next();
        return this.parseEnumDeclaration(this.peek());
      case KeywordType.Spawn:
        if (!isSpawnExperimental) {
          emitWarning('"spawn" or "wait" is experimental.', {
            name: "WaitExperimental",
            code: "WARN003",
          });
          isSpawnExperimental = true;
        }
        this.next();
        return this.parseSpawnExpression(this.peek(-1));
      case KeywordType.Wait:
        this.next();
        return this.parseWaitExpression(this.peek(-1));
      case KeywordType.Struct:
        this.next();
        return this.parseStructDeclaration(this.peek(-1));
      default: {
        this.throwError(SyntaxCodeError.InvalidUnexpectedToken, token.position);
      }
    }
  }

  parseVariableDeclaration(identifier: Token): VariableDeclaration | CombinedVariableDeclaration {
    if (this.peek().type === TokenType.ParenthesisOpen) {
      this.next(); // Move past '('

      const variableList: {
        name: string;
        value: StmtType;
        options?: IOptionsVar;
      }[] = [];

      while (this.peek().type !== TokenType.ParenthesisClose) {
        this.expect(TokenType.Identifier);
        const name = this.peek();
        this.next(); // Move past identifier
        if (this.peek().type === TokenType.OperatorAssign) {
          this.next(); // Move past '='
          const value = this.parsePrimary();

          if (this.peek().value === KeywordType.As) {
            this.next(); // Move past 'as'
            if (this.peek().value === KeywordType.Const) {
              this.next(); // Move past 'const'
              variableList.push({
                name: name.value,
                value,
                options: {
                  constant: true,
                },
              });
            } else if (this.peek().value === KeywordType.Readonly) {
              this.next(); // Move past 'readonly'
              variableList.push({
                name: name.value,
                value,
                options: {
                  constant: true,
                  readonly: true,
                },
              });
            } else if (this.peek().value === KeywordType.Lazy) {
              this.next(); // Move past 'lazy'
              variableList.push({
                name: name.value,
                value,
                options: {
                  constant: true,
                  lazy: true,
                },
              });
            }
          } else {
            variableList.push({
              name: name.value,
              value,
            });
          }
        } else {
          variableList.push({
            name: name.value,
            value: new NilLiteral(name.position),
          });
        }

        if (this.peek().type === TokenType.Comma) {
          this.next(); // Move past ','
        } else this.expect(TokenType.ParenthesisClose);
      }

      this.next(); // Move past ')'

      let allOptionsVar: IOptionsVar | null = null;

      if (this.peek().value === KeywordType.As) {
        this.next(); // Move past 'as'
        if (this.peek().value === KeywordType.Const) {
          this.next(); // Move past 'const'
          allOptionsVar = { constant: true };
        } else if (this.peek().value === KeywordType.Readonly) {
          this.next(); // Move past 'readonly'
          allOptionsVar = { constant: true, readonly: true };
        } else if (this.peek().value === KeywordType.Lazy) {
          this.next(); // Move past 'lazy'
          allOptionsVar = { constant: true, lazy: true };
        }
      }

      if (allOptionsVar) {
        variableList.forEach(({ name, options }) => {
          if (options) {
            this.throwError(SyntaxCodeError.AlreadyAsInvalid, {
              name,
              varType: options.readonly ? "readonly" : "const",
              currentAsType: allOptionsVar.readonly ? "readonly" : "const",
              position: this.peek(-1).position,
            });
          }
        });
      }

      this.expectSemicolonOrEnd();

      return new CombinedVariableDeclaration(variableList, allOptionsVar, identifier.position);
    }

    this.next(); // Move past Identifier

    if (this.peek().type !== TokenType.OperatorAssign) {
      this.expectSemicolonOrEnd();

      return new VariableDeclaration(
        identifier.value,
        new NilLiteral(identifier.position),
        null,
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
      } else if (this.peek().value === KeywordType.Lazy) {
        this.next(); // Move past 'lazy'

        this.expectSemicolonOrEnd();

        return new VariableDeclaration(
          identifier.value,
          expression,
          { constant: true, lazy: true },
          identifier.position,
        );
      }
    }

    this.expectSemicolonOrEnd();

    return new VariableDeclaration(identifier.value, expression, null, identifier.position);
  }

  parseSpawnExpression(identifier: Token, isWait: boolean = false): SpawnExpression {
    if (!isSpawnExperimental) {
      emitWarning('"spawn" or "wait" is experimental.', {
        name: "WaitExperimental",
        code: "WARN003",
      });
      isSpawnExperimental = true;
    }

    if (this.peek().type === TokenType.BraceOpen) {
      this.next(); // Move past '{'

      const blockStatement = this.parseBlockStatement(this.peek(-1));

      this.expect(TokenType.BraceClose);
      this.next(); // Move past '}'

      return new SpawnExpression(blockStatement, isWait, identifier.position);
    }

    const value = this.parsePrimary();

    return new SpawnExpression(value, isWait, identifier.position);
  }

  parseWaitExpression(identifier: Token): WaitExpression | SpawnExpression {
    if (!isSpawnExperimental) {
      emitWarning('"spawn" or "wait" is experimental.', {
        name: "WaitExperimental",
        code: "WARN003",
      });
      isSpawnExperimental = true;
    }

    if (this.peek().value === KeywordType.Spawn) {
      this.next();

      const spawnExpression = this.parseSpawnExpression(this.peek(-1), true);
      return new WaitExpression(spawnExpression, identifier.position);
    }

    const value = this.parsePrimary();

    this.expectSemicolonOrEnd();

    return new WaitExpression(value, identifier.position);
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

    return new FunctionDeclaration(identifier.value, args, statement, identifier.position);
  }

  parseReturnStatement(identifier: Token): ReturnStatement {
    if (this.peek().type === TokenType.Semicolon) {
      this.next(); // Move past ';'
      return new ReturnStatement(new NilLiteral(identifier.position), identifier.position);
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

    if (this.peek().type === TokenType.Keyword && this.peek().value === KeywordType.Else) {
      this.next(); // Move past 'else'
      if (this.peek().type === TokenType.Keyword && this.peek().value === KeywordType.If) {
        this.next(); // Move past 'if'
        const alternate = this.parseIfStatement(identifier);
        return new IfStatement(test, consequent, alternate, identifier.position);
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

  parseForStatement(identifier: Token): ForStatement | ForInStatement {
    if (this.peek().type === TokenType.BraceOpen) {
      this.next(); // Move past '{'
      const statement = this.parseBlockStatement(identifier);
      this.next(); // Move past '}'

      this.expectSemicolonOrEnd();

      return new ForStatement(null, null, null, statement, identifier.position);
    }

    this.expect(TokenType.ParenthesisOpen);
    this.next(); // Move past '('

    if (this.peek().type === TokenType.Semicolon) {
      if (
        this.peek(1).type === TokenType.Semicolon &&
        this.peek(2).type === TokenType.ParenthesisClose
      ) {
        this.next(); // Move past ';'
        this.next(); // Move past ';'
        this.next(); // Move past ')'

        this.expect(TokenType.BraceOpen);
        this.next(); // Move past '{'
        const statement = this.parseBlockStatement(identifier);
        this.next(); // Move past '}'

        this.expectSemicolonOrEnd();

        return new ForStatement(null, null, null, statement, identifier.position);
      } else if (
        this.peek(1).type === TokenType.Semicolon &&
        this.peek(2).type !== TokenType.ParenthesisClose
      ) {
        this.next(); // Move past ';'
        this.next(); // Move past ';'

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

        return new ForStatement(null, null, update, statement, identifier.position);
      } else if (this.peek().type === TokenType.Semicolon) {
        this.next(); // Move past ';'
        const test = this.parseStatement();
        if (
          this.peek().type === TokenType.Semicolon &&
          this.peek(1).type === TokenType.ParenthesisClose
        ) {
          this.next(); // Move past ';'
          this.expect(TokenType.ParenthesisClose);
          this.next(); // Move past ')'

          this.expect(TokenType.BraceOpen);
          this.next(); // Move past '{'
          const statement = this.parseBlockStatement(identifier);
          this.next(); // Move past '}'

          this.expectSemicolonOrEnd();

          return new ForStatement(null, test, null, statement, identifier.position);
        } else {
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

          return new ForStatement(null, test, update, statement, identifier.position);
        }
      }
    }

    const init = this.parseStatement();

    if (this.peek().type === TokenType.Semicolon) {
      if (this.peek(1).type === TokenType.ParenthesisClose) {
        this.next(); // Move past ';'
        this.next(); // Move past ')'

        this.expect(TokenType.BraceOpen);
        this.next(); // Move past '{'
        const statement = this.parseBlockStatement(identifier);
        this.next(); // Move past '}'

        this.expectSemicolonOrEnd();

        return new ForStatement(init, null, null, statement, identifier.position);
      }
    }

    if (this.peek().value === ReflectType.In) {
      this.next(); // Move past 'in'
      const iterable = this.parsePrimary();

      this.expect(TokenType.ParenthesisClose);
      this.next(); // Move past ')'

      this.expect(TokenType.BraceOpen);
      this.next(); // Move past '{'
      const statement = this.parseBlockStatement(identifier);
      this.next(); // Move past '}'

      this.expectSemicolonOrEnd();

      return new ForInStatement(init, iterable, statement, identifier.position);
    }

    if (this.peek(-1).type !== TokenType.Semicolon) {
      this.expect(TokenType.Semicolon);
      this.next(); // Move past ';'
    }

    if (
      this.peek(-1).type === TokenType.Semicolon &&
      this.peek().type !== TokenType.ParenthesisClose
    ) {
      const test = this.parseExpression();
      if (this.peek(-1).type !== TokenType.Semicolon) {
        this.expect(TokenType.Semicolon);
        this.next(); // Move past ';'
      }

      if (this.peek().type !== TokenType.ParenthesisClose) {
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

      this.expect(TokenType.ParenthesisClose);
      this.next(); // Move past ')'

      this.expect(TokenType.BraceOpen);
      this.next(); // Move past '{'
      const statement = this.parseBlockStatement(identifier);
      this.next(); // Move past '}'

      this.expectSemicolonOrEnd();

      return new ForStatement(init, test, null, statement, identifier.position);
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

    if (this.peek().value !== KeywordType.Catch && this.peek().value !== KeywordType.Finally) {
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

      return new TryCatchStatement(tryBlock, null, finallyBlock, identifier.position);
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

      return new TryCatchStatement(tryBlock, catchBlock, finallyBlock, identifier.position);
    }

    return new TryCatchStatement(tryBlock, catchBlock, null, identifier.position);
  }

  parseThrowDeclaration(identifier: Token): ThrowDeclaration {
    const expression = this.parsePrimary();

    if (this.peek().value === KeywordType.As) {
      this.next(); // Move past 'as'
      const throwOptions = this.parsePrimary();
      this.expectSemicolonOrEnd();
      return new ThrowDeclaration(expression, throwOptions, identifier.position);
    }

    this.expectSemicolonOrEnd();
    return new ThrowDeclaration(expression, null, identifier.position);
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

        let condition!: StmtType;

        if (this.peek().type === TokenType.Period) {
          this.next(); // Move past '.'
          if (
            this.peek().type === TokenType.Identifier &&
            this.peek(1).type === TokenType.ParenthesisClose
          ) {
            const property = this.peek();

            condition = new MemberExpression(
              test,
              new StringLiteral(property.value, property.position),
              false,
              false,
              this.peek(-1).position,
            );

            this.next(); // Move past 'identifier'
          } else if (
            this.peek().type === TokenType.Identifier &&
            (this.peek(1).type === TokenType.Period ||
              this.peek(1).type === TokenType.BracketOpen ||
              (this.peek(1).type === TokenType.QuestionMark &&
                (this.peek(2).type === TokenType.BracketOpen ||
                  this.peek(2).type === TokenType.Period)))
          ) {
            this.next(); // Move past '[' or '.'

            const property = this.peek(-1);
            condition = this.parseMemberExpressions(
              new MemberExpression(
                test,
                new StringLiteral(property.value, property.position),
                this.peek().type === TokenType.BracketOpen,
                false,
                property.position,
              ),
            );
          } else if (
            this.peek().type === TokenType.Identifier &&
            this.peek(1).type === TokenType.ParenthesisOpen
          ) {
            const identifier = this.peek();
            this.next(); // Move past 'identifier'
            this.next(); // Move past '('

            const args = this.parseArguments();

            this.expect(TokenType.ParenthesisClose);
            this.next(); // Move past ')'

            condition = new CallExpression(
              identifier.value,
              identifier.value,
              test as IdentifierLiteral,
              args,
              identifier.position,
            );
          }
        } else {
          condition = this.parsePrimary();
        }

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
            block: new BlockStatement([returnStatement], returnStatement.position),
          });
          cases.push(
            ...listCase.map((condition) => ({
              condition,
              block: new BlockStatement([returnStatement], returnStatement.position),
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
          defaultCase = new BlockStatement([returnStatement], returnStatement.position);
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

    return new FunctionExpression(functionName, args, statement, identifier.position);
  }

  parseFunctionCall(identifier: Token) {
    this.next(); // Move past identifier
    this.expect(TokenType.ParenthesisOpen);
    this.next(); // Move past '('

    const args = this.parseArguments();

    this.expect(TokenType.ParenthesisClose);
    this.next(); // Move past ')'

    const functionCall = new FunctionCall(identifier.value, args, identifier.position);

    if (
      this.peek().type === TokenType.BracketOpen ||
      this.peek().type === TokenType.Period ||
      (this.peek().type === TokenType.QuestionMark &&
        (this.peek(1).type === TokenType.BracketOpen || this.peek(1).type === TokenType.Period))
    ) {
      return this.parseMemberExpressions(functionCall);
    } else if (this.isOperator(this.peek().type)) {
      return this.parseExpression(functionCall);
    } else if (this.isReflectOperator(this.peek().value)) {
      return this.parseReflectExpression(functionCall);
    } else if (this.peek().type === TokenType.QuestionMark) {
      return this.parseTernaryExpression(functionCall);
    }

    this.expectSemicolonOrEnd();

    return functionCall;
  }

  parseDeferDeclaration(identifier: Token): DeferDeclaration {
    if (this.peek().type === TokenType.BraceOpen) {
      this.next(); // Move past '{'
      const value = this.parseBlockStatement(identifier);
      this.next(); // Move past '}'
      this.expectSemicolonOrEnd();
      return new DeferDeclaration(value, identifier.position);
    }

    const value = this.parsePrimary();
    this.expectSemicolonOrEnd();
    return new DeferDeclaration(value, identifier.position);
  }

  parseImportDeclaration(identifier: Token, expression: boolean = false): ImportDeclaration {
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
            (this.peek().type !== TokenType.Identifier || this.peek().type !== TokenType.String) &&
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
            (this.peek().type !== TokenType.Identifier || this.peek().type !== TokenType.String) &&
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

      return new ImportDeclaration(packages, null, null, expression, identifier.position);
    }

    if (this.peek().type === TokenType.ParenthesisOpen && expression) {
      this.next(); // Move past '('

      this.expect(TokenType.String);
      const packageName = this.peek().value;
      this.next(); // Move past string
      this.expect(TokenType.ParenthesisClose);
      this.next(); // Move past ')'

      this.expectSemicolonOrEnd();

      return new ImportDeclaration(packageName, null, null, expression, identifier.position);
    }

    this.expect(TokenType.String);
    const packageName = this.peek().value;
    this.next(); // Move past string

    if (this.peek().value === KeywordType.As) {
      this.next(); // Move past 'as'

      if (this.peek().type === TokenType.Identifier) {
        const value = this.peek().value;
        this.next(); // Move past identifier
        this.expectSemicolonOrEnd();

        return new ImportDeclaration(packageName, null, value, expression, identifier.position);
      } else {
        this.expect(TokenType.BraceOpen);
        this.next(); // Move past '{'

        const destructuringList: string[] = [];

        while (this.peek().type !== TokenType.BraceClose) {
          this.expect(TokenType.Identifier);
          destructuringList.push(this.peek().value);
          this.next(); // Move past identifier
          if (this.peek().type !== TokenType.BraceClose) {
            this.expect(TokenType.Comma);
            this.next(); // Move past ','
          }
        }

        this.next(); // Move past '}'

        this.expectSemicolonOrEnd();

        return new ImportDeclaration(
          packageName,
          destructuringList,
          null,
          expression,
          identifier.position,
        );
      }
    }

    this.expectSemicolonOrEnd();

    return new ImportDeclaration(packageName, null, null, expression, identifier.position);
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
            (this.peek().type !== TokenType.Identifier || this.peek().type !== TokenType.String) &&
            this.peek().type !== TokenType.ParenthesisClose
          ) {
            this.expect(TokenType.Comma);
          } else continue;
        }

        exports[exportName.value] = new IdentifierLiteral(exportName.value, exportName.position);

        if (
          (this.peek().type !== TokenType.Identifier || this.peek().type !== TokenType.String) &&
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
          (this.peek().type !== TokenType.Identifier || this.peek().type !== TokenType.String) &&
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
        const name = new IdentifierLiteral(this.peek().value, this.peek().position);
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

  parseStructDeclaration(identifier: Token): StructDeclaration {
    this.expect(TokenType.Identifier);
    const structName = this.peek().value;
    this.next(); // Move past 'identifier'

    this.expect(TokenType.BraceOpen);
    this.next();

    const structFields: VariableDeclaration[] = [];
    const structMethods: FunctionDeclaration[] = [];

    while (this.peek().type !== TokenType.BraceClose) {
      if (this.peek().value === KeywordType.Var) {
        this.next(); // Move past 'var'

        const variable = this.parseVariableDeclaration(this.peek());

        if (variable instanceof CombinedVariableDeclaration) {
          this.throwError(SyntaxCodeError.StructValidFields, variable);
        }

        structFields.push(variable);
      } else if (this.peek().value === KeywordType.Func) {
        this.next(); // Move past 'func'
        structMethods.push(this.parseFunctionDeclaration(this.peek()));
      } else {
        this.expect(TokenType.BraceClose);
      }
    }

    this.next(); // Move past '}'

    this.expectSemicolonOrEnd();

    return new StructDeclaration(structName, structFields, structMethods, identifier.position);
  }

  parseStructExpression(identifier: Token): StructExpression {
    let structName = null;

    if (this.peek().type === TokenType.Identifier) {
      structName = this.peek().value;
      this.next(); // Move past 'identifier'
    }

    this.expect(TokenType.BraceOpen);
    this.next();

    const structFields: VariableDeclaration[] = [];
    const structMethods: FunctionDeclaration[] = [];

    while (this.peek().type !== TokenType.BraceClose) {
      if (this.peek().value === KeywordType.Var) {
        this.next(); // Move past 'var'

        const variable = this.parseVariableDeclaration(this.peek());

        if (variable instanceof CombinedVariableDeclaration) {
          this.throwError(SyntaxCodeError.StructValidFields, variable);
        }

        structFields.push(variable);
      } else if (this.peek().value === KeywordType.Func) {
        this.next(); // Move past 'func'
        structMethods.push(this.parseFunctionDeclaration(this.peek()));
      } else {
        this.expect(TokenType.BraceClose);
      }
    }

    this.next(); // Move past '}'

    this.expectSemicolonOrEnd();

    return new StructExpression(structName, structFields, structMethods, identifier.position);
  }

  parseExpression(left?: StmtType, precedence = 0): StmtType {
    left ??= this.parsePrimary();

    while (this.getPrecedence(this.peek()) > precedence) {
      const operator = this.peek();
      this.next();

      const right = this.parsePrimary(this.getPrecedence(operator));

      left = new BinaryExpression(operator.value as OperatorType, left, right, operator.position);
    }

    return left;
  }

  parseUpdateExpression(identifier: IdentifierLiteral): UpdateExpression {
    const operator = this.peek();

    this.next(); // Move past '++' or '--'

    this.expectSemicolonOrEnd();

    return new UpdateExpression(identifier, operator.value as OperatorType, operator.position);
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
    this.next(); // Move past '!', '+', '~' and '-'

    const right = this.parsePrimary();

    this.expectSemicolonOrEnd();

    return new VisitUnaryExpression(operator.value as OperatorType, right, operator.position);
  }

  parseReflectExpression(left: Token | StmtType): ReflectionExpression {
    const operator = this.peek();
    this.next();

    if (this.peek().type === TokenType.ParenthesisOpen) {
      this.next(); // Move past '('

      const right = this.parsePrimary();

      this.expect(TokenType.ParenthesisClose);
      this.next(); // Move past ')'

      const reflect = new ReflectionExpression(
        operator.value as ReflectType,
        left instanceof Token ? null : left,
        right,
        operator.position,
      );

      if (this.isReflectOperator(this.peek().value)) {
        return this.parseReflectExpression(reflect);
      }

      return reflect;
    }

    const right = this.parsePrimary();

    this.expectSemicolonOrEnd();

    const reflect = new ReflectionExpression(
      operator.value as ReflectType,
      left instanceof Token ? null : left,
      right,
      operator.position,
    );

    if (this.isReflectOperator(this.peek().value)) {
      return this.parseReflectExpression(reflect);
    }

    return reflect;
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

  parseArgumentsAndDefault(): [string, StmtType, true?][] {
    const args: [string, StmtType, true?][] = [];

    while (this.peek().type !== TokenType.ParenthesisClose) {
      if (this.peek().type === TokenType.OperatorRest) {
        this.next(); // Move past '...'
        this.expect(TokenType.Identifier);
        const param = this.peek();
        this.next(); // Move past identifier
        args.push([param.value, new NilLiteral(param.position), true]);

        if (this.peek().type !== TokenType.ParenthesisClose) {
          this.throwError(SyntaxCodeError.RestInvalid, this.peek());
        }
        break;
      }

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
      this.peek().type === TokenType.Period ||
      (this.peek().type === TokenType.QuestionMark &&
        (this.peek(1).type === TokenType.BracketOpen || this.peek(1).type === TokenType.Period))
    ) {
      return this.parseMemberExpressions(callExpression);
    } else if (this.isOperator(this.peek().type)) {
      return this.parseExpression(callExpression);
    } else if (this.isReflectOperator(this.peek().value)) {
      return this.parseReflectExpression(callExpression);
    } else if (this.peek().type === TokenType.QuestionMark) {
      return this.parseTernaryExpression(callExpression);
    }

    this.expectSemicolonOrEnd();

    return callExpression;
  }

  parseMemberExpressions(identifier: StmtType): any {
    const isMemberExpression = (token: TokenType) =>
      token === TokenType.BracketOpen ||
      token === TokenType.Period ||
      (token === TokenType.QuestionMark &&
        (this.peek(1).type === TokenType.BracketOpen || this.peek(1).type === TokenType.Period));

    let object = identifier;

    const isComputed = this.peek().type === TokenType.BracketOpen;

    while (isMemberExpression(this.peek().type)) {
      let isOptional = false;
      if (this.peek().type === TokenType.QuestionMark) {
        this.next(); // Move past '?'
        isOptional = true;
      }
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

          const callExpression = new CallExpression(
            "value" in identifier ? <string>identifier.value : methodName.value,
            property,
            object as MemberExpression,
            args,
            methodName.position,
          );

          if (isMemberExpression(this.peek().type)) {
            return this.parseMemberExpressions(callExpression);
          }

          return callExpression;
        }
      } else if (tokenType === TokenType.Period) {
        if (this.peek(1).type === TokenType.ParenthesisOpen) {
          const methodName = new StringLiteral(this.peek().value, this.peek().position);
          this.next(); // Move past identifier

          this.next(); // Move past '('
          const args = this.parseArguments();
          this.expect(TokenType.ParenthesisClose);
          this.next(); // Move past ')'

          this.expectSemicolonOrEnd();

          const callExpression = new CallExpression(
            methodName.value,
            methodName.value,
            object as MemberExpression,
            args,
            methodName.position,
          );

          if (isMemberExpression(this.peek().type)) {
            return this.parseMemberExpressions(callExpression);
          }

          return callExpression;
        }

        property = new StringLiteral(this.peek().value, this.peek().position);
        this.next(); // Move past identifier
      } else {
        this.throwError(SyntaxCodeError.Unexpected, this.peek());
      }

      object = new MemberExpression(object, property, isComputed, isOptional, object.position);
    }

    if (this.isOperatorAssign(this.peek().type)) {
      const tokenType = this.peek();
      this.next(); // Move past assign operator
      const expression = this.parsePrimary();

      this.expectSemicolonOrEnd();

      return new AssignmentExpression(object, tokenType.type, expression, tokenType.position);
    } else if (this.isOperator(this.peek().type)) {
      return this.parseExpression(object);
    } else if (this.isReflectOperator(this.peek().value)) {
      return this.parseReflectExpression(object);
    } else if (this.peek().type === TokenType.QuestionMark) {
      return this.parseTernaryExpression(object);
    }

    return object;
  }

  parseAssignmentExpression(token: StmtType): AssignmentExpression {
    if (!this.isOperatorAssign(this.peek().type)) {
      throw `Unexpected assignment ${this.peek().type}`;
    }

    const tokenType = this.peek();
    this.next(); // Move past assign operator

    const expression = this.parsePrimary();

    this.expectSemicolonOrEnd();

    return new AssignmentExpression(token, tokenType.type, expression, tokenType.position);
  }

  parsePrimary(precedence?: number): StmtType {
    const token = this.peek();

    switch (token.type) {
      case TokenType.String: {
        const strings = new StringLiteral(token.value, token.position);
        if (
          !(
            this.isUnaryOperator(this.peek(-1).type) || this.isReflectOperator(this.peek(-1).value)
          ) &&
          this.isOperator(this.peek(1).type)
        ) {
          this.next();
          return this.parseExpression(strings, precedence);
        } else if (this.isReflectOperator(this.peek(1).value)) {
          this.next();
          return this.parseReflectExpression(strings);
        } else if (this.peek(1).type === TokenType.QuestionMark) {
          this.next();
          return this.parseTernaryExpression(strings);
        } else if (
          this.peek(1).type === TokenType.BracketOpen ||
          this.peek(1).type === TokenType.Period ||
          (this.peek(1).type === TokenType.QuestionMark &&
            (this.peek(2).type === TokenType.BracketOpen || this.peek(2).type === TokenType.Period))
        ) {
          this.next();
          return this.parseMemberExpressions(strings);
        }
        this.next();
        return strings;
      }
      case TokenType.Int: {
        const ints = new IntLiteral(token.value, token.position);
        if (
          !(
            this.isUnaryOperator(this.peek(-1).type) || this.isReflectOperator(this.peek(-1).value)
          ) &&
          this.isOperator(this.peek(1).type)
        ) {
          this.next();
          return this.parseExpression(ints, precedence);
        } else if (this.isReflectOperator(this.peek(1).value)) {
          this.next();
          return this.parseReflectExpression(ints);
        } else if (this.peek(1).type === TokenType.QuestionMark) {
          this.next();
          return this.parseTernaryExpression(ints);
        }
        this.next();
        return ints;
      }
      case TokenType.Float: {
        const floats = new FloatLiteral(token.value, token.position);
        if (
          !(
            this.isUnaryOperator(this.peek(-1).type) || this.isReflectOperator(this.peek(-1).value)
          ) &&
          this.isOperator(this.peek(1).type)
        ) {
          this.next();
          return this.parseExpression(floats, precedence);
        } else if (this.isReflectOperator(this.peek(1).value)) {
          this.next();
          return this.parseReflectExpression(floats);
        } else if (this.peek(1).type === TokenType.QuestionMark) {
          this.next();
          return this.parseTernaryExpression(floats);
        }
        this.next();
        return floats;
      }
      case TokenType.Bool: {
        const bools = new BoolLiteral(token.value, token.position);
        if (
          !(
            this.isUnaryOperator(this.peek(-1).type) || this.isReflectOperator(this.peek(-1).value)
          ) &&
          this.isOperator(this.peek(1).type)
        ) {
          this.next();
          return this.parseExpression(bools, precedence);
        } else if (this.isReflectOperator(this.peek(1).value)) {
          this.next();
          return this.parseReflectExpression(bools);
        } else if (this.peek(1).type === TokenType.QuestionMark) {
          this.next();
          return this.parseTernaryExpression(bools);
        }
        this.next();
        return bools;
      }
      case TokenType.Nil: {
        const nils = new NilLiteral(token.position);
        if (
          !(
            this.isUnaryOperator(this.peek(-1).type) || this.isReflectOperator(this.peek(-1).value)
          ) &&
          this.isOperator(this.peek(1).type)
        ) {
          this.next();
          return this.parseExpression(nils, precedence);
        } else if (this.isReflectOperator(this.peek(1).value)) {
          this.next();
          return this.parseReflectExpression(nils);
        } else if (this.peek(1).type === TokenType.QuestionMark) {
          this.next();
          return this.parseTernaryExpression(nils);
        }
        this.next();
        return nils;
      }
      case TokenType.Identifier: {
        const identifier = new IdentifierLiteral(token.value, token.position);
        if (
          !(
            this.isUnaryOperator(this.peek(-1).type) || this.isReflectOperator(this.peek(-1).value)
          ) &&
          this.isOperator(this.peek(1).type)
        ) {
          this.next();
          return this.parseExpression(identifier, precedence);
        } else if (this.isReflectOperator(this.peek(1).value)) {
          this.next();
          return this.parseReflectExpression(identifier);
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
          this.peek(1).type === TokenType.Period ||
          (this.peek(1).type === TokenType.QuestionMark &&
            (this.peek(2).type === TokenType.BracketOpen || this.peek(2).type === TokenType.Period))
        ) {
          this.next();
          return this.parseMemberExpressions(identifier);
        } else if (this.isOperatorAssign(this.peek(1).type)) {
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
            this.peek(1).type === TokenType.Period ||
            (this.peek(1).type === TokenType.QuestionMark &&
              (this.peek(2).type === TokenType.BracketOpen ||
                this.peek(2).type === TokenType.Period))
          ) {
            this.next();
            return this.parseMemberExpressions(new IdentifierLiteral(token.value, token.position));
          }
          this.next();

          const importDeclaration = this.parseImportDeclaration(this.peek(), true);

          if (
            this.peek().type === TokenType.BracketOpen ||
            this.peek().type === TokenType.Period ||
            (this.peek().type === TokenType.QuestionMark &&
              (this.peek(1).type === TokenType.BracketOpen ||
                this.peek(1).type === TokenType.Period))
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
        } else if (token.value === KeywordType.Match) {
          this.next();
          return this.parseMatchStatement(this.peek());
        } else if (token.value === KeywordType.Wait) {
          this.next();
          return this.parseWaitExpression(this.peek(-1));
        } else if (token.value === KeywordType.Spawn) {
          if (!isSpawnExperimental) {
            emitWarning('"spawn" or "wait" is experimental.', {
              name: "WaitExperimental",
              code: "WARN003",
            });
            isSpawnExperimental = true;
          }
          this.next();
          return this.parseSpawnExpression(this.peek(-1));
        } else if (token.value === KeywordType.Struct) {
          this.next();
          return this.parseStructExpression(this.peek(-1));
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
      case TokenType.OperatorNot:
      case TokenType.OperatorBitNot: {
        const unary = this.parseUnaryExpression(token);
        if (this.peek().type === TokenType.QuestionMark) {
          return this.parseTernaryExpression(unary);
        }
        return unary;
      }
      case TokenType.Reflect: {
        const reflect = this.parseReflectExpression(token);
        if (this.peek().type === TokenType.QuestionMark) {
          return this.parseTernaryExpression(reflect);
        }
        return reflect;
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
          return this.parseExpression(expr, precedence);
        } else if (this.isReflectOperator(this.peek().value)) {
          return this.parseReflectExpression(expr);
        }

        return expr;
      }
      default: {
        this.throwError(SyntaxCodeError.Unexpected, token);
      }
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
      TokenType.OperatorExponentiation,
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
      TokenType.OperatorBitXor,
      TokenType.OperatorShiftLeft,
      TokenType.OperatorShiftRight,
      TokenType.OperatorShiftRightZeroFill,
    ].includes(tokenType);
  }

  isOperatorAssign(tokenType: TokenType): boolean {
    return [
      TokenType.OperatorAssign,
      TokenType.OperatorAssignPlus,
      TokenType.OperatorAssignMinus,
      TokenType.OperatorAssignMultiply,
      TokenType.OperatorAssignDivide,
      TokenType.OperatorAssignModule,
      TokenType.OperatorAssignPow,
      TokenType.OperatorAndAssign,
      TokenType.OperatorOrAssign,
      TokenType.OperatorBitAndAssign,
      TokenType.OperatorBitOrAssign,
      TokenType.OperatorBitXorAssign,
      TokenType.OperatorShiftLeftAssign,
      TokenType.OperatorShiftRightAssign,
      TokenType.OperatorShiftRightZeroFillAssign,
    ].includes(tokenType);
  }

  isUnaryOperator(tokenType: TokenType): boolean {
    return [
      TokenType.OperatorAdd,
      TokenType.OperatorSubtract,
      TokenType.OperatorNot,
      TokenType.OperatorBitNot,
    ].includes(tokenType);
  }

  isReflectOperator(tokenValue: string): boolean {
    return [ReflectType.Typeof, ReflectType.In].includes(tokenValue as ReflectType);
  }

  getPrecedence(tokenType: Token) {
    switch (tokenType.type) {
      case TokenType.OperatorBitNot:
        return 16;
      case TokenType.OperatorExponentiation:
        return 15;
      case TokenType.OperatorMultiply:
        return 14;
      case TokenType.OperatorDivide:
        return 14;
      case TokenType.OperatorModulo:
        return 14;
      case TokenType.OperatorAdd:
        return 13;
      case TokenType.OperatorSubtract:
        return 13;
      case TokenType.OperatorShiftLeft:
        return 12;
      case TokenType.OperatorShiftRight:
        return 12;
      case TokenType.OperatorShiftRightZeroFill:
        return 12;
      case TokenType.OperatorLessThan:
        return 11;
      case TokenType.OperatorGreaterThan:
        return 11;
      case TokenType.OperatorLessThanOrEqual:
        return 11;
      case TokenType.OperatorGreaterThanOrEqual:
        return 11;
      case TokenType.OperatorEqual:
        return 10;
      case TokenType.OperatorNotEqual:
        return 10;
      case TokenType.OperatorAnd:
        return 9;
      case TokenType.OperatorBitXor:
        return 8;
      case TokenType.OperatorOr:
        return 7;
      case TokenType.OperatorLogicalAnd:
        return 6;
      case TokenType.OperatorLogicalOr:
        return 5;
      default:
        return 0;
    }
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
    });
  }
}

export { Parser };
