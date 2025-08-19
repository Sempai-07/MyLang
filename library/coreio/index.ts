import { FunctionBuilder, FunctionBuilderCodeError } from "../FunctionBuilder";
import { Environment } from "../../src/Environment";
import { type StmtType } from "../../src/ast/StmtType";
import { IdentifierLiteral } from "../../src/ast/types/IdentifierLiteral";
import { formattersText } from "./formatters";
import { isTypeArgs } from "../utils/utils";

abstract class CoreIOMethodBuilder extends FunctionBuilder {
  constructor(args: any[], astArgs: StmtType[], environment: Environment) {
    super(args, astArgs, environment);
  }

  get pkgInfo() {
    return {
      name: "coreio",
      path: __dirname,
    };
  }

  protected validateString(str: any, argName: string = "string"): void {
    if (typeof str !== "string") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "string",
        received: typeof str,
      });
    }
  }

  protected validateNumber(num: any, argName: string = "number"): void {
    if (isTypeArgs(num) !== "int" && isTypeArgs(num) !== "float") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "number",
        received: isTypeArgs(num),
      });
    }
  }

  protected validateArray(arr: any, argName: string = "array"): void {
    if (isTypeArgs(arr) !== "array") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "array",
        received: isTypeArgs(arr),
      });
    }
  }

  call() {
    throw new Error("Call is not implemented");
  }
}

class Print extends CoreIOMethodBuilder {
  override call() {
    const textFormat = formattersText(this.args);

    if (typeof textFormat === "string") {
      console.log(textFormat);
    } else {
      console.log(...textFormat);
    }

    return null;
  }
}

class PrintIn extends CoreIOMethodBuilder {
  override call() {
    const textFormat = formattersText(this.args);

    if (typeof textFormat === "string") {
      process.stdout.write(textFormat);
    } else {
      process.stdout.write(textFormat.join(" "));
    }

    return null;
  }
}

class PrintError extends CoreIOMethodBuilder {
  override call() {
    const textFormat = formattersText(this.args);

    if (typeof textFormat === "string") {
      console.error(textFormat);
    } else {
      console.error(...textFormat);
    }

    return null;
  }
}

class PrintWarning extends CoreIOMethodBuilder {
  override call() {
    const textFormat = formattersText(this.args);
    const message = typeof textFormat === "string" ? textFormat : textFormat.join(" ");

    console.warn(message);
    return null;
  }
}

class PrintInfo extends CoreIOMethodBuilder {
  override call() {
    const textFormat = formattersText(this.args);
    const message = typeof textFormat === "string" ? textFormat : textFormat.join(" ");

    console.info(message);
    return null;
  }
}

class PrintSuccess extends CoreIOMethodBuilder {
  override call() {
    const textFormat = formattersText(this.args);
    const message = typeof textFormat === "string" ? textFormat : textFormat.join(" ");

    console.log(message);
    return null;
  }
}

class PrintDebug extends CoreIOMethodBuilder {
  override call() {
    if (!process.env.DEBUG) return null;

    const textFormat = formattersText(this.args);
    const message = typeof textFormat === "string" ? textFormat : textFormat.join(" ");

    console.debug(message);
    return null;
  }
}

class Clear extends CoreIOMethodBuilder {
  override call() {
    console.clear();
    return null;
  }
}

class Table extends CoreIOMethodBuilder {
  override call() {
    const [data, columns] = this.args;

    if (data === undefined || data === null) {
      console.table(null);
      return null;
    }

    if (columns !== undefined) {
      this.validateArray(columns, "columns");
      console.table(data, columns);
    } else {
      console.table(data);
    }

    return null;
  }
}

class PrintJSON extends CoreIOMethodBuilder {
  override call() {
    const [data, spaces] = this.args;
    const indent = spaces !== undefined ? spaces : 2;

    this.validateNumber(indent, "spaces");

    try {
      const jsonString = JSON.stringify(data, null, indent);
      console.log(jsonString);
    } catch (error: any) {
      throw this.throwErrorFormatters(new Error(`Failed to serialize to JSON: ${error.message}`));
    }

    return null;
  }
}

class Group extends CoreIOMethodBuilder {
  override call() {
    const [label] = this.args;

    if (label !== undefined) {
      this.validateString(label, "label");
      console.group(label);
    } else {
      console.group();
    }

    return null;
  }
}

class GroupCollapsed extends CoreIOMethodBuilder {
  override call() {
    const [label] = this.args;

    if (label !== undefined) {
      this.validateString(label, "label");
      console.groupCollapsed(label);
    } else {
      console.groupCollapsed();
    }

    return null;
  }
}

class GroupEnd extends CoreIOMethodBuilder {
  override call() {
    console.groupEnd();
    return null;
  }
}

class Time extends CoreIOMethodBuilder {
  override call() {
    const [label] = this.args;
    const timerLabel = label || "default";

    if (label !== undefined) {
      this.validateString(label, "label");
    }

    console.time(timerLabel);
    return null;
  }
}

