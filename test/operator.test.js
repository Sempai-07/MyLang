const { test } = require("node:test");
const path = require("node:path");
const { deepEqual, throws } = require("node:assert");
const runFile = require("../dist/src/utils/utils").run;

function run(code) {
  return runFile(code, {
    base: process.cwd(),
    main: path.join(process.cwd(), "/test.ml"),
  }).result;
}

test("arithmetic addition operator", () => {
  const result = run(`
    var n1 = 1 + 5;
    var n2 = "string" + "concat";
    var n3 = 1.5 + 2.5;

    [n1, n2, n3]
  `);
  deepEqual(result, [6, "stringconcat", 4]);
});

test("arithmetic subtraction operator", () => {
  const result = run(`
    var n1 = 5 - 1;
    var n2 = "hello" - 1;
    var n3 = 2.5 - 1;

    [n1, n2, n3]
  `);
  deepEqual(result, [4, NaN, 1.5]);
});

test("arithmetic multiplication operator", () => {
  const result = run(`
    var n1 = 2 * 3;
    var n2 = "test" * 3;
    var n3 = 1.5 * 2;

    [n1, n2, n3]
  `);
  deepEqual(result, [6, NaN, 3]);
});

test("arithmetic division operator", () => {
  const result = run(`
    var n1 = 6 / 3;
    var n2 = 5 / 2;
    var n3 = 3 / "text";

    [n1, n2, n3]
  `);
  deepEqual(result, [2, 2.5, NaN]);
});

test("arithmetic modulus operator", () => {
  const result = run(`
    var n1 = 5 % 2;
    var n2 = 7 % 3;
    var n3 = 5 % "text";

    [n1, n2, n3]
  `);
  deepEqual(result, [1, 1, NaN]);
});

test("comparison equality operator", () => {
  const result = run(`
    var n1 = 1 == 1;
    var n2 = 2 == 1;
    var n3 = "a" == "a";
    var n4 = 1 == "1";

    [n1, n2, n3, n4]
  `);
  deepEqual(result, [true, false, true, true]);
});

test("comparison inequality operator", () => {
  const result = run(`
    var n1 = 1 != 1;
    var n2 = 2 != 1;
    var n3 = "a" != "b";
    var n4 = 1 != "1";

    [n1, n2, n3, n4]
  `);
  deepEqual(result, [false, true, true, false]);
});

test("comparison greater than operator", () => {
  const result = run(`
    var n1 = 5 > 3;
    var n2 = 2 > 5;
    var n3 = "apple" > "banana";
    var n4 = 1 > 2;

    [n1, n2, n3, n4]
  `);
  deepEqual(result, [true, false, false, false]);
});

test("comparison less than operator", () => {
  const result = run(`
    var n1 = 3 < 5;
    var n2 = 5 < 2;
    var n3 = "apple" < "banana";
    var n4 = 2 < 1;

    [n1, n2, n3, n4]
  `);
  deepEqual(result, [true, false, true, false]);
});

test("logical AND operator", () => {
  const result = run(`
    var n1 = true && true;
    var n2 = true && false;
    var n3 = false && true;
    var n4 = false && false;

    [n1, n2, n3, n4]
  `);
  deepEqual(result, [true, false, false, false]);
});

test("logical OR operator", () => {
  const result = run(`
    var n1 = true || true;
    var n2 = true || false;
    var n3 = false || true;
    var n4 = false || false;

    [n1, n2, n3, n4]
  `);
  deepEqual(result, [true, true, true, false]);
});

test("bitwise AND operator", () => {
  const result = run(`
    var n1 = 5 & 3;
    var n2 = 7 & 2;
    var n3 = 12 & 8;

    [n1, n2, n3]
  `);
  deepEqual(result, [1, 2, 8]);
});

test("bitwise OR operator", () => {
  const result = run(`
    var n1 = 5 | 3;
    var n2 = 7 | 2;
    var n3 = 12 | 8;

    [n1, n2, n3]
  `);
  deepEqual(result, [7, 7, 12]);
});

test("assignment operator", () => {
  const result = run(`
    var n1 = 5;
    var n2 = "test";

    [n1, n2]
  `);
  deepEqual(result, [5, "test"]);
});

test("increment operator", () => {
  const result = run(`
    var n1 = 1;
    var n2 = n1++;

    [n1, n2]
  `);
  deepEqual(result, [2, 1]);
});

test("decrement operator", () => {
  const result = run(`
    var n1 = 3;
    var n2 = n1--;

    [n1, n2]
  `);
  deepEqual(result, [2, 3]);
});

test("ternary operator", () => {
  const result = run(`
    var n1 = true ? "yes" : "no";
    var n2 = false ? "yes" : "no";

    [n1, n2]
  `);
  deepEqual(result, ["yes", "no"]);
});

test("logical NOT operator", () => {
  const result = run(`
    var n1 = !true;
    var n2 = !false;

    [n1, n2]
  `);
  deepEqual(result, [false, true]);
});

test("unary plus operator", () => {
  const result = run(`
    var n1 = +"4";
    var n2 = +"text";
    var n3 = +true;
    var n4 = +false;

    [n1, n2, n3, n4]
  `);
  deepEqual(result, [4, NaN, 1, 0]);
});

test("unary minus operator", () => {
  const result = run(`
    var n1 = -"4";
    var n2 = -"text";
    var n3 = -true;
    var n4 = -false;

    [n1, n2, n3, n4]
  `);
  deepEqual(result, [-4, NaN, -1, 0]);
});
