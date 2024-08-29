import { formatMessage } from "../utils";

enum TypeCodeError {
  InvalidIdentifier = "INVALID_IDENTIFIER",
}

const TypeMessageError = {
  [TypeCodeError.InvalidIdentifier]: "${value} is not defined",
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

  genereteMessage(paths: string[] = []): string {
    return `TypeError: ${this.description}${paths.map((path) => `\n - ${path}`).join("")}`;
  }
}

export { TypeError, TypeCodeError, TypeMessageError };
