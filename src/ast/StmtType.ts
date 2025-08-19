import { Environment } from "../Environment";
import { type Position } from "../lexer/token/Position";
import { BaseError } from "../errors/BaseError";
import { isSubclassOfByName } from "../utils/isSubclassOfByName";
import { type FunctionBuilderConstructor } from "../../library/FunctionBuilder";

interface ITextOptions {
  file: string;
  position: Position;
}

abstract class StmtType {
  abstract position: Position;

  abstract evaluate(score?: Environment): any;

  isBuildModuleFunction(value: any): value is FunctionBuilderConstructor {
    if (!value) return false;

    return isSubclassOfByName(value, "FunctionBuilder");
  }

  isNodeFunction(value: any): value is FunctionExpression | FunctionDeclaration {
    if (!value) return false;

    return value instanceof FunctionExpression || value instanceof FunctionDeclaration;
  }

  isStructData(value: any): value is StructExpression | StructDeclaration {
    if (!value) return false;

    return value instanceof StructExpression || value instanceof StructDeclaration;
  }

  throwErrorFormatters(
    err: any,
    score: Environment,
    options?: Record<string, any>,
  ): BaseError | Error;
  throwErrorFormatters(
    err: any,
    score: Environment,
    onOptions?: (opts: ITextOptions) => string,
  ): BaseError | Error;
  throwErrorFormatters(
    err: any,
    score: Environment,
    onOptions?: Record<string, any> | ((opts: ITextOptions) => string),
  ): BaseError | Error {
    if (err instanceof BaseError) {
      err.files = Array.from(new Set([score.get("import").main, ...err.files])).map((file) => {
        if (file === score.get("import").main) {
          if (typeof onOptions === "function") {
            return onOptions({ file, position: this.position });
          }

          if (this.constructor.name === "ArrayExpression") {
            return `ArrayExpression ${file}:${this.position.line}:${this.position.column} (index ${onOptions?.index || 0})`;
          }

          return `${this.constructor.name} ${file}:${this.position.line}:${this.position.column}`;
        }
        return file;
      });
    }
    return err;
  }
}

import { FunctionDeclaration } from "./declaration/FunctionDeclaration";
import { FunctionExpression } from "./expression/FunctionExpression";
import { StructDeclaration } from "./declaration/StructDeclaration";
import { StructExpression } from "./expression/StructExpression";

export { StmtType, type ITextOptions };
