import { formatMessage } from "../utils";
import { BaseError } from "../BaseError";

enum AssignmentCodeError {
  AssignmentVarReadonlyOrConst = "ASSIGNMENT_VAR_READONLY_OR_CONST",
  AssignmentInvalidType = "ASSIGNMENT_INVALID_TYPE",
  AssignmentEnumConst = "ASSIGNMENT_ENUM_CONST",
  AssignmentStructData = "ASSIGNMENT_STRUCT_DATA",
  AssignmentStructDataFunc = "ASSIGNMENT_STRUCT_DATA_FUNC",
  AssignmentStructDataOperatorInvalid = "ASSIGNMENT_STRUCT_DATA_OPERATOR_INVALID",
  AssignmentVarConst = "ASSIGNMENT_VAR_CONST",
  AssignmentInvalidOperator = "ASSIGNMENT_INVALID_OPERATOR",
  AssignmentIndexReadonly = "ASSIGNMENT_INDEX_READONLY",
  AssignmentPropertyReadonly = "ASSIGNMENT_PROPERTY_READONLY",
  AssignmentInvalid = "ASSIGNMENT_INVALID",
}

const AssignmentMessageError = {
  [AssignmentCodeError.AssignmentVarReadonlyOrConst]:
    'Cannot assign const or readonly to variable "${name}" because it is already const/readonly',
  [AssignmentCodeError.AssignmentInvalidType]:
    "Left-hand must be identifer or member access expression",
  [AssignmentCodeError.AssignmentEnumConst]: 'Cannot assign to "${name}" because it is an enum',
  [AssignmentCodeError.AssignmentStructData]:
    'Cannot assign to "${name}" because it is an struct data',
  [AssignmentCodeError.AssignmentStructDataFunc]:
    'The struct data  "${name}" expects the method name as a string',
  [AssignmentCodeError.AssignmentStructDataOperatorInvalid]:
    'The struct data "${name}" can only be used with the "=" operator',
  [AssignmentCodeError.AssignmentVarConst]: 'Assignment to "${name}" constant variable',
  [AssignmentCodeError.AssignmentInvalidOperator]: 'Invalid Operator "${assignType}"',
  [AssignmentCodeError.AssignmentIndexReadonly]:
    'Index signature in type "${index}" only permits reading',
  [AssignmentCodeError.AssignmentPropertyReadonly]:
    'Cannot assign to "${property}" because it is a read-only property',
  [AssignmentCodeError.AssignmentInvalid]: "Invalid assignment: ${err}",
};

class AssignmentError extends BaseError {
  constructor(code: AssignmentCodeError, format?: Record<string, any>) {
    super(
      format ? formatMessage(AssignmentMessageError[code], format) : AssignmentMessageError[code],
      {
        code,
        name: "AssignmentError",
        ...(format?.files && { files: format.files }),
      },
    );
  }
}

export { AssignmentError, AssignmentCodeError, AssignmentMessageError };
