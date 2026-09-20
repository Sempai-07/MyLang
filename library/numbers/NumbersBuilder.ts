import { FunctionBuilder, FunctionBuilderCodeError } from "../FunctionBuilder";
import { Environment } from "../../src/Environment";
import { type StmtType } from "../../src/ast/StmtType";
import { isTypeArgs } from "../utils/utils";

abstract class NumbersMethodBuilder extends FunctionBuilder {
  constructor(args: any[], astArgs: StmtType[], environment: Environment) {
    super(args, astArgs, environment);
  }

  get pkgInfo() {
    return {
      name: "numbers",
      path: __dirname,
    };
  }

  protected validateNumber(num: any, argName: string = "number"): void {
    const type = isTypeArgs(num);
    if (type !== "int" && type !== "float") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "number",
        received: type,
      });
    }
  }

  protected validateInteger(num: any, argName: string = "integer"): void {
    if (isTypeArgs(num) !== "int") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "int",
        received: isTypeArgs(num),
      });
    }
  }

  protected validateArray(arr: any, argName: string = "array"): void {
    if (isTypeArgs(arr) !== "array") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "array",
        received: isTypeArgs(arr),
      });
    }
  }

  protected validateFunction(func: any, argName: string = "function"): void {
    if (isTypeArgs(func) !== "function") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "function",
        received: isTypeArgs(func),
      });
    }
  }

  protected validateNonEmptyArray(arr: any[], argName: string): void {
    this.validateArray(arr, argName);
    if (arr.length === 0) {
      throw this.throwErrorFormatters(new Error(`${argName} cannot be empty`));
    }
  }

  protected validateNumericArray(arr: any[], argName: string): number[] {
    this.validateNonEmptyArray(arr, argName);
    const numericArray: number[] = [];

    for (let i = 0; i < arr.length; i++) {
      const type = isTypeArgs(arr[i]);
      if (type !== "int" && type !== "float") {
        throw this.throwErrorFormatters(
          new Error(`${argName}[${i}] must be a number, got ${type}`),
        );
      }
      numericArray.push(Number(arr[i]));
    }

    return numericArray;
  }

  protected validatePositiveNumber(num: number, argName: string): void {
    if (num <= 0) {
      throw this.throwErrorFormatters(new Error(`${argName} must be positive, got ${num}`));
    }
  }

  protected validateNonNegativeNumber(num: number, argName: string): void {
    if (num < 0) {
      throw this.throwErrorFormatters(new Error(`${argName} must be non-negative, got ${num}`));
    }
  }

  protected validateRange(num: number, min: number, max: number, argName: string): void {
    if (num < min || num > max) {
      throw this.throwErrorFormatters(
        new Error(`${argName} must be between ${min} and ${max}, got ${num}`),
      );
    }
  }

  protected executeCallback(callbackFunc: any, args: any[]): any {
    if (this.isBuildModuleFunction(callbackFunc)) {
      return new callbackFunc(args, [], this.environment).call();
    }
    return callbackFunc.call(args.map((v) => ({ value: v })));
  }

  call() {
    throw new Error("Call is not implemented");
  }
}

class NumbersUtils {
  static factorial(n: number): number {
    if (n < 0) throw new Error("Factorial is not defined for negative numbers");
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }

  static gcd(a: number, b: number): number {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b !== 0) {
      [a, b] = [b, a % b];
    }
    return a;
  }

  static lcm(a: number, b: number): number {
    return Math.abs(a * b) / NumbersUtils.gcd(a, b);
  }

  static isPrime(n: number): boolean {
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;

    const sqrt = Math.sqrt(n);
    for (let i = 3; i <= sqrt; i += 2) {
      if (n % i === 0) return false;
    }
    return true;
  }

  static combinations(n: number, k: number): number {
    if (k > n) return 0;
    if (k === 0 || k === n) return 1;

    k = Math.min(k, n - k);
    let result = 1;

    for (let i = 0; i < k; i++) {
      result = (result * (n - i)) / (i + 1);
    }

    return Math.round(result);
  }

  static permutations(n: number, k: number): number {
    if (k > n) return 0;
    if (k === 0) return 1;

    let result = 1;
    for (let i = n; i > n - k; i--) {
      result *= i;
    }
    return result;
  }

  static primeFactors(n: number): number[] {
    const factors: number[] = [];
    let divisor = 2;

    while (divisor * divisor <= n) {
      while (n % divisor === 0) {
        factors.push(divisor);
        n /= divisor;
      }
      divisor++;
    }

    if (n > 1) {
      factors.push(n);
    }

    return factors;
  }

  static fibonacci(n: number): number {
    if (n < 0) throw new Error("Fibonacci is not defined for negative numbers");
    if (n === 0) return 0;
    if (n === 1) return 1;

    let a = 0,
      b = 1;
    for (let i = 2; i <= n; i++) {
      [a, b] = [b, a + b];
    }
    return b;
  }
}

export { NumbersMethodBuilder, NumbersUtils };
