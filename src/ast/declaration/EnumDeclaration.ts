import { StmtType, type ITextOptions } from "../StmtType";
import { type Position } from "../../lexer/token/Position";
import { Environment } from "../../Environment";
import { type FunctionDeclaration } from "./FunctionDeclaration";
import { FunctionExpression } from "../expression/FunctionExpression";
import { isTypeArgs } from "../../../library/utils/utils";
import { IdentifierLiteral } from "../types/IdentifierLiteral";

class EnumDeclaration extends StmtType {
  public readonly name: string;
  public readonly identifierList: Array<{
    name: IdentifierLiteral;
    value?: StmtType;
  }>;
  public readonly functionsList: FunctionDeclaration[];
  public readonly position: Position;

  constructor(
    name: string,
    identifierList: Array<{ name: IdentifierLiteral; value?: StmtType }>,
    functionsList: FunctionDeclaration[],
    position: Position,
  ) {
    super();
    this.name = name;

    this.identifierList = identifierList;

    this.functionsList = functionsList;

    this.position = position;
  }

  async evaluate(score: Environment) {
    try {
      score.create(this.name, {});

      const enumEnvironment = new Environment(score);

      let step = 1;
      let startIndex = 0;

      for (let i = 0; i < this.identifierList.length; i++) {
        const { value } = this.identifierList[i]!;

        if (value) {
          const evaluatedValue = await value.evaluate(enumEnvironment);

          if (typeof evaluatedValue === "number") {
            startIndex = evaluatedValue;

            if (i + 1 < this.identifierList.length) {
              const nextValue = this.identifierList[i + 1]?.value;

              if (nextValue) {
                const nextEvaluatedValue = await nextValue.evaluate(enumEnvironment);

                if (typeof nextEvaluatedValue === "number") {
                  step = nextEvaluatedValue - startIndex;
                }
              }
            }

            break;
          }
        }
      }

      let currentIndex = startIndex;

      for (const { name, value } of this.identifierList) {
        if (value) {
          const fieldValue = await value.evaluate(enumEnvironment);

          enumEnvironment.update(this.name, {
            ...enumEnvironment.get(this.name),
            [String(fieldValue) === "[object Object]" ? currentIndex : String(fieldValue)]:
              name.value,
            [name.value]: fieldValue,
          });
        } else {
          enumEnvironment.update(this.name, {
            ...enumEnvironment.get(this.name),
            [currentIndex]: name.value,
            [name.value]: currentIndex,
          });
        }

        currentIndex += step;
      }

      for (const func of this.functionsList) {
        enumEnvironment.update(this.name, {
          ...enumEnvironment.get(this.name),
          [func.name]: await func.evaluate(enumEnvironment),
        });

        const enumEnvironmentValues = enumEnvironment.get(this.name);

        const enumNamedValues = Object.entries(enumEnvironmentValues).filter(
          ([name, value]) => isNaN(Number(name)) && isTypeArgs(value) !== "function",
        );

        for (const [name, value] of enumNamedValues) {
          const funcDefineProto = new FunctionExpression(
            func.name,
            func.params,
            func.body,
            func.position,
          ).evaluate(new Environment(enumEnvironment));

          funcDefineProto.parentEnv.create("this", {
            ...Object.fromEntries(
              enumNamedValues.filter(([key]) => key !== name).map(([key]) => [key, null]),
            ),
            [name]: isTypeArgs(value) !== "object" ? { value } : value,
          });

          enumEnvironmentValues[name] = Object.defineProperty(
            isTypeArgs(value) !== "object" ? { value } : value,
            funcDefineProto.name!,
            {
              value: funcDefineProto,
              enumerable: false,
            },
          );
        }

        enumEnvironment.update(this.name, enumEnvironmentValues);
      }

      const enumNamed = this.name;

      const enumData = {
        ...enumEnvironment.get(this.name),
        *[Symbol.iterator]() {
          for (const [key, value] of Object.entries(enumEnvironment.get(enumNamed))) {
            yield [key, value];
          }
        },
      };

      Object.defineProperty(enumData, Environment.SymbolEnum, {
        value: true,
        enumerable: false,
      });

      score.update(this.name, enumData);

      return enumData;
    } catch (err) {
      throw super.throwErrorFormatters(err, score, ({ file, position }: ITextOptions) => {
        return `${this.name} (${file}:${position.line}:${position.column})`;
      });
    }
  }
}

export { EnumDeclaration };
