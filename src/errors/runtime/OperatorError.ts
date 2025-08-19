import { formatMessage } from "../utils";
import { BaseError } from "../BaseError";

enum OperatorCodeError {
  UnknownBinaryOperator = "UNKNOWN_BINARY_OPERATOR",
  UnknownUpdateOperator = "UNKNOWN_UPDATE_OPERATOR",
  UpdateOnlyNumber = "UPDATE_ONLY_NUMBER",
  UnknownVisitUnaryOperator = "UNKNOWN_VISIT_UNARY_OPERATOR",
  UnknownReflectOperator = "UNKNOWN_REFLECT_OPERATOR",
  OperatorNotUsedType = "OPERATOR_NOT_USED_TYPE",
}

const OperatorMessageError = {
  [OperatorCodeError.UnknownBinaryOperator]: 'Unknown binary operator "${operatorType}"',
  [OperatorCodeError.UnknownUpdateOperator]: 'Unknown update operator "${operatorType}"',
  [OperatorCodeError.UpdateOnlyNumber]:
    'Update expression only work on number, the type received: "${type}"',
  [OperatorCodeError.UnknownVisitUnaryOperator]: 'Unknown visit unary operator "${operatorType}"',
  [OperatorCodeError.UnknownReflectOperator]: 'Unknown reflect operator "${operatorType}"',
  [OperatorCodeError.OperatorNotUsedType]:
    'Cannot use "in" operator to search for "${key}" in ${notUsedType}',
};

class OperatorError extends BaseError {
  constructor(code: OperatorCodeError, format?: Record<string, any>) {
    super(format ? formatMessage(OperatorMessageError[code], format) : OperatorMessageError[code], {
      code,
      name: "OperatorError",
      ...(format?.files && { files: format.files }),
    });
  }
}

export { OperatorError, OperatorCodeError, OperatorMessageError };
