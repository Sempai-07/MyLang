import { formatMessage } from "../utils";
import { BaseError } from "./BaseError";

enum SyntaxCodeError {
  InvalidUnexpectedToken = "INVALID_UNEXPECTED_TOKEN",
  MultipleConsecutiveQuotes = "MULTIPLE_CONSECUTIVE_QUOTES",
  UnterminatedStringLiteral = "UNTERMINATED_STRING_LITERAL",
  UnexpectedOperator = "UNEXPECTED_OPERATOR",
  ExpectedToken = "EXPECTED_TOKEN",
  Unexpected = "UNEXPECTED",
  InvalidDynamicImportUsage = "INVALID_DYNAMIC_IMPORT_USAGE",
  MissingCatchOrTry = "MISSING_CATCH_OR_TRY",
  ValidAwait = "VALID_AWAIT",
  RestInvalid = "REST_INVALID",
  AlreadyAsInvalid = "ALREADY_AS_INVALID",
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
  [SyntaxCodeError.InvalidDynamicImportUsage]:
    "Invalid use of import() at ${line}:${column}",
  [SyntaxCodeError.MissingCatchOrTry]:
    "Missing catch or finally after try at ${line}:${column}",
  [SyntaxCodeError.ValidAwait]:
    "await is only valid in async functions at ${line}:${column}",
  [SyntaxCodeError.RestInvalid]:
    "Rest parameter must be last formal parameter at ${line}:${column}",
  [SyntaxCodeError.AlreadyAsInvalid]:
    "Cannot assign type ${currentAsType} because the variable '${name}' is already of type ${varType} at ${line}:${column}",
} as const;

class SyntaxError extends BaseError {
  constructor(code: SyntaxCodeError, format?: Record<string, any>) {
    super(
      format
        ? formatMessage(SyntaxMessageError[code], format)
        : SyntaxMessageError[code],
      {
        code,
        name: "SyntaxError",
      },
    );
  }
}

export { SyntaxError, SyntaxCodeError, SyntaxMessageError };
