import { BaseError } from "../../src/errors/BaseError";
import { FunctionDeclaration } from "../../src/ast/declaration/FunctionDeclaration";
import { StructDeclaration } from "../../src/ast/declaration/StructDeclaration";
import { FunctionExpression } from "../../src/ast/expression/FunctionExpression";
import { StructExpression } from "../../src/ast/expression/StructExpression";
import { isSubclassOfByName } from "../../src/utils/isSubclassOfByName";
import { type FunctionBuilderConstructor } from "../FunctionBuilder";
import { Environment } from "../../src/Environment";

function isBuildModuleFunction(value: any): value is FunctionBuilderConstructor {
  if (!value) return false;

  return isSubclassOfByName(value, "FunctionBuilder");
}

function isFunctionNode(value: any): value is FunctionExpression | FunctionDeclaration {
  if (!value) return false;

  return value instanceof FunctionExpression || value instanceof FunctionDeclaration;
}

function formatFunctionName(
  fn: FunctionDeclaration | FunctionExpression | FunctionBuilderConstructor,
): Function {
  const name = fn?.name || "anonymous";
  return { [name]() {} }[name]!;
}

function formatStructName(struct: StructDeclaration | StructExpression): string {
  const fields = struct.fields.map(({ name }) => name);
  return `${struct.name || "<StructAnonymous>"} { ${JSON.stringify(fields.join(", "), null, fields.length > 8 ? 2 : 0)} }`;
}

function formatSpawn(spawnObj: any): string {
  const result = spawnObj?.[Environment.SpawnQueueSymbol]?._result;
  return `Spawn { ${result ?? "nil"} }`;
}

function processArray(arr: any[]): any[] {
  return arr.map((item) => {
    if (Array.isArray(item)) return processArray(item);
    if (item instanceof BaseError) return item.toString();
    if (item?.[Environment.SpawnQueueSymbol]) return formatSpawn(item);
    if (item === null || item === undefined) return "nil";
    if (isFunctionNode(item) || isBuildModuleFunction(item)) return formatFunctionName(item);
    if (item instanceof StructDeclaration || item instanceof StructExpression)
      return formatStructName(item);
    if (typeof item === "object") return processObject(item);
    return item;
  });
}

function processObject(obj: Record<string, any>): any {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith("__")) continue;

    if (Array.isArray(value)) {
      result[key] = processArray(value);
    } else if (value instanceof BaseError) {
      result[key] = value.toString();
    } else if (value?.[Environment.SpawnQueueSymbol]) {
      result[key] = formatSpawn(value);
    } else if (value === null || value === undefined) {
      result[key] = "nil";
    } else if (isFunctionNode(value) || isBuildModuleFunction(value)) {
      result[key] = formatFunctionName(value);
    } else if (value instanceof StructDeclaration || value instanceof StructExpression) {
      result[key] = formatStructName(value);
    } else if (typeof value === "object") {
      result[key] = processObject(value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

function formattersText(args: any[]): any {
  const first = args[0];

  if (first instanceof BaseError) {
    return first.toString();
  } else if (first && typeof first === "object" && Environment.SymbolFormatedText in first) {
    return first[Environment.SymbolFormatedText];
  }

  return args.map((value) => {
    if (Array.isArray(value)) return processArray(value);
    if (isSubclassOfByName(value, "Bytes")) return `Bytes { ${value.length} }`;
    if (value instanceof BaseError) return value.toString();
    if (value?.[Environment.SpawnQueueSymbol]) return formatSpawn(value);
    if (value === null || value === undefined) return "nil";
    if (isFunctionNode(value) || isBuildModuleFunction(value)) return formatFunctionName(value);
    if (value instanceof StructDeclaration || value instanceof StructExpression)
      return formatStructName(value);
    if (typeof value === "object") return processObject(value);
    return value;
  });
}

export { formattersText };
