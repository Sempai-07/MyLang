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

test("enum basic usage", () => {
  const result = run(`
    enum Status {
      Online = { value: 0, description: "Online status" };
      Offline = { value: 1, description: "Offline status user" };
    }
    [Status.Online, Status.Offline]
  `);
  deepEqual(result, [
    { value: 0, description: "Online status" },
    { value: 1, description: "Offline status user" },
  ]);
});

test("enum method getByName", () => {
  const result = run(`
    import "arrays";
    import "objects";

    enum Status {
      Online = { value: 0, description: "Online status" };
      Offline = { value: 1, description: "Offline status user" };

      func getByName(val) {
        var allStatus = objects.entries(this);
        for (var i = 0; i < arrays.count(allStatus) - 1; i++) {
          if (allStatus[i][0] == val) {
            return allStatus[i];
          }
        }
        return nil;
      };
    }
    [Status.getByName("Offline"), Status.getByName("Offlie"), Status.getByName("getByName")]
  `);
  deepEqual(result, [
    ["Offline", { value: 1, description: "Offline status user" }],
    null,
    null,
  ]);
});

test("enum with mixed values", () => {
  const result = run(`
    import "coreio";
    
    enum Action {
      SempaiJS = 7; 
      Angel = {};
      Mz = func main() {};
    }
    
    [Action.SempaiJS, Action.Angel]
  `);
  deepEqual(result, [7, {}]);
});

test("enum auto-incrementing numbers", () => {
  const result = run(`
    enum Number {
      One = 1;
      Two;
      Three;
    }
    [Number.One, Number.Two, Number.Three]
  `);
  deepEqual(result, [1, 2, 3]);
});

test("enum assignment error", () => {
  throws(() =>
    run(`
    enum Action {
      SempaiJS = 7;
    }
    Action = "SempaiLox";
  `),
  );
});
