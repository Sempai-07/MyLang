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
import { Assignment } from "./ast/expression/Assignment";
import { IdentifierLiteral } from "./ast/type/IdentifierLiteral";
/** Native */
import { print } from "./native/function/print";

const NativeFunction = Symbol("NativeFunction");

class Interpreter {
  public readonly ast: StmtType[] = [];
  public readonly globalScore: Record<string, any> = {};

  constructor(ast: StmtType[] = []) {
    this.ast = ast;
    this.globalScore = {
      print: {
        func: print,
        [NativeFunction]: true,
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
      case body instanceof Assignment:
      case body instanceof IdentifierLiteral:
        return body.evaluate(this.globalScore);
      case body instanceof BlockStatement:
        let result: unknown = null;
        for (const bo of body.evaluate()) {
          const evaluate = bo.evaluate(this.globalScore);

          if (evaluate) {
            result = evaluate;
          }
        }
        return result;
      default:
        console.log(body);
        throw new Error("Unknown AST node type encountered");
    }
  }
}

export { Interpreter, NativeFunction };
