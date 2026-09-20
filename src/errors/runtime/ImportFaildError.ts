import { formatMessage } from "../utils";
import { BaseError } from "../BaseError";

enum ImportFaildCodeError {
  ImportHttpFaild = "IMPORT_HTTP_FAILD",
  ImportHttpJsonFaild = "IMPORT_HTTP_JSON_FAILD",
  ImportHttpFileFaild = "IMPORT_HTTP_FILE_FAILD",
  ImportNoSuchFile = "IMPORT_NO_SUCH_FILE",
  ImportFileRunFaild = "IMPORT_FILE_RUN_FAILD",
  ImportSourceModuleFaild = "IMPORT_SOURCE_MODULE_FAILD",
  ImportMainNotFound = "IMPORT_MAIN_NOT_FOUND",
  ImportDestructuringFaild = "IMPORT_DESTRUCTURING_FAILD",
  ImportFindModuleFaild = "IMPORT_FIND_MODULE_FAILD",
  ImportFindBildInModuleFaild = "IMPORT_FIND_BILD_IN_MODULE_FAILD",
  ImportTargetType = "IMPORT_TARGET_TYPE",
}

const ImportFaildMessageError = {
  [ImportFaildCodeError.ImportHttpFaild]: "HTTP status code ${statusCode}",
  [ImportFaildCodeError.ImportHttpJsonFaild]: "HTTP load JSON module: ${err}",
  [ImportFaildCodeError.ImportHttpFileFaild]: "HTTP load file module: ${err}",
  [ImportFaildCodeError.ImportNoSuchFile]: "No such file: ${fullPath}",
  [ImportFaildCodeError.ImportFileRunFaild]: "Error file faild: ${err}",
  [ImportFaildCodeError.ImportSourceModuleFaild]: "Faild source run module: ${source}",
  [ImportFaildCodeError.ImportMainNotFound]: 'File main "${file}" not found',
  [ImportFaildCodeError.ImportDestructuringFaild]: 'The key "${key}" is not in the object',
  [ImportFaildCodeError.ImportFindModuleFaild]: 'Cannot find module: "${name}"',
  [ImportFaildCodeError.ImportFindBildInModuleFaild]: 'No such built-in module: "${name}"',
  [ImportFaildCodeError.ImportTargetType]:
    'Cannot find target type "${targetType}" (mylang, json, buffer)',
};

class ImportFaildError extends BaseError {
  constructor(code: ImportFaildCodeError, format?: Record<string, any>) {
    super(
      format ? formatMessage(ImportFaildMessageError[code], format) : ImportFaildMessageError[code],
      {
        code,
        name: "ImportFaildError",
        ...(format?.files && { files: format.files }),
      },
    );
  }
}

export { ImportFaildError, ImportFaildCodeError, ImportFaildMessageError };
