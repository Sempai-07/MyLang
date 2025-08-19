import { FunctionBuilder, FunctionBuilderCodeError } from "../FunctionBuilder";
import { Environment } from "../../src/Environment";
import { type StmtType } from "../../src/ast/StmtType";
import { isTypeArgs } from "../utils/utils";

abstract class BytesMethodBuilder extends FunctionBuilder {
  constructor(args: any[], astArgs: StmtType[], environment: Environment) {
    super(args, astArgs, environment);
  }

  get pkgInfo() {
    return {
      name: "bytes",
      path: __dirname,
    };
  }

  protected validateBytes(bytes: any, argName?: string): void {
    if (argName && !(bytes instanceof Uint8Array)) {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "bytes",
        received: isTypeArgs(bytes),
      });
    } else if (!(bytes instanceof Uint8Array)) {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsFirstTypeError, {
        expectType: "bytes",
        received: isTypeArgs(bytes),
      });
    }
  }

  protected validateNumber(num: any, argName: string): void {
    if (typeof num !== "number" || !Number.isInteger(num)) {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "integer",
        received: isTypeArgs(num),
      });
    }
  }

  protected validateString(str: any, argName: string): void {
    if (typeof str !== "string") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "string",
        received: isTypeArgs(str),
      });
    }
  }

  protected validateEncoding(encoding: string): void {
    const validEncodings = [
      "utf8",
      "utf-8",
      "ascii",
      "latin1",
      "binary",
      "hex",
      "base64",
      "base64url",
    ];
    if (!validEncodings.includes(encoding.toLowerCase())) {
      throw this.throwErrorFormatters(
        new Error(`Invalid encoding: ${encoding}. Valid encodings: ${validEncodings.join(", ")}`),
      );
    }
  }

  protected stringToBytes(str: string, encoding: string = "utf8"): Uint8Array {
    this.validateEncoding(encoding);
    const enc = encoding.toLowerCase();

    switch (enc) {
      case "utf8":
      case "utf-8":
        return new TextEncoder().encode(str);
      case "ascii":
      case "latin1":
      case "binary":
        return new Uint8Array(str.split("").map((c) => c.charCodeAt(0) & 0xff));
      case "hex":
        if (str.length % 2 !== 0) {
          throw this.throwErrorFormatters(new Error("Invalid hex string"));
        }
        return new Uint8Array(str.match(/.{2}/g)!.map((byte) => parseInt(byte, 16)));
      case "base64":
        const binary = atob(str);
        return new Uint8Array(binary.split("").map((c) => c.charCodeAt(0)));
      case "base64url":
        const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
        const padding = "====".slice(0, (4 - (base64.length % 4)) % 4);
        return this.stringToBytes(base64 + padding, "base64");
      default:
        throw this.throwErrorFormatters(new Error(`Unsupported encoding: ${encoding}`));
    }
  }

  protected bytesToString(bytes: Uint8Array, encoding: string = "utf8"): string {
    this.validateEncoding(encoding);
    const enc = encoding.toLowerCase();

    switch (enc) {
      case "utf8":
      case "utf-8":
        return new TextDecoder().decode(bytes);
      case "ascii":
      case "latin1":
      case "binary":
        return String.fromCharCode(...bytes);
      case "hex":
        return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
      case "base64":
        return btoa(String.fromCharCode(...bytes));
      case "base64url":
        const base64 = btoa(String.fromCharCode(...bytes));
        return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
      default:
        throw this.throwErrorFormatters(new Error(`Unsupported encoding: ${encoding}`));
    }
  }

  call() {
    new Error("Call is not implemented");
  }
}

export { BytesMethodBuilder };
