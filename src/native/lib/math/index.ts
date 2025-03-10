import { ArgumentsError } from "../../../errors/BaseError";

function ensureArgsCount(args: any[], count: number, message: string): void {
  if (args.length < count) {
    throw new ArgumentsError(message, [`mylang:math (${__filename})`]);
  }
}

function toNumber(value: any): number {
  const num = Number(value);
  if (isNaN(num))
    throw new ArgumentsError(`Invalid number: ${value}`, [
      `mylang:math (${__filename})`,
    ]);
  return num;
}

function abs(args: any[]): number {
  ensureArgsCount(args, 1, "requires 1 argument: number.");
  return Math.abs(toNumber(args[0]));
}

function ceil(args: any[]): number {
  ensureArgsCount(args, 1, "requires 1 argument: number.");
  return Math.ceil(toNumber(args[0]));
}

function floor(args: any[]): number {
  ensureArgsCount(args, 1, "requires 1 argument: number.");
  return Math.floor(toNumber(args[0]));
}

function round(args: any[]): number {
  ensureArgsCount(args, 1, "requires 1 argument: number.");
  return Math.round(toNumber(args[0]));
}

function max(args: any[]): number {
  if (!args.length)
    throw new ArgumentsError("requires at least 1 argument.", [
      `mylang:math (${__filename})`,
    ]);
  return Math.max(...args.map(toNumber));
}

function min(args: any[]): number {
  if (!args.length)
    throw new ArgumentsError("requires at least 1 argument.", [
      `mylang:math (${__filename})`,
    ]);
  return Math.min(...args.map(toNumber));
}

function pow(args: any[]): number {
  ensureArgsCount(args, 2, "requires 2 arguments: base and exponent.");
  return Math.pow(toNumber(args[0]), toNumber(args[1]));
}

function sqrt(args: any[]): number {
  ensureArgsCount(args, 1, "requires 1 argument: number.");
  return Math.sqrt(toNumber(args[0]));
}

function random(): number {
  return Math.random();
}

function sin(args: any[]): number {
  ensureArgsCount(args, 1, "requires 1 argument: angle in radians.");
  return Math.sin(toNumber(args[0]));
}

function cos(args: any[]): number {
  ensureArgsCount(args, 1, "requires 1 argument: angle in radians.");
  return Math.cos(toNumber(args[0]));
}

function tan(args: any[]): number {
  ensureArgsCount(args, 1, "requires 1 argument: angle in radians.");
  return Math.tan(toNumber(args[0]));
}

function asin(args: any[]): number {
  ensureArgsCount(args, 1, "requires 1 argument: number.");
  return Math.asin(toNumber(args[0]));
}

function acos(args: any[]): number {
  ensureArgsCount(args, 1, "requires 1 argument: number.");
  return Math.acos(toNumber(args[0]));
}

function atan(args: any[]): number {
  ensureArgsCount(args, 1, "requires 1 argument: number.");
  return Math.atan(toNumber(args[0]));
}

function atan2(args: any[]): number {
  ensureArgsCount(args, 2, "requires 2 arguments: y and x.");
  return Math.atan2(toNumber(args[0]), toNumber(args[1]));
}

function log(args: any[]): number {
  ensureArgsCount(args, 1, "requires 1 argument: number.");
  return Math.log(toNumber(args[0]));
}

function exp(args: any[]): number {
  ensureArgsCount(args, 1, "requires 1 argument: number.");
  return Math.exp(toNumber(args[0]));
}

function sign(args: any[]): number {
  ensureArgsCount(args, 1, "requires 1 argument: number.");
  return Math.sign(toNumber(args[0]));
}

function trunc(args: any[]): number {
  ensureArgsCount(args, 1, "requires 1 argument: number.");
  return Math.trunc(toNumber(args[0]));
}

export {
  abs,
  ceil,
  floor,
  round,
  max,
  min,
  pow,
  sqrt,
  random,
  sin,
  cos,
  tan,
  asin,
  acos,
  atan,
  atan2,
  log,
  exp,
  sign,
  trunc,
};
