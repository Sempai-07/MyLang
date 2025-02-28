const { test } = require("node:test");
const path = require("node:path");
const { deepEqual, ok } = require("node:assert");
const runFile = require("../../dist/src/utils/utils").run;

function run(code) {
  return runFile(code, {
    base: process.cwd(),
    main: path.join(process.cwd(), "/test.ml"),
  }).result;
}

test("platform", () => {
  const result = run(`
    import "os";
    os.platform()
  `);
  deepEqual(result, process.platform);
});

test("homedir", () => {
  const result = run(`
    import "os";
    os.homedir()
  `);
  deepEqual(result, require("os").homedir());
});

test("tmpdir", () => {
  const result = run(`
    import "os";
    os.tmpdir()
  `);
  deepEqual(result, require("os").tmpdir());
});

test("getEnv and setEnv", () => {
  run(`
    import "os";
    os.setEnv("MYLANG_TEST_ENV", "test_value")
  `);

  const result = run(`
    import "os";
    os.getEnv("MYLANG_TEST_ENV")
  `);
  deepEqual(result, "test_value");
});

test("cwd", () => {
  const result = run(`
    import "os";
    os.cwd()
  `);
  deepEqual(result, process.cwd());
});

test("userInfo", () => {
  const result = run(`
    import "os";
    os.userInfo()
  `);
  const expected = require("os").userInfo();
  deepEqual(result.username, expected.username);
  deepEqual(result.homedir, expected.homedir);
});

test("cpus", () => {
  const result = run(`
    import "os";
    os.cpus()
  `);
  const expected = require("os").cpus();
  deepEqual(result.length, expected.length);
  deepEqual(result[0]?.model, expected[0]?.model);
});

test("totalmem", () => {
  const result = run(`
    import "os";
    os.totalmem()
  `);
  deepEqual(result, require("os").totalmem());
});

test("freemem", () => {
  const result = run(`
    import "os";
    os.freemem()
  `);
  ok(typeof result === "number");
});

test("hostname", () => {
  const result = run(`
    import "os";
    os.hostname()
  `);
  deepEqual(result, require("os").hostname());
});

test("networkInterfaces", () => {
  const result = run(`
    import "os";
    os.networkInterfaces()
  `);
  const expected = require("os").networkInterfaces();
  ok(typeof result === "object");
  deepEqual(Object.keys(result), Object.keys(expected));
});
