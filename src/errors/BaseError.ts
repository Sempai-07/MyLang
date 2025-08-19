import chalk from "chalk";

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

  constructor(message: string, { name = "BaseError", cause, code, files }: IErrorOptions = {}) {
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
      ? `\n${this.files.map((value) => ` At ${chalk.dim(value)}`).join("\n")}`
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
      `${this.name}: ${this.message}` +
      `${filesOutput} ` +
      (codeOutput || causeOutput
        ? `{\n` +
          `  ${codeOutput}${codeOutput && causeOutput ? ",\n" : ""}` +
          `  ${causeOutput}\n` +
          `}`
        : "")
    );
  }
}

export { BaseError, type IErrorOptions };
