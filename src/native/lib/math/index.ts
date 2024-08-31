function abs([number]: [number]): number {
  return Math.abs(number);
}

function acos([number]: [number]): number {
  return Math.acos(number);
}

function acosh([number]: [number]): number {
  return Math.acosh(number);
}

function asin([number]: [number]): number {
  return Math.asin(number);
}

function asinh([number]: [number]): number {
  return Math.asinh(number);
}

function atan([number]: [number]): number {
  return Math.atan(number);
}

function atan2([y, x]: [number, number]): number {
  return Math.atan2(y, x);
}

function atanh([number]: [number]): number {
  return Math.atanh(number);
}

function cbrt([number]: [number]): number {
  return Math.cbrt(number);
}

function ceil([number]: [number]): number {
  return Math.ceil(number);
}

function clz32([number]: [number]): number {
  return Math.clz32(number);
}

function cos([number]: [number]): number {
  return Math.cos(number);
}

function cosh([number]: [number]): number {
  return Math.cosh(number);
}

function exp([number]: [number]): number {
  return Math.exp(number);
}

function expm1([number]: [number]): number {
  return Math.expm1(number);
}

function floor([number]: [number]): number {
  return Math.floor(number);
}

function fround([number]: [number]): number {
  return Math.fround(number);
}

function hypot(numbers: number[]): number {
  return Math.hypot(...numbers);
}

function imul([a, b]: [number, number]): number {
  return Math.imul(a, b);
}

function log([number]: [number]): number {
  return Math.log(number);
}

function log10([number]: [number]): number {
  return Math.log10(number);
}

function log1p([number]: [number]): number {
  return Math.log1p(number);
}

function log2([number]: [number]): number {
  return Math.log2(number);
}

function max(numbers: number[]): number {
  return Math.max(...numbers);
}

function min(numbers: number[]): number {
  return Math.min(...numbers);
}

function pow([base, exponent]: [number, number]): number {
  return Math.pow(base, exponent);
}

function random(): number {
  return Math.random();
}

function round([number]: [number]): number {
  return Math.round(number);
}

function sign([number]: [number]): number {
  return Math.sign(number);
}

function sin([number]: [number]): number {
  return Math.sin(number);
}

function sinh([number]: [number]): number {
  return Math.sinh(number);
}

function sqrt([number]: [number]): number {
  return Math.sqrt(number);
}

function tan([number]: [number]): number {
  return Math.tan(number);
}

function tanh([number]: [number]): number {
  return Math.tanh(number);
}

function trunc([number]: [number]): number {
  return Math.trunc(number);
}

const pi = Math.PI;

export {
  abs,
  acos,
  acosh,
  asin,
  asinh,
  atan,
  atan2,
  atanh,
  cbrt,
  ceil,
  clz32,
  cos,
  cosh,
  exp,
  expm1,
  floor,
  fround,
  hypot,
  imul,
  log,
  log10,
  log1p,
  log2,
  max,
  min,
  pow,
  random,
  round,
  sign,
  sin,
  sinh,
  sqrt,
  tan,
  tanh,
  trunc,
  pi,
};
