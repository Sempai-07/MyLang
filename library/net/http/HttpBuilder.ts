import { FunctionBuilder, FunctionBuilderCodeError } from "../../FunctionBuilder";
import { Environment } from "../../../src/Environment";
import { type StmtType } from "../../../src/ast/StmtType";
import { isTypeArgs } from "../../utils/utils";
import { URL } from "node:url";

abstract class HttpMethodBuilder extends FunctionBuilder {
  constructor(args: any[], astArgs: StmtType[], environment: Environment) {
    super(args, astArgs, environment);
  }

  get pkgInfo() {
    return {
      name: "net/http",
      path: __dirname,
    };
  }

  protected validateUrl(url: any, argName: string = "url"): void {
    if (typeof url !== "string") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "string",
        received: isTypeArgs(url),
      });
    }

    try {
      new URL(url);
    } catch {
      throw this.throwErrorFormatters(new Error(`Invalid URL format: ${url}`));
    }
  }

  protected validateFunction(func: any, argName: string = "callback"): void {
    if (isTypeArgs(func) !== "function") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "function",
        received: isTypeArgs(func),
      });
    }
  }

  protected executeCallback(callbackFunc: any, args: any[]): any {
    if (this.isBuildModuleFunction(callbackFunc)) {
      return new callbackFunc(args, [], this.environment).call();
    }
    return callbackFunc.call(args.map((v) => ({ value: v })));
  }

  protected mergeHeaders(defaults: any, custom: any): any {
    const merged = { ...defaults };
    if (custom) {
      for (const [key, value] of Object.entries(custom)) {
        merged[key.toLowerCase()] = value;
      }
    }
    return merged;
  }

  protected parseContentType(contentType: string): {
    type: string;
    charset?: string;
  } {
    const parts = contentType.split(";");
    const type = parts[0]?.trim() || "";
    const charset = parts
      .find((p) => p.trim().startsWith("charset="))
      ?.split("=")[1]
      ?.trim();
    return { type, ...(charset && { charset }) };
  }

  call() {
    throw new Error("Call is not implemented");
  }
}

export { HttpMethodBuilder };
