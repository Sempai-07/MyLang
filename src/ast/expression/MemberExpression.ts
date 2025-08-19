import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/token/Position";
import { Environment } from "../../Environment";
import { StringLiteral } from "../types/StringLiteral";
import { IdentifierLiteral } from "../types/IdentifierLiteral";
import { StructDeclaration } from "../declaration/StructDeclaration";
import { IntLiteral } from "../types/IntLiteral";
import { BaseError } from "../../errors/BaseError";
import { isTypeArgs } from "../../../library/utils/utils";

class MemberExpression extends StmtType {
  public readonly obj: StmtType;
  public readonly property: StmtType;
  public readonly position: Position;
  public readonly computed: boolean;
  public readonly optional?: boolean;

  constructor(
    obj: StmtType,
    property: StmtType,
    computed: boolean = false,
    optional: boolean = false,
    position: Position,
  ) {
    super();

    this.obj = obj;

    this.property = property;

    this.position = position;

    this.computed = computed;

    this.optional = optional;
  }

  async evaluate(score: Environment) {
    try {
      const objectValue = await this.obj.evaluate(score);

      if (this.optional && (objectValue === null || objectValue === undefined)) {
        return null;
      }

      if (objectValue === null || objectValue === undefined) {
        throw new BaseError(`Cannot read property of nil`);
      }

      let propertyKey: string | number | symbol;

      if (this.computed) {
        const key = await this.property.evaluate(score);

        if (isTypeArgs(key) === "string" || isTypeArgs(key) === "int" || typeof key === "symbol") {
          propertyKey = key;
        } else {
          propertyKey = String(key);
        }
      } else {
        if (this.property instanceof StringLiteral) {
          propertyKey = this.property.value;
        } else if (this.property instanceof IntLiteral) {
          const evaluateValue = this.property.evaluate();
          if (typeof evaluateValue === "bigint") {
            throw new BaseError("Invalid property access in non-computed member expression");
          }
          propertyKey = evaluateValue;
        } else if (this.property instanceof IdentifierLiteral) {
          const evaluateValue = this.property.evaluate(score);
          if (isTypeArgs(evaluateValue) !== "int" && isTypeArgs(evaluateValue) !== "string") {
            throw new BaseError("Invalid property access in non-computed member expression");
          }
          propertyKey = evaluateValue;
        } else {
          throw new BaseError("Invalid property access in non-computed member expression");
        }
      }

      if (
        typeof propertyKey === "string" &&
        ([
          "__proto__",
          "constructor",
          "prototype",
          "eval",
          "Function",
          "require",
          "process",
          "global",
          "window",
        ].includes(propertyKey) ||
          propertyKey.startsWith("__") ||
          (propertyKey !== "name" && objectValue instanceof StructDeclaration))
      ) {
        throw new BaseError(`Access to property '${String(propertyKey)}' is not allowed`);
      }

      const value = objectValue[propertyKey];

      if (!this.optional && value === undefined) {
        throw new BaseError(`Property '${String(propertyKey)}' does not exist on object`);
      }

      if (
        typeof value === "function" ||
        value instanceof StructDeclaration ||
        this.isNodeFunction(value) ||
        this.isBuildModuleFunction(value)
      ) {
        let isSafe = false;
        if (
          !isSafe &&
          (this.isNodeFunction(value) ||
            this.isBuildModuleFunction(value) ||
            value instanceof StructDeclaration)
        ) {
          isSafe = true;
        }

        if (!isSafe) {
          throw new BaseError(`Access to function '${String(propertyKey)}' is not allowed`);
        }
      }

      return value === undefined ? null : value;
    } catch (err) {
      if (err instanceof BaseError) {
        err.files = Array.from(new Set([score.get("import").main, ...err.files])).map((file) => {
          if (file === score.get("import").main) {
            return `${file}:${this.position.line}:${this.position.column}`;
          }
          return file;
        });
      }
      throw err;
    }
  }
}

export { MemberExpression };
