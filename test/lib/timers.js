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

test("clearTimeout valid ID", () => {
  const result = run(`
    import "timers";
    func test() { return "Hello, World!"; }
    var timeout = timers.Timeout.set(test, 1000);
    timers.Timeout.clear(timeout.timeoutId)
  `);
  deepEqual(result, undefined);
});

test("clearTimeout invalid ID", () => {
  throws(() => run(`
    import "timers";
    timers.Timeout.clear(9999)
  `));
});

test("clearInterval valid ID", () => {
  const result = run(`
    import "timers";
    func test() { return "Tick"; }
    var interval = timers.Interval.set(test, 1000);
    timers.Interval.clear(interval.intervalId)
  `);
  deepEqual(result, undefined);
});

test("clearInterval invalid ID", () => {
  throws(() => run(`
    import "timers";
    timers.Interval.clear(9999)
  `));
});

test("Timeout ref and unref", () => {
  const result = run(`
    import "timers";
    func test() { return "Ref test"; }
    var timeout = timers.Timeout.set(test, 1000);
    timers.Timeout.ref(timeout.timeoutId);
    timers.Timeout.unref(timeout.timeoutId);
  `);
  deepEqual(result, undefined);
});

test("Interval ref and unref", () => {
  const result = run(`
    import "timers";
    func test() { return "Ref test"; }
    var interval = timers.Interval.set(test, 1000);
    timers.Interval.ref(interval.intervalId);
    timers.Interval.unref(interval.intervalId);
  `);
  deepEqual(result, undefined);
});

test("clearAll Timeouts", () => {
  const result = run(`
    import "timers";
    func test() { return "Clear all Timeout"; }
    timers.Timeout.set(test, 1000);
    timers.Timeout.set(test, 1000);
    timers.Timeout.clearAll();
  `);
  deepEqual(result, undefined);
});

test("clearAll Intervals", () => {
  const result = run(`
    import "timers";
    func test() { return "Clear all Interval"; }
    timers.Interval.set(test, 1000);
    timers.Interval.set(test, 1000);
    timers.Interval.clearAll();
  `);
  deepEqual(result, undefined);
});