class TimeEnd extends CoreIOMethodBuilder {
  override call() {
    const [label] = this.args;
    const timerLabel = label || "default";

    if (label !== undefined) {
      this.validateString(label, "label");
    }

    console.timeEnd(timerLabel);
    return null;
  }
}

class TimeLog extends CoreIOMethodBuilder {
  override call() {
    const [label, ...data] = this.args;
    const timerLabel = label || "default";

    if (label !== undefined) {
      this.validateString(label, "label");
    }

    if (data.length > 0) {
      console.timeLog(timerLabel, ...data);
    } else {
      console.timeLog(timerLabel);
    }

    return null;
  }
}

class Count extends CoreIOMethodBuilder {
  override call() {
    const [label] = this.args;

    if (label !== undefined) {
      this.validateString(label, "label");
      console.count(label);
    } else {
      console.count();
    }

    return null;
  }
}

class CountReset extends CoreIOMethodBuilder {
  override call() {
    const [label] = this.args;

    if (label !== undefined) {
      this.validateString(label, "label");
      console.countReset(label);
    } else {
      console.countReset();
    }

    return null;
  }
}

class Trace extends CoreIOMethodBuilder {
  override call() {
    const textFormat = formattersText(this.args);

    if (typeof textFormat === "string") {
      console.trace(textFormat);
    } else if (textFormat.length > 0) {
      console.trace(...textFormat);
    } else {
      console.trace();
    }

    return null;
  }
}

class Assert extends CoreIOMethodBuilder {
  override call() {
    const [condition, ...messages] = this.args;

    if (messages.length > 0) {
      const textFormat = formattersText(messages);
      if (typeof textFormat === "string") {
        console.assert(condition, textFormat);
      } else {
        console.assert(condition, ...textFormat);
      }
    } else {
      console.assert(condition);
    }

    return null;
  }
}

class Dir extends CoreIOMethodBuilder {
  override call() {
    const [obj, options] = this.args;

    if (options !== undefined) {
      console.dir(obj, options);
    } else {
      console.dir(obj);
    }

    return null;
  }
}

class DirXML extends CoreIOMethodBuilder {
  override call() {
    const [obj] = this.args;
    console.dirxml(obj);
    return null;
  }
}

class Colorize extends CoreIOMethodBuilder {
  override call() {
    const [text, color] = this.args;
    this.validateString(text, "text");

    if (color !== undefined) {
      this.validateString(color, "color");
    }

    const colors = {
      reset: "\x1b[0m",
      black: "\x1b[30m",
      red: "\x1b[31m",
      green: "\x1b[32m",
      yellow: "\x1b[33m",
      blue: "\x1b[34m",
      magenta: "\x1b[35m",
      cyan: "\x1b[36m",
      white: "\x1b[37m",
      gray: "\x1b[90m",
      brightRed: "\x1b[91m",
      brightGreen: "\x1b[92m",
      brightYellow: "\x1b[93m",
      brightBlue: "\x1b[94m",
      brightMagenta: "\x1b[95m",
      brightCyan: "\x1b[96m",
      brightWhite: "\x1b[97m",
    };

    const colorCode = colors[color as keyof typeof colors] || "";
    const resetCode = colors.reset;

    return colorCode + text + resetCode;
  }
}

class Input extends CoreIOMethodBuilder {
  override call() {
    const [prompt] = this.args;

    if (prompt !== undefined) {
      this.validateString(prompt, "prompt");
      process.stdout.write(prompt);
    }

    return new Promise((resolve) => {
      process.stdin.resume();
      process.stdin.setEncoding("utf8");

      process.stdin.once("data", (data) => {
        process.stdin.pause();
        resolve(data.toString().trim());
      });
    });
  }
}

class Scan extends CoreIOMethodBuilder {
  override call() {
    const [variable] = this.astArgs;

    if (variable === undefined || !(variable instanceof IdentifierLiteral)) {
      throw this.throwErrorFormatters(new Error("Expected identifier arguments"));
    }

    return new Promise((resolve) => {
      process.stdin.resume();
      process.stdin.setEncoding("utf8");

      process.stdin.once("data", (data) => {
        this.environment.update(
          variable.value,
          data.toString().trim(),
          this.environment.get(variable.value),
        );

        process.stdin.pause();
        resolve(true);
      });
    });
  }
}

module.exports = {
  print: Print,
  println: PrintIn,
  printError: PrintError,
  printWarning: PrintWarning,
  printInfo: PrintInfo,
  printSuccess: PrintSuccess,
  printDebug: PrintDebug,
  clear: Clear,
  table: Table,
  printJSON: PrintJSON,
  group: Group,
  groupCollapsed: GroupCollapsed,
  groupEnd: GroupEnd,
  time: Time,
  timeEnd: TimeEnd,
  timeLog: TimeLog,
  count: Count,
  countReset: CountReset,
  trace: Trace,
  assert: Assert,
  dir: Dir,
  dirxml: DirXML,
  colorize: Colorize,
  input: Input,
  scan: Scan,
};
