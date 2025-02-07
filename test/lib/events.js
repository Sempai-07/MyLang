const { test } = require("node:test");
const path = require("node:path");
const { deepEqual, strictEqual } = require("node:assert");
const runFile = require("../../dist/src/utils/utils").run;

function run(code) {
  return runFile(code, {
    base: process.cwd(),
    main: path.join(process.cwd(), "/test.ml"),
  }).result;
}

test("Emmiter - on event", () => {
  const result = run(`
    import "events";
    var emitter = events.Emmiter() as const;
    var triggered = false;
    emitter.on("testEvent", func () {
      triggered = true;
    });
    emitter.emit("testEvent");
    [triggered]
  `);
  deepEqual(result, [true]);
});

test("Emmiter - once event", () => {
  const result = run(`
    import "events";
    var emitter = events.Emmiter() as const;
    var triggered = 0;
    emitter.once("testEvent", func () {
      triggered += 1;
    });
    emitter.emit("testEvent");
    emitter.emit("testEvent");
    [triggered]
  `);
  deepEqual(result, [1]);
});

test("Emmiter - off event", () => {
  const result = run(`
    import "events";
    var emitter = events.Emmiter() as const;
    var triggered = 0;
    var callback = func() {
      triggered += 1;
    };
    emitter.on("testEvent", callback);
    emitter.emit("testEvent");
    emitter.off("testEvent", callback);
    emitter.emit("testEvent");
    [triggered]
  `);
  deepEqual(result, [1]);
});

test("Emmiter - remove all listeners", () => {
  const result = run(`
    import "events";
    var emitter = events.Emmiter() as const;
    var triggered1 = false;
    var triggered2 = false;
    emitter.on("testEvent", func () {
      triggered1 = true;
    });
    emitter.on("testEvent", func () {
      triggered2 = true;
    });
    emitter.removeAllListeners("testEvent");
    emitter.emit("testEvent");
    [triggered1, triggered2]
  `);
  deepEqual(result, [false, false]);
});

test("Emmiter - listenerCount", () => {
  const result = run(`
    import "events";
    var emitter = events.Emmiter() as const;
    var countBefore;
    var countAfter;
    emitter.on("testEvent", func () {});
    countBefore = emitter.listenerCount("testEvent");
    emitter.removeAllListeners("testEvent");
    countAfter = emitter.listenerCount("testEvent");
    [countBefore, countAfter]
  `);
  deepEqual(result, [1, 0]);
});
