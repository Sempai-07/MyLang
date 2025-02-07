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

test("request successful GET", () => {
  const result = run(`
    import "https";
    https.request("https://jsonplaceholder.typicode.com/posts/1", "GET");
  `);
  deepEqual(result.statusCode, 200);
  deepEqual(result.headers["content-type"], "application/json; charset=utf-8");
});

test("request with body", () => {
  const result = run(`
    import "json";
    import "https";
    https.request("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      body: json.stringify({ title: "foo", body: "bar", userId: 1 }),
      headers: { "Content-Type": "application/json" }
    });
  `);
  deepEqual(result.statusCode, 201);
  deepEqual(result.body.toJSON(), {
    id: 101,
    title: "foo",
    body: "bar",
    userId: 1,
  });
});

test("request invalid URL", () => {
  throws(() => run(`
    import "https";
    https.request("invalid-url", "GET");
  `), { message: /Failed to perform request/ });
});
