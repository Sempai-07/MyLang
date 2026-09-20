import { FunctionBuilder, FunctionBuilderCodeError } from "../FunctionBuilder";
import { Environment } from "../../src/Environment";
import { type StmtType } from "../../src/ast/StmtType";
import { isTypeArgs } from "../utils/utils";

abstract class StringMethodBuilder extends FunctionBuilder {
  constructor(args: any[], astArgs: StmtType[], environment: Environment) {
    super(args, astArgs, environment);
  }

  get pkgInfo() {
    return {
      name: "strings",
      path: __dirname,
    };
  }

  protected validateString(str: any, argName?: string): void {
    if (argName && isTypeArgs(str) !== "string") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "string",
        received: isTypeArgs(str),
      });
    } else if (isTypeArgs(str) !== "string") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsFirstTypeError, {
        expectType: "string",
        received: isTypeArgs(str),
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

  call() {
    throw new Error("Call is not implemented");
  }
}

class At extends StringMethodBuilder {
  override call() {
    const [str, index] = this.args;
    this.validateString(str);
    return str.at(index);
  }
}

class CharAt extends StringMethodBuilder {
  override call() {
    const [str, pos] = this.args;
    this.validateString(str);
    return str.charAt(pos);
  }
}

class CharCodeAt extends StringMethodBuilder {
  override call() {
    const [str, pos] = this.args;
    this.validateString(str);
    return str.charCodeAt(pos);
  }
}

class CodePointAt extends StringMethodBuilder {
  override call() {
    const [str, pos] = this.args;
    this.validateString(str);
    return str.codePointAt(pos);
  }
}

class Concat extends StringMethodBuilder {
  override call() {
    const [str, ...strings] = this.args;
    this.validateString(str);
    return str.concat(...strings);
  }
}

class Repeat extends StringMethodBuilder {
  override call() {
    const [str, count] = this.args;
    this.validateString(str);
    this.validateNumber(count, "count");
    return str.repeat(count);
  }
}

class Includes extends StringMethodBuilder {
  override call() {
    const [str, searchString, position] = this.args;
    this.validateString(str);
    return str.includes(searchString, position);
  }
}

class IndexOf extends StringMethodBuilder {
  override call() {
    const [str, searchValue, fromIndex] = this.args;
    this.validateString(str);
    return str.indexOf(searchValue, fromIndex);
  }
}

class LastIndexOf extends StringMethodBuilder {
  override call() {
    const [str, searchValue, fromIndex] = this.args;
    this.validateString(str);
    return str.lastIndexOf(searchValue, fromIndex);
  }
}

class StartsWith extends StringMethodBuilder {
  override call() {
    const [str, searchString, position] = this.args;
    this.validateString(str);
    return str.startsWith(searchString, position);
  }
}

class EndsWith extends StringMethodBuilder {
  override call() {
    const [str, searchString, endPosition] = this.args;
    this.validateString(str);
    return str.endsWith(searchString, endPosition);
  }
}

class Replace extends StringMethodBuilder {
  override async call() {
    const [str, searchValue, replaceValue] = this.args;
    this.validateString(str);

    if (isTypeArgs(replaceValue) === "function") {
      const index = str.indexOf(searchValue);
      if (index === -1) return str;

      const args = [searchValue, index, str];
      const replacement = await this.executeCallback(replaceValue, args);
      return str.slice(0, index) + replacement + str.slice(index + searchValue.length);
    }

    return str.replace(searchValue, replaceValue);
  }
}

class ReplaceAll extends StringMethodBuilder {
  override async call() {
    const [str, searchValue, replaceValue] = this.args;
    this.validateString(str);

    if (isTypeArgs(replaceValue) === "function") {
      if (searchValue === "") return str;

      const matches = [];
      let startIndex = 0;

      while (true) {
        const index = str.indexOf(searchValue, startIndex);
        if (index === -1) break;
        matches.push(index);
        startIndex = index + searchValue.length;
      }

      if (matches.length === 0) return str;

      let result = str;
      for (let i = matches.length - 1; i >= 0; i--) {
        const index = matches[i];
        const args = [searchValue, index, str];
        const replacement = await this.executeCallback(replaceValue, args);
        result = result.slice(0, index) + replacement + result.slice(index + searchValue.length);
      }
      return result;
    }

    return str.replaceAll(searchValue, replaceValue);
  }
}

