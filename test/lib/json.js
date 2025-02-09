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

test("parse function", () => {
  const result = run(`
    import "json";
    json.parse('{"name": "Alice", "age": 25}');
  `);
  deepEqual(result, { name: "Alice", age: 25 });
});

test("stringify function", () => {
  const result = run(`
    import "json";
    json.stringify({ name: "Alice", age: 25 });
  `);
  deepEqual(result, '{"name":"Alice","age":25}');
});

test("parse invalid JSON", () => {
  throws(() =>
    run(`
    import "json";
    json.parse('{"name": "Alice", "age": }');
  `),
  );
});
