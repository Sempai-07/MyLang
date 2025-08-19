import { BaseError } from "../../src/errors/BaseError";
import { Environment } from "../../src/Environment";
import { StructDeclaration } from "../../src/ast/declaration/StructDeclaration";
import { FunctionDeclaration } from "../../src/ast/declaration/FunctionDeclaration";
import { FunctionExpression } from "../../src/ast/expression/FunctionExpression";
import { StructExpression } from "../../src/ast/expression/StructExpression";
import { isSubclassOfByName } from "../../src/utils/isSubclassOfByName";

function isTypeArgs(argsType: any) {
  if (argsType === undefined || argsType === null) {
    return "nil";
  }

  const type = typeof argsType;

  if (type === "bigint") {
    return "bigint";
  }

  if (type === "number") {
    if (isNaN(argsType)) {
      return "nan";
    }
    if (!isFinite(argsType)) {
      return "infinity";
    }
    return Number.isInteger(argsType) ? "int" : "float";
  }

  if (type === "function" && isSubclassOfByName(argsType, "FunctionBuilder")) {
    return "function";
  }

  if (type === "object") {
    if (argsType instanceof BaseError) {
      return "error";
    }
    if (Array.isArray(argsType)) {
      return "array";
    }
    if (argsType instanceof FunctionExpression || argsType instanceof FunctionDeclaration) {
      return "function";
    }
    if (argsType?.[Environment.SymbolEnum]) {
      return "enum";
    }
    if (
      argsType instanceof StructDeclaration ||
      argsType instanceof StructExpression ||
      argsType?.[Environment.SymbolStruct]
    ) {
      return "struct";
    }
    return "object";
  }

  if (type === "boolean") {
    return "boolean";
  }

  return "string";
}

export { isTypeArgs };
