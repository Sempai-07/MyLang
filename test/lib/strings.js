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

test("toStr function", () => {
  const result = run(`
    import "strings";
    strings.toStr("Hello", "World");
  `);
  deepEqual(result, "Hello World");
});

test("contains function", () => {
  const result = run(`
    import "strings";
    strings.contains("Hello World", "World");
  `);
  deepEqual(result, true);
});

test("containsAny function", () => {
  const result = run(`
    import "strings";
    strings.containsAny("Hello World", "o");
  `);
  deepEqual(result, true);
});

test("count function", () => {
  const result = run(`
    import "strings";
    strings.count("Hello World", "o");
  `);
  deepEqual(result, 2);
});

test("hasPrefix function", () => {
  const result = run(`
    import "strings";
    strings.hasPrefix("Hello World", "Hello");
  `);
  deepEqual(result, true);
});

test("hasSuffix function", () => {
  const result = run(`
    import "strings";
    strings.hasSuffix("Hello World", "World");
  `);
  deepEqual(result, true);
});

test("indexOf function", () => {
  const result = run(`
    import "strings";
    strings.indexOf("Hello World", "World");
  `);
  deepEqual(result, 6);
});

test("replace function", () => {
  const result = run(`
    import "strings";
    strings.replace("Hello World", "World", "Universe");
  `);
  deepEqual(result, "Hello Universe");
});

test("split function", () => {
  const result = run(`
    import "strings";
    strings.split("Hello World", " ");
  `);
  deepEqual(result, ["Hello", "World"]);
});

test("compare function", () => {
  const result = run(`
    import "strings";
    strings.compare("Hello", "Hello");
  `);
  deepEqual(result, 0);
});

test("join function", () => {
  const result = run(`
    import "strings";
    strings.join(["Hello", "World"], " ");
  `);
  deepEqual(result, "Hello World");
});

test("repeat function", () => {
  const result = run(`
    import "strings";
    strings.repeat("Hello", 3);
  `);
  deepEqual(result, "HelloHelloHello");
});

test("trim function", () => {
  const result = run(`
    import "strings";
    strings.trim("  Hello World  ");
  `);
  deepEqual(result, "Hello World");
});
