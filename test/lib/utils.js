const { test } = require("node:test");
const path = require("node:path");
const { deepEqual } = require("node:assert");
const runFile = require("../../dist/src/utils/utils").run;

function run(code) {
  return runFile(code, {
    base: process.cwd(),
    main: path.join(process.cwd(), "/test.ml"),
  }).result;
}

test("typeOf nil", () => {
  const result = run(`
    import "utils";
    utils.typeOf(nil)
  `);
  deepEqual(result, "nil");
});

test("typeOf int", () => {
  const result = run(`
    import "utils";
    utils.typeOf(42)
  `);
  deepEqual(result, "int");
});

test("typeOf float", () => {
  const result = run(`
    import "utils";
    utils.typeOf(3.14)
  `);
  deepEqual(result, "float");
});

test("typeOf nan", () => {
  const result = run(`
    import "utils";
    utils.typeOf(0/0)
  `);
  deepEqual(result, "nan");
});

test("typeOf infinity", () => {
  const result = run(`
    import "utils";
    utils.typeOf(1/0)
  `);
  deepEqual(result, "infinity");
});

test("typeOf boolean", () => {
  const result = run(`
    import "utils";
    utils.typeOf(true)
  `);
  deepEqual(result, "boolean");
});

test("typeOf string", () => {
  const result = run(`
    import "utils";
    utils.typeOf("hello")
  `);
  deepEqual(result, "string");
});

test("typeOf array", () => {
  const result = run(`
    import "utils";
    utils.typeOf([1, 2, 3])
  `);
  deepEqual(result, "array");
});

test("typeOf object", () => {
  const result = run(`
    import "utils";
    utils.typeOf({ key: "value" })
  `);
  deepEqual(result, "object");
});

test("typeOf function", () => {
  const result = run(`
    import "utils";
    func example() {}
    utils.typeOf(example)
  `);
  deepEqual(result, "function");
});

test("typeOf error", () => {
  const result = run(`
    import "utils";
    import "errors";
    var err = errors.BaseError("Test error");
    utils.typeOf(err)
  `);
  deepEqual(result, "error");
});

test("isEmpty nil", () => {
  const result = run(`
    import "utils";
    utils.isEmpty(nil)
  `);
  deepEqual(result, true);
});

test("isEmpty empty string", () => {
  const result = run(`
    import "utils";
    utils.isEmpty("")
  `);
  deepEqual(result, true);
});

test("isEmpty whitespace string", () => {
  const result = run(`
    import "utils";
    utils.isEmpty("   ")
  `);
  deepEqual(result, true);
});

test("isEmpty non-empty string", () => {
  const result = run(`
    import "utils";
    utils.isEmpty("hello")
  `);
  deepEqual(result, false);
});

test("isEmpty empty array", () => {
  const result = run(`
    import "utils";
    utils.isEmpty([])
  `);
  deepEqual(result, true);
});

test("isEmpty non-empty array", () => {
  const result = run(`
    import "utils";
    utils.isEmpty([1, 2, 3])
  `);
  deepEqual(result, false);
});

test("isEmpty empty object", () => {
  const result = run(`
    import "utils";
    utils.isEmpty({})
  `);
  deepEqual(result, true);
});

test("isEmpty non-empty object", () => {
  const result = run(`
    import "utils";
    utils.isEmpty({ key: "value" })
  `);
  deepEqual(result, false);
});

test("isEmpty function with empty body", () => {
  const result = run(`
    import "utils";
    func emptyFunc() {}
    utils.isEmpty(emptyFunc)
  `);
  deepEqual(result, true);
});

test("isEmpty function with body", () => {
  const result = run(`
    import "utils";
    func nonEmptyFunc() { return 1; }
    utils.isEmpty(nonEmptyFunc)
  `);
  deepEqual(result, false);
});
