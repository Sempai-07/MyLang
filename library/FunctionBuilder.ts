import { type StmtType } from "../src/ast/StmtType";
import { Environment } from "../src/Environment";
import { BaseError } from "../src/errors/BaseError";
import { formatMessage } from "../src/errors/utils";
import { isSubclassOfByName } from "../src/utils/isSubclassOfByName";
import { FunctionDeclaration } from "../src/ast/declaration/FunctionDeclaration";
import { FunctionExpression } from "../src/ast/expression/FunctionExpression";
import { StructExpression } from "../src/ast/expression/StructExpression";
import { StructDeclaration } from "../src/ast/declaration/StructDeclaration";

interface IPkgInfo {
  name: string;
  path: string;
}

interface FunctionBuilderConstructor {
  new (args: any[], astArgs: StmtType[], env: Environment): FunctionBuilder;
}

enum FunctionBuilderCodeError {
  ArgumentsTypeError = "ARGUMENTS_TYPE_ERROR",
  ArgumentsFirstTypeError = "ARGUMENTS_FIRST_TYPE_ERROR",
}

const FunctionBuilderMessageError = {
  [FunctionBuilderCodeError.ArgumentsFirstTypeError]:
    "The first argument must be of type ${expectType}. Received ${received}",
  [FunctionBuilderCodeError.ArgumentsTypeError]:
    "Argument ${propsName} must be of type ${expectType}. Received ${received}",
};

abstract class FunctionBuilder {
  public readonly args: any[];
  public readonly astArgs: StmtType[];
  public readonly environment: Environment;

  constructor(args: any[], astArgs: StmtType[], environment: Environment) {
    this.args = args;

    this.astArgs = astArgs;

    this.environment = environment;
  }

  abstract get pkgInfo(): IPkgInfo;

  abstract call(): any;

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
    err: Error | FunctionBuilderCodeError,
    format?: Record<string, any>,
  ): BaseError {
    if (err instanceof Error) {
      return new BaseError(err.toString(), {
        files: [`${this.constructor.name} (${this.pkgInfo.path}  mylang:${this.pkgInfo.name})`],
      });
    }

    return new BaseError(
      format
        ? formatMessage(FunctionBuilderMessageError[err], format)
        : FunctionBuilderMessageError[err],
      {
        files: [`${this.constructor.name} (${this.pkgInfo.path} mylang:${this.pkgInfo.name})`],
      },
    );
  }
}

export {
  FunctionBuilder,
  FunctionBuilderCodeError,
  FunctionBuilderMessageError,
  type FunctionBuilderConstructor,
};
