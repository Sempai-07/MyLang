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

test("isFiniteNumber function", () => {
  const result = run(`
    import "numbers";
    numbers.isFiniteNumber(10);
  `);
  deepEqual(result, true);
});

test("isInteger function", () => {
  const result = run(`
    import "numbers";
    numbers.isInteger(10);
  `);
  deepEqual(result, true);
});

test("isSafeInteger function", () => {
  const result = run(`
    import "numbers";
    numbers.isSafeInteger(10);
  `);
  deepEqual(result, true);
});

test("toFixed function", () => {
  const result = run(`
    import "numbers";
    numbers.toFixed(10.12345, 2);
  `);
  deepEqual(result, "10.12");
});

test("toExponential function", () => {
  const result = run(`
    import "numbers";
    numbers.toExponential(123.456);
  `);
  deepEqual(result, "1.23456e+2");
});

test("toPrecision function", () => {
  const result = run(`
    import "numbers";
    numbers.toPrecision(123.456, 4);
  `);
  deepEqual(result, "123.5");
});

test("constants maxSafeInteger", () => {
  const result = run(`
    import "numbers";
    numbers.constants.maxSafeInteger
  `);
  deepEqual(result, 9007199254740991);
});

test("constants minSafeInteger", () => {
  const result = run(`
    import "numbers";
    numbers.constants.minSafeInteger
  `);
  deepEqual(result, -9007199254740991);
});

test("constants maxValue", () => {
  const result = run(`
    import "numbers";
    numbers.constants.maxValue
  `);
  deepEqual(result, 1.7976931348623157e+308);
});

test("constants minValue", () => {
  const result = run(`
    import "numbers";
    numbers.constants.minValue
  `);
  deepEqual(result, 5e-324);
});

test("constants negativeInfinity", () => {
  const result = run(`
    import "numbers";
    numbers.constants.negativeInfinity
  `);
  deepEqual(result, -Infinity);
});

test("constants positiveInfinity", () => {
  const result = run(`
    import "numbers";
    numbers.constants.positiveInfinity
  `);
  deepEqual(result, Infinity);
});
