interface IErrorOptions {
  name?: string;
  cause?: Error | Record<string, unknown>;
  code?: string;
  files?: string[];
}

class BaseError extends Error {
  public override name: string;
  public override cause?: Error | Record<string, unknown>;
  public code?: string;
  public files: string[];

  constructor(
    message: string,
    { name = "BaseError", cause, code, files }: IErrorOptions = {},
  ) {
    super(message);
    this.name = name;

    if (cause) this.cause = cause;

    if (code) this.code = code;

    this.files = files || [];

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  override toString() {
    const filesOutput = this.files
      ? `\n${this.files.map((value) => ` - ${value}`).join("\n")}`
      : "";

    let causeOutput = "";
    if (this.cause && typeof this.cause === "object") {
      causeOutput = "cause: {\n";
      for (const [key, value] of Object.entries(this.cause)) {
        causeOutput += `    ${key}: ${JSON.stringify(value)}\n`;
      }
      causeOutput += "  }";
    }

    const codeOutput = this.code ? `code: ${this.code}` : "";

    return (
      `${this.name}: ${this.message}` + `${filesOutput} ` +
      (codeOutput || causeOutput
        ? `{\n` +
          `  ${codeOutput}${codeOutput && causeOutput ? ",\n" : ""}` +
          `  ${causeOutput}\n` +
          `}`
        : "")
    );
  }
}

class FileReadFaild extends BaseError {
  constructor(description: string, filePath: string, files: string[]) {
    super(description, {
      name: "FileReadFaildError",
      code: "FILE_READ_FAILD",
      cause: { filePath },
      files,
    });
  }
}

class ImportFaildError extends BaseError {
  constructor(
    description: string,
    options: {
      code?: string;
      cause?: Record<string, unknown>;
      files: string[];
    },
  ) {
    super(description, {
      name: "ImportFaildError",
      ...(options.code && { code: options.code }),
      ...(options.cause && { cause: options.cause }),
      files: options.files,
    });
  }
}

class AssignmentError extends BaseError {
  constructor(
    description: string,
    options: {
      code?: string;
      cause?: Record<string, unknown>;
      files: string[];
    },
  ) {
    super(description, {
      name: "AssignmentError",
      ...(options.code && { code: options.code }),
      ...(options.cause && { cause: options.cause }),
      files: options.files,
    });
  }
}

class FunctionCallError extends BaseError {
  constructor(description: string, files: string[]) {
    super(description, {
      name: "FunctionCallError",
      files,
    });
  }
}

class ArgumentsError extends BaseError {
  constructor(description: string, files: string[]) {
    super(description, {
      name: "ArgumentsError",
      files,
    });
  }
}

export {
  BaseError,
  FileReadFaild,
  ImportFaildError,
  AssignmentError,
  FunctionCallError,
  ArgumentsError,
  type IErrorOptions,
};
