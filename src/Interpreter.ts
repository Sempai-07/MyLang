import { NativeFunction } from "./Environment";
/** AST */
import type { StmtType } from "./ast/StmtType";
import { StringLiteral } from "./ast/type/StringLiteral";
import { NumberLiteral } from "./ast/type/NumberLiteral";
import { FunctionCall } from "./ast/function/FunctionCall";
import { FunctionDeclaration } from "./ast/function/FunctionDeclaration";
import { VariableDeclaration } from "./ast/declaration/VariableDeclaration";
import { ImportDeclaration } from "./ast/declaration/ImportDeclaration";
import { BinaryExpression } from "./ast/expression/BinaryExpression";
import { VisitUnaryExpression } from "./ast/expression/VisitUnaryExpression";
import { BlockStatement } from "./ast/expression/BlockStatement";
import { CallExpression } from "./ast/expression/CallExpression";
import { MemberExpression } from "./ast/expression/MemberExpression";
import { Assignment } from "./ast/expression/Assignment";
import { IdentifierLiteral } from "./ast/type/IdentifierLiteral";
/** Native */
import { print } from "./native/function/print";

class Interpreter {
  public readonly ast: StmtType[] = [];
  public readonly globalScore: Record<string, any> = {};

  constructor(ast: StmtType[] = [], options: Record<string, any>) {
    this.ast = ast;
    this.globalScore = {
      print: {
        func: print,
        [NativeFunction]: true,
      },
      import: {
        base: options.base,
        main: options.main,
        cache: {},
      },
    };
  }

  run() {
    for (const body of this.ast) {
      this.parseAst(body);
    }
  }

  parseAst(body: StmtType) {
    switch (true) {
      case body instanceof StringLiteral:
      case body instanceof NumberLiteral:
      case body instanceof FunctionCall:
      case body instanceof FunctionDeclaration:
      case body instanceof VariableDeclaration:
      case body instanceof ImportDeclaration:
      case body instanceof BinaryExpression:
      case body instanceof VisitUnaryExpression:
      case body instanceof CallExpression:
      case body instanceof MemberExpression:
      case body instanceof Assignment:
      case body instanceof IdentifierLiteral:
      case body instanceof BlockStatement:
        return body.evaluate(this.globalScore);
      default:
        console.log(body);
        throw new Error("Unknown AST node type encountered");
    }
  }
}

export { Interpreter };
