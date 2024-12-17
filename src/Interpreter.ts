import fs from "node:fs";
import path from "node:path";
import { type StmtType } from "./ast/StmtType";
import { StringLiteral } from "./ast/types/StringLiteral";
import { IntLiteral } from "./ast/types/IntLiteral";
import { FloatLiteral } from "./ast/types/FloatLiteral";
import { BoolLiteral } from "./ast/types/BoolLiteral";
import { NilLiteral } from "./ast/types/NilLiteral";
import { IdentifierLiteral } from "./ast/types/IdentifierLiteral";
import { BinaryExpression } from "./ast/expression/BinaryExpression";
import { CallExpression } from "./ast/expression/CallExpression";
import { VisitUnaryExpression } from "./ast/expression/VisitUnaryExpression";
import { FunctionCall } from "./ast/expression/FunctionCall";
import { MemberExpression } from "./ast/expression/MemberExpression";
import { AssignmentExpression } from "./ast/expression/AssignmentExpression";
import { ArrayExpression } from "./ast/expression/ArrayExpression";
import { ObjectExpression } from "./ast/expression/ObjectExpression";
import { ImportDeclaration } from "./ast/declaration/ImportDeclaration";
import { ExportsDeclaration } from "./ast/declaration/ExportsDeclaration";
import { VariableDeclaration } from "./ast/declaration/VariableDeclaration";
import { FunctionDeclaration } from "./ast/declaration/FunctionDeclaration";
import { BlockStatement } from "./ast/statement/BlockStatement";
import { Environment } from "./Environment";

class Interpreter {
  public readonly ast: StmtType[];
  public readonly globalScore: Environment;

  constructor(ast: StmtType[], paths: string[], options: Record<string, any>) {
    this.ast = ast;

    this.globalScore = new Environment();

    this.globalScore.create("import", {
      base: options.base,
      main: options.main,
      cache: {},
      paths,
      resolve([moduleName]: [string]) {
        if (
          moduleName &&
          (path.parse(moduleName).ext === ".ml" ||
            path.parse(moduleName).ext === ".json")
        ) {
          const resolvedPath = path.resolve(options.base, moduleName);

          if (fs.existsSync(resolvedPath)) {
            return resolvedPath;
          }
        }
        throw `Cannot find module '${moduleName}'`;
      },
    });

    this.globalScore.create("process", {
      env: process.env,
    });

    this.globalScore.create("#exports", {});
  }

  run() {
    for (const body of this.ast) {
      this.parseAst(body);
    }
  }

  parseAst(body: StmtType) {
    switch (true) {
      case body instanceof StringLiteral:
      case body instanceof IntLiteral:
      case body instanceof FloatLiteral:
      case body instanceof BoolLiteral:
      case body instanceof NilLiteral:
      case body instanceof IdentifierLiteral:
      case body instanceof BinaryExpression:
      case body instanceof CallExpression:
      case body instanceof MemberExpression:
      case body instanceof ArrayExpression:
      case body instanceof ObjectExpression:
      case body instanceof AssignmentExpression:
      case body instanceof ImportDeclaration:
      case body instanceof ExportsDeclaration:
      case body instanceof VariableDeclaration:
      case body instanceof FunctionDeclaration:
      case body instanceof FunctionCall:
      case body instanceof VisitUnaryExpression:
      case body instanceof BlockStatement:
        return body.evaluate(this.globalScore);
      default:
        console.log(body);
        throw new Error("Unknown AST node type encountered");
    }
  }
}

export { Interpreter };
