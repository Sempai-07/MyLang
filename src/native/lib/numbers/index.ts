import { ArgumentsError } from "../../../errors/BaseError";

function ensureArgsCount(args: any[], count: number, message: string): void {
  if (args.length < count) {
    throw new ArgumentsError(message, [`mylang:numbers (${__filename})`]);
  }
}

function toNumber(value: any): number {
  const num = Number(value);
  if (isNaN(num))
    throw new ArgumentsError(`Invalid number: ${value}`, [
      `mylang:numbers (${__filename})`,
    ]);
  return num;
}

function isFiniteNumber(args: any[]): boolean {
  ensureArgsCount(args, 1, "requires 1 argument: value.");
  return Number.isFinite(toNumber(args[0]));
}

function isInteger(args: any[]): boolean {
  ensureArgsCount(args, 1, "requires 1 argument: value.");
  return Number.isInteger(toNumber(args[0]));
}

function isSafeInteger(args: any[]): boolean {
  ensureArgsCount(args, 1, "requires 1 argument: value.");
  return Number.isSafeInteger(toNumber(args[0]));
}

function toFixed(args: any[]): string {
  ensureArgsCount(
    args,
    2,
    "toFixed requires 2 arguments: number and decimals.",
  );
  const [value, decimals] = [toNumber(args[0]), toNumber(args[1])];
  if (!Number.isInteger(decimals) || decimals < 0) {
    throw new ArgumentsError("Decimals must be a non-negative integer.", [
      `mylang:numbers (${__filename})`,
    ]);
  }
  return value.toFixed(decimals);
}

function toExponential(args: any[]): string {
  ensureArgsCount(args, 1, "requires 1 argument: number.");
  return toNumber(args[0]).toExponential();
}

function toPrecision(args: any[]): string {
  ensureArgsCount(args, 2, "requires 2 arguments: number and precision.");
  const [value, precision] = [toNumber(args[0]), toNumber(args[1])];
  if (!Number.isInteger(precision) || precision <= 0) {
    throw new ArgumentsError("Precision must be a positive integer.", [
      `mylang:numbers (${__filename})`,
    ]);
  }
  return value.toPrecision(precision);
}

const constants = {
  maxSafeInteger: Number.MAX_SAFE_INTEGER,
  minSafeInteger: Number.MIN_SAFE_INTEGER,
  maxValue: Number.MAX_VALUE,
  minValue: Number.MIN_VALUE,
  negativeInfinity: Number.NEGATIVE_INFINITY,
  positiveInfinity: Number.POSITIVE_INFINITY,
};

// @ts-expect-error
constants.__proto__ = null;

export {
  isFiniteNumber,
  isInteger,
  isSafeInteger,
  toFixed,
  toExponential,
  toPrecision,
  constants,
};
