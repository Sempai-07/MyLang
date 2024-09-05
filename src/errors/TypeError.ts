import { formatMessage } from "../utils";
import type { Position } from "../lexer/Token";

enum TypeCodeError {
  InvalidIdentifier = "INVALID_IDENTIFIER",
  InvalidFunction = "INVALID_FUNCTION",
  InvalidMethodCall = "INVALID_METHOD_CALL",
  AssignmentConstants = "INVALID_ASSIGMENT_CONSTANTS",
}

const TypeMessageError = {
  [TypeCodeError.InvalidIdentifier]: "${value} is not defined",
  [TypeCodeError.InvalidFunction]: "${value} is not function",
  [TypeCodeError.InvalidMethodCall]:
    "${variable}.${method} invalid method call",
  [TypeCodeError.AssignmentConstants]:
    'Assignment to constant variable "${variable}"',
} as const;

class TypeError {
  public readonly code: TypeCodeError;
  public readonly description: string;

  constructor(code: TypeCodeError, format?: Record<string, any>) {
    this.description = format
      ? formatMessage(TypeMessageError[code], format)
      : TypeMessageError[code];
    this.code = code;
  }

  genereteMessage(paths: string[] = [], position: Position): string {
    return `TypeError: ${this.description}${paths
      .map((path, i) => {
        return i === 0
          ? `\n - ${path} at ${position.line}:${position.column}`
          : `\n - ${path}`;
      })
      .join("")}`;
  }
}

export { TypeError, TypeCodeError, TypeMessageError };
