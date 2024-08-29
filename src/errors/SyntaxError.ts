import { formatMessage } from "../utils";

enum SyntaxCodeError {
  InvalidUnexpectedToken = "INVALID_UNEXPECTED_TOKEN",
  MultipleConsecutiveQuotes = "MULTIPLE_CONSECUTIVE_QUOTES",
  UnterminatedStringLiteral = "UNTERMINATED_STRING_LITERAL",
  UnexpectedOperator = "UNEXPECTED_OPERATOR",
  ExpectedToken = "EXPECTED_TOKEN",
  Unexpected = "UNEXPECTED",
}

const SyntaxMessageError = {
  [SyntaxCodeError.InvalidUnexpectedToken]:
    "Invalid or unexpected token at ${line}:${column}",
  [SyntaxCodeError.MultipleConsecutiveQuotes]:
    "Multiple consecutive quotes at ${line}:${column}",
  [SyntaxCodeError.UnterminatedStringLiteral]:
    "Unterminated string literal starting at ${line}:${column}",
  [SyntaxCodeError.UnexpectedOperator]:
    "Unexpected operator '${operator}' at ${line}:${column}",
  [SyntaxCodeError.ExpectedToken]:
    "Expected ${expectedTokenType} but found ${foundTokenType} at ${line}:${column}",
  [SyntaxCodeError.Unexpected]:
    "Unexpected token '${value}' at ${line}:${column}",
} as const;

class SyntaxError {
  public readonly code: SyntaxCodeError;
  public readonly description: string;

  constructor(code: SyntaxCodeError, format?: Record<string, any>) {
    this.description = format
      ? formatMessage(SyntaxMessageError[code], format)
      : SyntaxMessageError[code];
    this.code = code;
  }

  genereteMessage(paths: string[] = []): string {
    return `SyntaxError: ${this.description}${paths.map((path) => `\n - ${path}`).join("")}`;
  }
}

export { SyntaxError, SyntaxCodeError, SyntaxMessageError };
