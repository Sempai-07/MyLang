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

test("createBigInt function", () => {
  const result = run(`
    import "numbers/bigint";
    bigint.toBigInt("123456789012345678901234567890");
  `);
  deepEqual(result.toString(), "123456789012345678901234567890");
});

test("add function", () => {
  const result = run(`
    import "numbers/bigint";
    bigint.add("123456789012345678901234567890", "987654321098765432109876543210");
  `);
  deepEqual(result.toString(), "1111111110111111111011111111100");
});

test("subtract function", () => {
  const result = run(`
    import "numbers/bigint";
    bigint.subtract("123456789012345678901234567890", "987654321098765432109876543210");
  `);
  deepEqual(result.toString(), "-864197532086419753208641975320");
});

test("multiply function", () => {
  const result = run(`
    import "numbers/bigint";
    bigint.multiply("123456789012345678901234567890", "2");
  `);
  deepEqual(result.toString(), "246913578024691357802469135780");
});

test("divide function", () => {
  const result = run(`
    import "numbers/bigint";
    bigint.divide("123456789012345678901234567890", "2");
  `);
  deepEqual(result.toString(), "61728394506172839450617283945");
});

test("mod function", () => {
  const result = run(`
    import "numbers/bigint";
    bigint.mod("123456789012345678901234567890", "100000000000000000000000000000");
  `);
  deepEqual(result.toString(), "23456789012345678901234567890");
});

test("pow function", () => {
  const result = run(`
    import "numbers/bigint";
    bigint.pow("2", "10");
  `);
  deepEqual(result.toString(), "1024");
});

test("equals function", () => {
  const result = run(`
    import "numbers/bigint";
    bigint.equals("123456789012345678901234567890", "123456789012345678901234567890");
  `);
  deepEqual(result, true);
});

test("greaterThan function", () => {
  const result = run(`
    import "numbers/bigint";
    bigint.greaterThan("123456789012345678901234567890", "987654321098765432109876543210");
  `);
  deepEqual(result, false);
});

test("lessThan function", () => {
  const result = run(`
    import "numbers/bigint";
    bigint.lessThan("123456789012345678901234567890", "987654321098765432109876543210");
  `);
  deepEqual(result, true);
});

test("abs function", () => {
  const result = run(`
    import "numbers/bigint";
    bigint.abs("-123456789012345678901234567890");
  `);
  deepEqual(result.toString(), "123456789012345678901234567890");
});

test("negate function", () => {
  const result = run(`
    import "numbers/bigint";
    bigint.negate("123456789012345678901234567890");
  `);
  deepEqual(result.toString(), "-123456789012345678901234567890");
});

test("isZero function", () => {
  const result = run(`
    import "numbers/bigint";
    bigint.isZero("0");
  `);
  deepEqual(result, true);
});

test("isPositive function", () => {
  const result = run(`
    import "numbers/bigint";
    bigint.isPositive("123456789012345678901234567890");
  `);
  deepEqual(result, true);
});

test("isNegative function", () => {
  const result = run(`
    import "numbers/bigint";
    bigint.isNegative("-123456789012345678901234567890");
  `);
  deepEqual(result, true);
});

test("toNumberFromBigInt function", () => {
  const result = run(`
    import "numbers/bigint";
    bigint.toNumberFromBigInt("123456789012345678901234567890");
  `);
  deepEqual(result, 1.2345678901234568e29);
});

test("toSafeNumber function", () => {
  const result = run(`
    import "numbers/bigint";
    bigint.toSafeNumber("123456789012345678901234567890");
  `);
  deepEqual(result, 1.2345678901234568e29);
});

test("sqrt function", () => {
  const result = run(`
    import "numbers/bigint";
    bigint.sqrt("100000000000000000000");
  `);
  deepEqual(result.toString(), "10000000000");
});

test("log function", () => {
  const result = run(`
    import "numbers/bigint";
    bigint.log("100000000000000000000");
  `);
  deepEqual(result, Math.log(1e20));
});
