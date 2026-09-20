import { FunctionBuilder, FunctionBuilderCodeError } from "../../FunctionBuilder";
import { Environment } from "../../../src/Environment";
import { type StmtType } from "../../../src/ast/StmtType";
import { isTypeArgs } from "../../utils/utils";

abstract class BigIntMethodBuilder extends FunctionBuilder {
  constructor(args: any[], astArgs: StmtType[], environment: Environment) {
    super(args, astArgs, environment);
  }

  get pkgInfo() {
    return {
      name: "numbers/bigint",
      path: __dirname,
    };
  }

  protected validateBigInt(value: any, argName: string = "value"): bigint {
    if (typeof value === "bigint") {
      return value;
    }

    if (typeof value === "number" && Number.isInteger(value)) {
      return BigInt(value);
    }

    if (typeof value === "string") {
      try {
        return BigInt(value);
      } catch {
        throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
          propsName: argName,
          expectType: "bigint/number/string",
          received: isTypeArgs(value),
        });
      }
    }

    throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
      propsName: argName,
      expectType: "bigint/number/string",
      received: isTypeArgs(value),
    });
  }

  protected validateNumber(value: any, argName: string = "value"): number {
    if (typeof value === "number" && Number.isInteger(value)) {
      return value;
    }

    if (typeof value === "bigint") {
      const num = Number(value);
      if (Number.isSafeInteger(num)) {
        return num;
      }
      throw this.throwErrorFormatters(
        new Error(`${argName} is too large to convert to safe number`),
      );
    }

    throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
      propsName: argName,
      expectType: "number",
      received: isTypeArgs(value),
    });
  }

  protected validateArray(arr: any, argName: string = "array"): any[] {
    if (isTypeArgs(arr) !== "array") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "array",
        received: isTypeArgs(arr),
      });
    }
    return arr;
  }

  protected validatePositive(value: bigint, argName: string = "value"): bigint {
    if (value <= 0n) {
      throw this.throwErrorFormatters(new Error(`${argName} must be positive`));
    }
    return value;
  }

  protected validateNonNegative(value: bigint, argName: string = "value"): bigint {
    if (value < 0n) {
      throw this.throwErrorFormatters(new Error(`${argName} must be non-negative`));
    }
    return value;
  }

  call() {
    throw new Error("Call is not implemented");
  }
}

class Add extends BigIntMethodBuilder {
  override call() {
    const [a, b] = this.args;
    const bigA = this.validateBigInt(a, "a");
    const bigB = this.validateBigInt(b, "b");
    return bigA + bigB;
  }
}

class Subtract extends BigIntMethodBuilder {
  override call() {
    const [a, b] = this.args;
    const bigA = this.validateBigInt(a, "a");
    const bigB = this.validateBigInt(b, "b");
    return bigA - bigB;
  }
}

class Multiply extends BigIntMethodBuilder {
  override call() {
    const [a, b] = this.args;
    const bigA = this.validateBigInt(a, "a");
    const bigB = this.validateBigInt(b, "b");
    return bigA * bigB;
  }
}

class Divide extends BigIntMethodBuilder {
  override call() {
    const [a, b] = this.args;
    const bigA = this.validateBigInt(a, "a");
    const bigB = this.validateBigInt(b, "b");

    if (bigB === 0n) {
      throw this.throwErrorFormatters(new Error("Division by zero"));
    }

    return bigA / bigB;
  }
}

class Remainder extends BigIntMethodBuilder {
  override call() {
    const [a, b] = this.args;
    const bigA = this.validateBigInt(a, "a");
    const bigB = this.validateBigInt(b, "b");

    if (bigB === 0n) {
      throw this.throwErrorFormatters(new Error("Division by zero"));
    }

    return bigA % bigB;
  }
}

class Power extends BigIntMethodBuilder {
  override call() {
    const [base, exponent] = this.args;
    const bigBase = this.validateBigInt(base, "base");
    const bigExp = this.validateBigInt(exponent, "exponent");

    this.validateNonNegative(bigExp, "exponent");

    return bigBase ** bigExp;
  }
}

class Abs extends BigIntMethodBuilder {
  override call() {
    const [value] = this.args;
    const bigValue = this.validateBigInt(value, "value");
    return bigValue < 0n ? -bigValue : bigValue;
  }
}

class Sign extends BigIntMethodBuilder {
  override call() {
    const [value] = this.args;
    const bigValue = this.validateBigInt(value, "value");

    if (bigValue > 0n) return 1n;
    if (bigValue < 0n) return -1n;
    return 0n;
  }
}

class Max extends BigIntMethodBuilder {
  override call() {
    if (this.args.length === 0) {
      throw this.throwErrorFormatters(new Error("max() expected at least 1 argument"));
    }

    let max = this.validateBigInt(this.args[0], "args[0]");

    for (let i = 1; i < this.args.length; i++) {
      const current = this.validateBigInt(this.args[i], `args[${i}]`);
      if (current > max) {
        max = current;
      }
    }

    return max;
  }
}

class Min extends BigIntMethodBuilder {
  override call() {
    if (this.args.length === 0) {
      throw this.throwErrorFormatters(new Error("min() expected at least 1 argument"));
    }

    let min = this.validateBigInt(this.args[0], "args[0]");

    for (let i = 1; i < this.args.length; i++) {
      const current = this.validateBigInt(this.args[i], `args[${i}]`);
      if (current < min) {
        min = current;
      }
    }

    return min;
  }
}

class Compare extends BigIntMethodBuilder {
  override call() {
    const [a, b] = this.args;
    const bigA = this.validateBigInt(a, "a");
    const bigB = this.validateBigInt(b, "b");

    if (bigA > bigB) return 1;
    if (bigA < bigB) return -1;
    return 0;
  }
}

class Equal extends BigIntMethodBuilder {
  override call() {
    const [a, b] = this.args;
    const bigA = this.validateBigInt(a, "a");
    const bigB = this.validateBigInt(b, "b");
    return bigA === bigB;
  }
}

class NotEqual extends BigIntMethodBuilder {
  override call() {
    const [a, b] = this.args;
    const bigA = this.validateBigInt(a, "a");
    const bigB = this.validateBigInt(b, "b");
    return bigA !== bigB;
  }
}

class LessThan extends BigIntMethodBuilder {
  override call() {
    const [a, b] = this.args;
    const bigA = this.validateBigInt(a, "a");
    const bigB = this.validateBigInt(b, "b");
    return bigA < bigB;
  }
}

class LessThanOrEqual extends BigIntMethodBuilder {
  override call() {
    const [a, b] = this.args;
    const bigA = this.validateBigInt(a, "a");
    const bigB = this.validateBigInt(b, "b");
    return bigA <= bigB;
  }
}

class GreaterThan extends BigIntMethodBuilder {
  override call() {
    const [a, b] = this.args;
    const bigA = this.validateBigInt(a, "a");
    const bigB = this.validateBigInt(b, "b");
    return bigA > bigB;
  }
}

class GreaterThanOrEqual extends BigIntMethodBuilder {
  override call() {
    const [a, b] = this.args;
    const bigA = this.validateBigInt(a, "a");
    const bigB = this.validateBigInt(b, "b");
    return bigA >= bigB;
  }
}

export {
  BigIntMethodBuilder,
  Add,
  Subtract,
  Multiply,
  Divide,
  Remainder,
  Power,
  Abs,
  Sign,
  Max,
  Min,
  Compare,
  Equal,
  NotEqual,
  LessThan,
  LessThanOrEqual,
  GreaterThan,
  GreaterThanOrEqual,
};
