import { formatMessage } from "../utils";
import { BaseError } from "../BaseError";

enum FileReadFaildCodeError {
  JSONReadFaild = "JSON_READ_FAILD",
  NotFountInitFileScript = "NOT_FOUNT_INIT_FILE_SCRIPT",
  FaildInitFileScript = "FAILD_INIT_FILE_SCRIPT",
}

const FileReadFaildMessageError = {
  [FileReadFaildCodeError.JSONReadFaild]: 'Read json faild: "${err}" (fullPath: ${fullPath})',
  [FileReadFaildCodeError.NotFountInitFileScript]: "NotFount init file (fullPath: ${fullPath})",
  [FileReadFaildCodeError.FaildInitFileScript]: "Faild init: ${err}",
};

class FileReadFaildError extends BaseError {
  constructor(code: FileReadFaildCodeError, format?: Record<string, any>) {
    super(
      format
        ? formatMessage(FileReadFaildMessageError[code], format)
        : FileReadFaildMessageError[code],
      {
        code,
        name: "FileReadFaildError",
        ...(format?.files && { files: format.files }),
      },
    );
  }
}

export { FileReadFaildError, FileReadFaildCodeError, FileReadFaildMessageError };
