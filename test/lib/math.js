const { test } = require("node:test");
const path = require("node:path");
const { deepEqual, throws } = require("node:assert");
const runFile = require("../../dist/src/utils/utils").run;

function run(code) {
  return runFile(code, {
    base: process.cwd(),
    main: path.join(process.cwd(), "/test.ml"),
  }).result;
}

test("abs function", () => {
  const result = run(`
    import "math";
    math.abs(-5);
  `);
  deepEqual(result, 5);
});

test("ceil function", () => {
  const result = run(`
    import "math";
    math.ceil(3.14);
  `);
  deepEqual(result, 4);
});

test("floor function", () => {
  const result = run(`
    import "math";
    math.floor(3.14);
  `);
  deepEqual(result, 3);
});

test("round function", () => {
  const result = run(`
    import "math";
    math.round(3.6);
  `);
  deepEqual(result, 4);
});

test("max function", () => {
  const result = run(`
    import "math";
    math.max(1, 2, 3);
  `);
  deepEqual(result, 3);
});

test("min function", () => {
  const result = run(`
    import "math";
    math.min(1, 2, 3);
  `);
  deepEqual(result, 1);
});

test("pow function", () => {
  const result = run(`
    import "math";
    math.pow(2, 3);
  `);
  deepEqual(result, 8);
});

test("sqrt function", () => {
  const result = run(`
    import "math";
    math.sqrt(9);
  `);
  deepEqual(result, 3);
});

test("random function", () => {
  const result = run(`
    import "math";
    math.random();
  `);
  deepEqual(typeof result, "number");
  deepEqual(result >= 0 && result < 1, true);
});

test("sin function", () => {
  const result = run(`
    import "math";
    math.sin(${Math.PI} / 2);
  `);
  deepEqual(result, 1);
});

test("cos function", () => {
  const result = run(`
    import "math";
    math.cos(0);
  `);
  deepEqual(result, 1);
});

test("tan function", () => {
  const result = run(`
    import "math";
    math.tan(${Math.PI} / 4);
  `);
  deepEqual(result, 0.9999999999999999);
});

test("asin function", () => {
  const result = run(`
    import "math";
    math.asin(1);
  `);
  deepEqual(result, Math.PI / 2);
});

test("acos function", () => {
  const result = run(`
    import "math";
    math.acos(1);
  `);
  deepEqual(result, 0);
});

test("atan function", () => {
  const result = run(`
    import "math";
    math.atan(1);
  `);
  deepEqual(result, Math.PI / 4);
});

test("atan2 function", () => {
  const result = run(`
    import "math";
    math.atan2(1, 1);
  `);
  deepEqual(result, Math.PI / 4);
});

test("log function", () => {
  const result = run(`
    import "math";
    math.log(${Math.E});
  `);
  deepEqual(result, 1);
});

test("exp function", () => {
  const result = run(`
    import "math";
    math.exp(1);
  `);
  deepEqual(result, Math.E);
});

test("sign function", () => {
  const result = run(`
    import "math";
    math.sign(-5);
  `);
  deepEqual(result, -1);
});

test("trunc function", () => {
  const result = run(`
    import "math";
    math.trunc(3.14);
  `);
  deepEqual(result, 3);
});
