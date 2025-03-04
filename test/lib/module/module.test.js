const path = require("node:path");
const { test } = require("node:test");
const { deepEqual, throws } = require("node:assert");
const runFile = require("../../../dist/src/utils/utils").run;

function run(code) {
  return runFile(code, {
    base: __dirname,
    main: path.join(__dirname, "/test.ml"),
  }).result;
}

test("import build-in module", () => {
  const result = run(`
    import "module";
    module.isBuildInModule("os")
  `);
  deepEqual(result, true);
});

test("import non-existing build-in module", () => {
  const result = run(`
    import "module";
    module.isBuildInModule("non_existing")
  `);
  deepEqual(result, false);
});

test("load JSON module", () => {
  const result = run(`
    import "module";
    module.loadJSONModule("./test.json")
  `);
  deepEqual(result, require("./test.json"));
});

test("load JSON module (not added score)", () => {
  throws(() => {
    run(`
    import "module";
    module.loadJSONModule("./test.json");
    test;
  `);
  });
});

test("load JSON module (added score)", () => {
  const result = run(`
    import "module";
    module.loadJSONModule("./test.json", "testPkg");
    testPkg
  `);
  deepEqual(result, require("./test.json"));
});

// test("load HTTP module", () => {
//   const result = run(`
//     import "module";
//     module.loadHTTPModule("http://localhost:3000/index")
//   `);
//   deepEqual(result, { obj: { key: "name" } });
// });

test("load build-in module", () => {
  const result = run(`
    import "module";
    module.loadBuildInModule("os")
  `);
  deepEqual(result, require("../../../dist/src/native/lib/os"));
});

test("load build-in module (not added score)", () => {
  throws(() => {
    run(`
    import "module";
    module.loadBuildInModule("os")
    os
  `);
  });
});

test("load build-in module (added score)", () => {
  const result = run(`
    import "module";
    module.loadBuildInModule("os", "testModule");
    testModule
  `);
  deepEqual(result, require("../../../dist/src/native/lib/os"));
});

test("load file module", () => {
  const result = run(`
    import "module";
    module.loadFileModule("./testModule.ml")
  `);
  deepEqual(result, { obj: { key: "name" } });
});

test("load file module (not added score)", () => {
  throws(() => {
    run(`
    import "module";
    module.loadFileModule("./testModule.ml")
    testModule
  `);
  });
});

test("load file module (added score)", () => {
  const result = run(`
    import "module";
    module.loadFileModule("./testModule.ml", "testModuleName")
    testModuleName
  `);
  deepEqual(result, { obj: { key: "name" } });
});

test("load package module", () => {
  const result = run(`
    import "module";
    module.loadPackageModule("Sempai-07:test")
  `);
  deepEqual(result, { obj: { key: "name" } });
});

test("load package module (not added score)", () => {
  throws(() => {
    run(`
    import "module";
    module.loadPackageModule("Sempai-07:test")
    test
  `);
  });
});

test("load package module (added score)", () => {
  const result = run(`
    import "module";
    module.loadPackageModule("Sempai-07:test", "testPkg")
    testPkg
  `);
  deepEqual(result, { obj: { key: "name" } });
});
