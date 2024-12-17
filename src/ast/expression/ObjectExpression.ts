import { StmtType } from "../StmtType";
import { IdentifierLiteral } from "../types/IdentifierLiteral";
import { type Position } from "../../lexer/Position";
import { type Environment } from "../../Environment";
import { StringLiteral } from "../types/StringLiteral";
import { FunctionExpression } from "../expression/FunctionExpression";

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

  override evaluate(score: Environment): any {
    let result: Record<string, any> = {};

    for (const property of this.properties) {
      if (
        property.key instanceof IdentifierLiteral &&
        !property.computed &&
        property.value
      ) {
        if (property.value instanceof FunctionExpression) {
          (<FunctionExpression>property.value).name = property.key.value;
        }
        result[property.key.value] = property.value.evaluate(score);
      } else if (
        property.key instanceof IdentifierLiteral &&
        property.computed &&
        property.value
      ) {
        result[property.key.evaluate(score)] = property.value.evaluate(score);
      } else if (typeof property.key === "string" && property.value) {
        if (property.value instanceof FunctionExpression) {
          (<FunctionExpression>property.value).name = property.key;
        }
        result[property.key] = property.value.evaluate(score);
      } else {
        if (
          property.key instanceof StringLiteral &&
          property.value instanceof FunctionExpression
        ) {
          (<FunctionExpression>property.value).name = (<StringLiteral>(
            property.key
          )).value;
        }
        result[String((<StmtType>property.key).evaluate(score))] =
          property.value!.evaluate(score);
      }
    }

    return result;
  }
}

export { ObjectExpression };
