import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/token/Position";

class IntLiteral extends StmtType {
  public readonly value: string;
  public readonly position: Position;

  constructor(value: string, position: Position) {
    super();

    this.value = value;

    this.position = position;
  }

  evaluate() {
    const cleanValue = this.value.replace(/_/g, "");
    const isBigInt = cleanValue.endsWith("n");
    const numStr = isBigInt ? cleanValue.slice(0, -1) : cleanValue;

    const isFloat = numStr.includes(".") || /[eE]/.test(numStr);

    if (isBigInt) {
      return BigInt(isFloat ? Number(numStr) : numStr);
    }

    if (isFloat) return Number(numStr);

    return Number(numStr);
  }
}

export { IntLiteral };
