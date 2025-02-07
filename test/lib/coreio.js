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

test("print basic values", () => {
  const result = run(`
    import "coreio";
    coreio.print([1, "text", nil])
  `);
  deepEqual(result, undefined);
});

test("print object", () => {
  const result = run(`
    import "coreio";
    coreio.print([{ key: "value" }])
  `);
  deepEqual(result, undefined);
});

test("print nested array", () => {
  const result = run(`
    import "coreio";
    coreio.print([[1, 2, [3, 4]]])
  `);
  deepEqual(result, undefined);
});

test("printf with string interpolation", () => {
  const result = run(`
    import "coreio";
    coreio.printf(["Hello, &{1}!", "world"])
  `);
  deepEqual(result, undefined);
});

test("printf with multiple placeholders", () => {
  const result = run(`
    import "coreio";
    coreio.printf(["Sum of &{1} and &{2} is &{3}", 2, 3, 5])
  `);
  deepEqual(result, undefined);
});

test("printf with missing placeholders", () => {
  const result = run(`
    import "coreio";
    coreio.printf(["Hello, &{1}!"])
  `);
  deepEqual(result, undefined);
});

test("printf with non-string first argument", () => {
  const result = run(`
    import "coreio";
    coreio.printf([42, "ignored"])
  `);
  deepEqual(result, undefined);
});

test("print BaseError", () => {
  const result = run(`
    import "coreio";
    import "errors";
    var err = errors.BaseError("Test error");
    coreio.print([err])
  `);
  deepEqual(result, undefined);
});

test("printf BaseError", () => {
  const result = run(`
    import "coreio";
    import "errors";
    var err = errors.BaseError("Test error");
    coreio.printf([err])
  `);
  deepEqual(result, undefined);
});

test("print function", () => {
  const result = run(`
    import "coreio";
    func example() {}
    coreio.print([example])
  `);
  deepEqual(result, undefined);
});

test("print function without name", () => {
  const result = run(`
    import "coreio";
    coreio.print([func() {}])
  `);
  deepEqual(result, undefined);
});

test("print array with null values", () => {
  const result = run(`
    import "coreio";
    coreio.print([[1, nil, 3]])
  `);
  deepEqual(result, undefined);
});

test("print object with nested structures", () => {
  const result = run(`
    import "coreio";
    coreio.print([{ key: [1, { nested: nil }] }])
  `);
  deepEqual(result, undefined);
});
