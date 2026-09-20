import { formatMessage } from "../utils";
import { BaseError } from "../BaseError";

enum FunctionCallCodeError {
  FunctionIsNotMethod = "FUNCTION_IS_NOT_METHOD",
  FunctionCallUnknown = "FUNCTION_CALL_UNKNOWN",
}

const FunctionCallMessageError = {
  [FunctionCallCodeError.FunctionIsNotMethod]: "${identifier}.${method} is not method",
  [FunctionCallCodeError.FunctionCallUnknown]: "${name} is unknown function",
};

class FunctionCallError extends BaseError {
  constructor(code: FunctionCallCodeError, format?: Record<string, any>) {
    super(
      format
        ? formatMessage(FunctionCallMessageError[code], format)
        : FunctionCallMessageError[code],
      {
        code,
        name: "FunctionCallError",
        ...(format?.files && { files: format.files }),
      },
    );
  }
}

export { FunctionCallError, FunctionCallCodeError, FunctionCallMessageError };
