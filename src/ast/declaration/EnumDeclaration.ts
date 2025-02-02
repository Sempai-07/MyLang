import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/Position";
import { Environment } from "../../Environment";
import { BaseError } from "../../errors/BaseError";
import { type FunctionDeclaration } from "./FunctionDeclaration";
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

  evaluate(score: Environment) {
    try {
      score.create(this.name, {});

      const enumEnvironment = new Environment(score);

      let step = 1;
      let startIndex = 0;

      for (let i = 0; i < this.identifierList.length; i++) {
        const { value } = this.identifierList[i]!;
        if (value) {
          const evaluatedValue = value.evaluate(enumEnvironment);
          if (typeof evaluatedValue === "number") {
            startIndex = evaluatedValue;
            if (i + 1 < this.identifierList.length) {
              const nextValue = this.identifierList[i + 1]?.value;
              if (nextValue) {
                const nextEvaluatedValue = nextValue.evaluate(enumEnvironment);
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

      this.identifierList.forEach(({ name, value }) => {
        if (value) {
          const fieldValue = value.evaluate(enumEnvironment);
          enumEnvironment.update(this.name, {
            ...enumEnvironment.get(this.name),
            [String(fieldValue) === "[object Object]"
              ? currentIndex
              : String(fieldValue)]: name.value,
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
      });

      this.functionsList.forEach((func) => {
        enumEnvironment.update(this.name, {
          ...enumEnvironment.get(this.name),
          [func.name]: func.evaluate(enumEnvironment),
        });
      });

      const enumData = {
        ...enumEnvironment.get(this.name),
        *[Symbol.iterator]() {
          for (const [key, value] of Object.entries(
            enumEnvironment.get(this.name),
          )) {
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
      if (err instanceof BaseError) {
        err.files = Array.from(
          new Set([score.get("import").main, ...err.files]),
        ).map((file) => {
          if (file === score.get("import").main) {
            return `${this.name} (${file}:${this.position.line}:${this.position.column})`;
          }
          return file;
        });
      }
      throw err;
    }
  }
}

export { EnumDeclaration };
