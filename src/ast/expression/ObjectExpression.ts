import { StmtType } from "../StmtType";
import { IdentifierLiteral } from "../types/IdentifierLiteral";
import { type Position } from "../../lexer/token/Position";
import { Environment } from "../../Environment";
import { StringLiteral } from "../types/StringLiteral";
import { FunctionExpression } from "../expression/FunctionExpression";
import { StructExpression } from "../expression/StructExpression";

class ObjectExpression extends StmtType {
  public readonly position: Position;
  public readonly properties: {
    key: StmtType | string;
    value: StmtType | null;
    computed?: true;
  }[];

  constructor(
    properties: {
      key: StmtType | string;
      value: StmtType | null;
      computed?: true;
    }[],
    position: Position,
  ) {
    super();

    this.properties = properties;

    this.position = position;
  }

  async evaluate(score: Environment) {
    try {
      const result: Record<string, any> = {};

      for (const property of this.properties) {
        const { key, value, computed } = property;

        if (key instanceof IdentifierLiteral && !computed && value) {
          if (value instanceof FunctionExpression || value instanceof StructExpression) {
            value.name = key.value;
          }
          result[key.value] = await value.evaluate(score);
          continue;
        }

        if (key instanceof IdentifierLiteral && computed && value) {
          const evaluatedKey = await key.evaluate(score);
          result[evaluatedKey] = await value.evaluate(score);
          continue;
        }

        if (typeof key === "string" && value) {
          if (value instanceof FunctionExpression || value instanceof StructExpression) {
            value.name = key;
          }
          result[key] = await value.evaluate(score);
          continue;
        }

        if (
          key instanceof StringLiteral &&
          (value instanceof FunctionExpression || value instanceof StructExpression)
        ) {
          value.name = key.value;
        }

        const evaluatedKey = await (key as StmtType).evaluate(score);

        if (evaluatedKey === Environment.SymbolIterator) {
          Object.defineProperty(result, evaluatedKey, {
            value: await value!.evaluate(score),
            enumerable: true,
            configurable: true,
            writable: false,
          });
        } else {
          result[String(evaluatedKey)] = await value!.evaluate(score);
        }
      }

      return result;
    } catch (err) {
      throw super.throwErrorFormatters(err, score);
    }
  }
}

export { ObjectExpression };