class Slice extends StringMethodBuilder {
  override call() {
    const [str, start, end] = this.args;
    this.validateString(str);
    return str.slice(start, end);
  }
}

class Substring extends StringMethodBuilder {
  override call() {
    const [str, start, end] = this.args;
    this.validateString(str);
    return str.substring(start, end);
  }
}

class Substr extends StringMethodBuilder {
  override call() {
    const [str, start, length] = this.args;
    this.validateString(str);
    return str.substr(start, length);
  }
}

class Split extends StringMethodBuilder {
  override call() {
    const [str, separator, limit] = this.args;
    this.validateString(str);
    return str.split(separator ?? " ", limit);
  }
}

class PadStart extends StringMethodBuilder {
  override call() {
    const [str, targetLength, padString] = this.args;
    this.validateString(str);
    this.validateNumber(targetLength, "targetLength");
    return str.padStart(targetLength, padString);
  }
}

class PadEnd extends StringMethodBuilder {
  override call() {
    const [str, targetLength, padString] = this.args;
    this.validateString(str);
    this.validateNumber(targetLength, "targetLength");
    return str.padEnd(targetLength, padString);
  }
}

class Trim extends StringMethodBuilder {
  override call() {
    const [str] = this.args;
    this.validateString(str);
    return str.trim();
  }
}

class TrimStart extends StringMethodBuilder {
  override call() {
    const [str] = this.args;
    this.validateString(str);
    return str.trimStart();
  }
}

class TrimEnd extends StringMethodBuilder {
  override call() {
    const [str] = this.args;
    this.validateString(str);
    return str.trimEnd();
  }
}

class TrimLeft extends StringMethodBuilder {
  override call() {
    const [str] = this.args;
    this.validateString(str);
    return str.trimLeft();
  }
}

class TrimRight extends StringMethodBuilder {
  override call() {
    const [str] = this.args;
    this.validateString(str);
    return str.trimRight();
  }
}

class ToLowerCase extends StringMethodBuilder {
  override call() {
    const [str] = this.args;
    this.validateString(str);
    return str.toLowerCase();
  }
}

class ToUpperCase extends StringMethodBuilder {
  override call() {
    const [str] = this.args;
    this.validateString(str);
    return str.toUpperCase();
  }
}

class ToLocaleLowerCase extends StringMethodBuilder {
  override call() {
    const [str, locales] = this.args;
    this.validateString(str);
    return str.toLocaleLowerCase(locales);
  }
}

class ToLocaleUpperCase extends StringMethodBuilder {
  override call() {
    const [str, locales] = this.args;
    this.validateString(str);
    return str.toLocaleUpperCase(locales);
  }
}

class ToTitleCase extends StringMethodBuilder {
  override call() {
    const [str] = this.args;
    this.validateString(str);

    return str.toLowerCase().replace(/\b\w/g, (char: string) => char.toUpperCase());
  }
}

class Capitalize extends StringMethodBuilder {
  override call() {
    const [str] = this.args;
    this.validateString(str);

    if (str.length === 0) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
}

class Normalize extends StringMethodBuilder {
  override call() {
    const [str, form] = this.args;
    this.validateString(str);
    return str.normalize(form);
  }
}

class LocaleCompare extends StringMethodBuilder {
  override call() {
    const [str, compareString, locales, options] = this.args;
    this.validateString(str);
    return str.localeCompare(compareString, locales, options);
  }
}

class WrapWith extends StringMethodBuilder {
  override call() {
    const [str, wrapper] = this.args;
    this.validateString(str);
    this.validateString(wrapper, "wrapper");

    return wrapper + str + wrapper;
  }
}

class WrapBetween extends StringMethodBuilder {
  override call() {
    const [str, start, end] = this.args;
    this.validateString(str);
    this.validateString(start, "start");
    this.validateString(end, "end");

    return start + str + end;
  }
}

class Reverse extends StringMethodBuilder {
  override call() {
    const [str] = this.args;
    this.validateString(str);

    return str.split("").reverse().join("");
  }
}

class Truncate extends StringMethodBuilder {
  override call() {
    const [str, maxLength, suffix = "..."] = this.args;
    this.validateString(str);
    this.validateNumber(maxLength, "maxLength");

    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - suffix.length) + suffix;
  }
}

