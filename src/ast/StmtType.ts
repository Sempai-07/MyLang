import type { StringLiteral } from "./type/StringLiteral";
import type { NumberLiteral } from "./type/NumberLiteral";
import type { IdentifierLiteral } from "./type/IdentifierLiteral";
import type { FunctionCall } from "./function/FunctionCall";
import type { FunctionDeclaration } from "./function/FunctionDeclaration";
import type { BinaryExpression } from "./expression/BinaryExpression";
import type { VisitUnaryExpression } from "./expression/VisitUnaryExpression";
import type { BlockStatement } from "./expression/BlockStatement";
import type { FunctionExpression } from "./expression/FunctionExpression";
import type { CallExpression } from "./expression/CallExpression";
import type { MemberExpression } from "./expression/MemberExpression";
import type { Assignment } from "./expression/Assignment";
import type { ImportDeclaration } from "./declaration/ImportDeclaration";

type StmtType =
  | StringLiteral
  | NumberLiteral
  | IdentifierLiteral
  | FunctionCall
  | FunctionDeclaration
  | BinaryExpression
  | VisitUnaryExpression
  | BlockStatement
  | FunctionExpression
  | CallExpression
  | Assignment
  | MemberExpression
  | ImportDeclaration;

export { type StmtType };
