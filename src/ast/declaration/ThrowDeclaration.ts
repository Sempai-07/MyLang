import { StmtType } from "../StmtType";
import { Environment } from "../../Environment";
import { BaseError, type IErrorOptions } from "../../errors/BaseError";
import { type Position } from "../../lexer/token/Position";
import { isTypeArgs } from "../../../library/utils/utils";

class ThrowDeclaration extends StmtType {
  public readonly value: StmtType;
  public readonly throwOptions: StmtType | null;
  public readonly position: Position;

  constructor(value: StmtType, throwOptions: StmtType | null, position: Position) {
    super();

    this.value = value;

    this.throwOptions = throwOptions;

    this.position = position;
  }

  async evaluate(score: Environment) {
    const err = await this.value.evaluate(score);

    const throwOptions: IErrorOptions | null = await this.throwOptions?.evaluate(score);

    if (!this.throwOptions && isTypeArgs(throwOptions)) {
      throw new BaseError("In the end, the options should be an object");
    }

    if (err instanceof BaseError) {
      if (throwOptions?.name) err.name = throwOptions.name;
      if (throwOptions?.cause) err.cause = throwOptions.cause;
      if (throwOptions?.code) err.code = throwOptions.code;
      if (throwOptions?.files) err.files = throwOptions.files;
      throw err;
    }

    throw new BaseError(err, {
      ...(throwOptions?.name && { name: throwOptions.name }),
      ...(throwOptions?.cause && { cause: throwOptions.cause }),
      ...(throwOptions?.code && { code: throwOptions.code }),
      files: throwOptions?.files
        ? throwOptions.files
        : [`throw (${score.get("import").main}:${this.position.line}:${this.position.column})`],
    });
  }
}

export { ThrowDeclaration };
