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

    if (
      this.throwOptions &&
      isTypeArgs(throwOptions) !== "object" &&
      isTypeArgs(throwOptions) !== "struct"
    ) {
      throw super.throwErrorFormatters(
        "In the end, the options error should be an object or struct",
        score,
      );
    }

    const structFields = throwOptions
      ? super.isStructData(throwOptions)
        ? await throwOptions.call([])
        : throwOptions
      : err;

    if (err instanceof BaseError) {
      if (structFields.name) err.name = structFields.name;
      if (structFields.cause) err.cause = structFields.cause;
      if (structFields.code) err.code = structFields.code;
      if (structFields.files) err.files = structFields.files;
      throw err;
    }

    throw new BaseError(err, {
      ...(structFields?.name && { name: structFields.name }),
      ...(structFields?.cause && { cause: structFields.cause }),
      ...(structFields?.code && { code: structFields.code }),
      files: structFields?.files || [
        `throw (${score.get("import").main}:${this.position.line}:${this.position.column})`,
      ],
    });
  }
}

export { ThrowDeclaration };
