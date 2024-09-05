import { formatMessage } from "../utils";
import type { Position } from "../lexer/Token";

enum CodeError {
  FaildLoadJSON = "FAILD_LOAD_JSON",
  FaildLoadModule = "FAILD_LOAD_MODULE",
  FaildLoadBuildInModule = "FAILD_BUILD_IN_MODULE",
}

const MessageError = {
  [CodeError.FaildLoadJSON]: "Failed to load JSON module: ${err}",
  [CodeError.FaildLoadModule]: 'Cannot find module: "${module}"',
  [CodeError.FaildLoadBuildInModule]: 'No such built-in module: "${module}"',
} as const;

class Error {
  public readonly code: CodeError;
  public readonly description: string;

  constructor(code: CodeError, format?: Record<string, any>) {
    this.description = format
      ? formatMessage(MessageError[code], format)
      : MessageError[code];
    this.code = code;
  }

  genereteMessage(paths: string[] = [], position: Position): string {
    return `Error: ${this.description}${paths
      .map((path, i) => {
        return i === 0
          ? `\n - ${path} at ${position.line}:${position.column}`
          : `\n - ${path}`;
      })
      .join("")}`;
  }
}

export { Error, CodeError, MessageError };