class Count extends StringMethodBuilder {
  override call() {
    const [str, substring] = this.args;
    this.validateString(str);
    this.validateString(substring, "substring");

    if (substring.length === 0) return str.length + 1;

    let count = 0;
    let position = 0;

    while ((position = str.indexOf(substring, position)) !== -1) {
      count++;
      position += substring.length;
    }

    return count;
  }
}

class Lines extends StringMethodBuilder {
  override call() {
    const [str] = this.args;
    this.validateString(str);

    return str.split(/\r?\n/);
  }
}

class Words extends StringMethodBuilder {
  override call() {
    const [str] = this.args;
    this.validateString(str);

    return str
      .trim()
      .split(/\s+/)
      .filter((word: string) => word.length > 0);
  }
}

class Insert extends StringMethodBuilder {
  override call() {
    const [str, index, insertString] = this.args;
    this.validateString(str);
    this.validateNumber(index, "index");
    this.validateString(insertString, "insertString");

    return str.slice(0, index) + insertString + str.slice(index);
  }
}

class Remove extends StringMethodBuilder {
  override call() {
    const [str, start, length] = this.args;
    this.validateString(str);
    this.validateNumber(start, "start");
    this.validateNumber(length, "length");

    return str.slice(0, start) + str.slice(start + length);
  }
}

class ValueOf extends StringMethodBuilder {
  override call() {
    const [str] = this.args;
    this.validateString(str);
    return str.valueOf();
  }
}

class ToString extends StringMethodBuilder {
  override call() {
    const [str] = this.args;
    return str.toString();
  }
}

class Length extends StringMethodBuilder {
  override call() {
    const [str] = this.args;
    this.validateString(str);
    return str.length;
  }
}

class FromCharCode extends StringMethodBuilder {
  override call() {
    const codes = this.args;
    return String.fromCharCode(...codes);
  }
}

class FromCodePoint extends StringMethodBuilder {
  override call() {
    const codePoints = this.args;
    return String.fromCodePoint(...codePoints);
  }
}

class Raw extends StringMethodBuilder {
  override call() {
    const [template, ...substitutions] = this.args;
    return String.raw(template, ...substitutions);
  }
}

module.exports = {
  at: At,
  charAt: CharAt,
  charCodeAt: CharCodeAt,
  codePointAt: CodePointAt,
  concat: Concat,
  repeat: Repeat,
  includes: Includes,
  indexOf: IndexOf,
  lastIndexOf: LastIndexOf,
  startsWith: StartsWith,
  endsWith: EndsWith,
  replace: Replace,
  replaceAll: ReplaceAll,
  slice: Slice,
  substring: Substring,
  substr: Substr,
  split: Split,
  padStart: PadStart,
  padEnd: PadEnd,
  trim: Trim,
  trimStart: TrimStart,
  trimEnd: TrimEnd,
  trimLeft: TrimLeft,
  trimRight: TrimRight,
  toLowerCase: ToLowerCase,
  toUpperCase: ToUpperCase,
  toLocaleLowerCase: ToLocaleLowerCase,
  toLocaleUpperCase: ToLocaleUpperCase,
  toTitleCase: ToTitleCase,
  capitalize: Capitalize,
  normalize: Normalize,
  localeCompare: LocaleCompare,
  wrapWith: WrapWith,
  wrapBetween: WrapBetween,
  reverse: Reverse,
  truncate: Truncate,
  insert: Insert,
  remove: Remove,
  count: Count,
  lines: Lines,
  words: Words,
  valueOf: ValueOf,
  toString: ToString,
  length: Length,
  fromCharCode: FromCharCode,
  fromCodePoint: FromCodePoint,
  raw: Raw,
};
