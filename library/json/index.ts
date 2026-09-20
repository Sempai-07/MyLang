import { FunctionBuilder, FunctionBuilderCodeError } from "../FunctionBuilder";
import { Environment } from "../../src/Environment";
import { type StmtType } from "../../src/ast/StmtType";
import { isTypeArgs } from "../utils/utils";

abstract class JsonMethodBuilder extends FunctionBuilder {
  constructor(args: any[], astArgs: StmtType[], environment: Environment) {
    super(args, astArgs, environment);
  }

  get pkgInfo() {
    return {
      name: "json",
      path: __dirname,
    };
  }

  protected validateString(str: any, argName: string = "string"): void {
    if (isTypeArgs(str) !== "string") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "string",
        received: isTypeArgs(str),
      });
    }
  }

  protected validateObject(obj: any, argName: string = "object"): void {
    if (obj === null || (isTypeArgs(obj) !== "object" && isTypeArgs(obj) !== "array")) {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "object",
        received: isTypeArgs(obj),
      });
    }
  }

  protected validateNumber(num: any, argName: string = "number"): void {
    if (isTypeArgs(num) !== "int") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "int",
        received: isTypeArgs(num),
      });
    }
  }

  protected validateFunction(func: any, argName: string = "function"): void {
    if (isTypeArgs(func) !== "function") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "func",
        received: isTypeArgs(func),
      });
    }
  }

  protected async executeCallback(callbackFunc: any, args: any[]): Promise<any> {
    if (this.isBuildModuleFunction(callbackFunc)) {
      return new callbackFunc(args, [], this.environment).call();
    }
    return callbackFunc.call(args.map((v) => ({ value: v })));
  }

  call() {
    throw new Error("Call is not implemented");
  }
}

class Parse extends JsonMethodBuilder {
  override call() {
    const [jsonString, reviver] = this.args;
    this.validateString(jsonString, "jsonString");

    try {
      if (reviver !== undefined) {
        this.validateFunction(reviver, "reviver");
        return JSON.parse(jsonString, (key, value) => {
          return reviver.call([{ value: key }, { value: value }]);
        });
      }
      return JSON.parse(jsonString);
    } catch (error: any) {
      throw this.throwErrorFormatters(new Error(`JSON Parse Error: ${error.message}`));
    }
  }
}

class Stringify extends JsonMethodBuilder {
  override call() {
    const [value, replacer, space] = this.args;

    try {
      let replacerFunc = undefined;
      
      if (replacer !== undefined && replacer !== null) {
        if (isTypeArgs(replacer) === "function") {
          replacerFunc = (key: string, val: any) => {
            return replacer.call([{ value: key }, { value: val }]);
          };
        } else if (isTypeArgs(replacer) === "array") {
          replacerFunc = replacer;
        }
      }

      if (space !== undefined && isTypeArgs(space) === "int") {
        return JSON.stringify(value, replacerFunc, space);
      }

      return JSON.stringify(value, replacerFunc, space);
    } catch (error: any) {
      throw this.throwErrorFormatters(new Error(`JSON Stringify Error: ${error.message}`));
    }
  }
}

module.exports = { parse: Parse, stringify: Stringify };
