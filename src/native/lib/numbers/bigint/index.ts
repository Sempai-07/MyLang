import { ArgumentsError } from "../../../../errors/BaseError";

function ensureArgsCount(args: any[], count: number, message: string): void {
  if (args.length < count) {
    throw new ArgumentsError(message, [
      `mylang:numbers/bigint (${__filename})`,
    ]);
  }
}

function toBigInt(value: any): bigint {
  try {
    return BigInt(value);
  } catch (e) {
    throw new ArgumentsError(`Invalid BigInt value: ${value}`, [
      `mylang:bigint (${__filename})`,
    ]);
  }
}

function add(args: any[]): bigint {
  ensureArgsCount(args, 2, "requires 2 arguments: a and b.");
  const [a, b] = [toBigInt(args[0]), toBigInt(args[1])];
  return a + b;
}

function subtract(args: any[]): bigint {
  ensureArgsCount(args, 2, "requires 2 arguments: a and b.");
  const [a, b] = [toBigInt(args[0]), toBigInt(args[1])];
  return a - b;
}

function multiply(args: any[]): bigint {
  ensureArgsCount(args, 2, "requires 2 arguments: a and b.");
  const [a, b] = [toBigInt(args[0]), toBigInt(args[1])];
  return a * b;
}

function divide(args: any[]): bigint {
  ensureArgsCount(args, 2, "requires 2 arguments: a and b.");
  const [a, b] = [toBigInt(args[0]), toBigInt(args[1])];
  if (b === 0n) {
    throw new ArgumentsError("Division by zero", [
      `mylang:bigint (${__filename})`,
    ]);
  }
  return a / b;
}

function mod(args: any[]): bigint {
  ensureArgsCount(args, 2, "requires 2 arguments: a and b.");
  const [a, b] = [toBigInt(args[0]), toBigInt(args[1])];
  if (b === 0n) {
    throw new ArgumentsError("Modulo by zero", [
      `mylang:bigint (${__filename})`,
    ]);
  }
  return a % b;
}

function pow(args: any[]): bigint {
  ensureArgsCount(args, 2, "requires 2 arguments: base and exponent.");
  const [base, exponent] = [toBigInt(args[0]), toBigInt(args[1])];
  if (exponent < 0n) {
    throw new ArgumentsError("Negative exponents are not supported", [
      `mylang:bigint (${__filename})`,
    ]);
  }
  return base ** exponent;
}

function equals(args: any[]): boolean {
  ensureArgsCount(args, 2, "requires 2 arguments: a and b.");
  const [a, b] = [toBigInt(args[0]), toBigInt(args[1])];
  return a === b;
}

function greaterThan(args: any[]): boolean {
  ensureArgsCount(args, 2, "requires 2 arguments: a and b.");
  const [a, b] = [toBigInt(args[0]), toBigInt(args[1])];
  return a > b;
}

function lessThan(args: any[]): boolean {
  ensureArgsCount(args, 2, "requires 2 arguments: a and b.");
  const [a, b] = [toBigInt(args[0]), toBigInt(args[1])];
  return a < b;
}

function abs(args: any[]): bigint {
  ensureArgsCount(args, 1, "requires 1 argument: value.");
  const value = toBigInt(args[0]);
  return value < 0n ? -value : value;
}

function negate(args: any[]): bigint {
  ensureArgsCount(args, 1, "requires 1 argument: value.");
  const value = toBigInt(args[0]);
  return -value;
}

function isZero(args: any[]): boolean {
  ensureArgsCount(args, 1, "requires 1 argument: value.");
  const value = toBigInt(args[0]);
  return value === 0n;
}

function isPositive(args: any[]): boolean {
  ensureArgsCount(args, 1, "requires 1 argument: value.");
  const value = toBigInt(args[0]);
  return value > 0n;
}

function isNegative(args: any[]): boolean {
  ensureArgsCount(args, 1, "requires 1 argument: value.");
  const value = toBigInt(args[0]);
  return value < 0n;
}

function toNumberFromBigInt(args: any[]): number {
  ensureArgsCount(args, 1, "requires 1 argument: value.");
  const value = toBigInt(args[0]);
  return Number(value);
}

function toSafeNumber(args: any[]): number {
  ensureArgsCount(args, 1, "requires 1 argument: value.");
  const value = toBigInt(args[0]);
  if (
    value > BigInt(Number.MAX_SAFE_INTEGER) ||
    value < BigInt(Number.MIN_SAFE_INTEGER)
  ) {
    console.warn(
      "Number is outside the safe integer range, precision may be lost.",
    );
  }
  return Number(value);
}

function sqrt(args: any[]): bigint {
  ensureArgsCount(args, 1, "requires 1 argument: value.");
  const value = toBigInt(args[0]);
  if (value < 0n) {
    throw new ArgumentsError(
      "Square root of negative numbers is not supported",
      [`mylang:bigint (${__filename})`],
    );
  }
  return BigInt(Math.floor(Math.sqrt(Number(value))));
}

function log(args: any[]): number {
  ensureArgsCount(args, 1, "requires 1 argument: value.");
  const value = toBigInt(args[0]);
  if (value <= 0n) {
    throw new ArgumentsError(
      "Logarithm of non-positive numbers is not supported",
      [`mylang:bigint (${__filename})`],
    );
  }
  return Math.log(Number(value));
}

export {
  toBigInt,
  add,
  subtract,
  multiply,
  divide,
  mod,
  pow,
  equals,
  greaterThan,
  lessThan,
  abs,
  negate,
  isZero,
  isPositive,
  isNegative,
  toNumberFromBigInt,
  toSafeNumber,
  sqrt,
  log,
};
