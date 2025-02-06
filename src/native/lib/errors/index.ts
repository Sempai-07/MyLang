import {
  BaseError as BaseErrors,
  FileReadFaild as FileReadFailds,
  ImportFaildError as ImportFaildErrors,
  AssignmentError as AssignmentErrors,
  FunctionCallError as FunctionCallErrors,
  ArgumentsError as ArgumentsErrors,
  type IErrorOptions,
} from "../../../errors/BaseError";

function BaseError([message, options = {}]: [
  string,
  Omit<IErrorOptions, "name" | "files">,
]) {
  return new BaseErrors(message, {
    files: [`mylang:errors (${__filename})`],
    ...options,
  });
}

function FileReadFaild([message, filePath]: [string, string]) {
  return new FileReadFailds(message, filePath, [
    `mylang:errors (${__filename})`,
  ]);
}

function ImportFaildError([message, options = {}]: [
  string,
  {
    code?: string;
    cause?: Record<string, unknown>;
  },
]) {
  return new ImportFaildErrors(message, {
    ...options,
    files: [`mylang:errors (${__filename})`],
  });
}

function AssignmentError([message, options = {}]: [
  string,
  {
    code?: string;
    cause?: Record<string, unknown>;
  },
]) {
  return new AssignmentErrors(message, {
    ...options,
    files: [`mylang:errors (${__filename})`],
  });
}

function FunctionCallError([message]: [string]) {
  return new FunctionCallErrors(message, [`mylang:errors (${__filename})`]);
}

function ArgumentsError([message]: [string]) {
  return new ArgumentsErrors(message, [`mylang:errors (${__filename})`]);
}

export {
  BaseError,
  FileReadFaild,
  ImportFaildError,
  AssignmentError,
  FunctionCallError,
  ArgumentsError,
};
