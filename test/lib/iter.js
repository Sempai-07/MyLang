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

test("Iterator on array", () => {
  const result = run(`
    import "coreio";
    import "iter";
    import "arrays";
    
    var output = [];
    for (var i in iter.Iterator([0, 1, 2])) {
      arrays.push(output, i);
    }
    
    output
  `);
  deepEqual(result, [0, 1, 2]);
});

test("Iterator on object", () => {
  const result = run(`
    import "coreio";
    import "iter";
    import "arrays";
    
    var output = [];
    for (var key in iter.Iterator({ key1: 1, key2: 2, key3: 3 })) {
      arrays.push(output, key.key);
    }
    
    output
  `);
  deepEqual(result, ["key1", "key2", "key3"]);
});

test("Custom iterator in object", () => {
  const result = run(`
    import "coreio";
    import "iter";
    import "arrays";
    
    var obj = {
      key1: 100,
      key2: 200,
      key3: 300,
      [iter.symbol]: func(obj) {
        return iter.Iterator(this);
      }
    };

    var output = [];
    for (var key in obj) {
      arrays.push(output, key.key);
    }
    
    output
  `);
  deepEqual(result, ["key1", "key2", "key3"]);
});

test("Custom iterator in array", () => {
  const result = run(`
    import "coreio";
    import "iter";
    import "arrays";

    var arr = [0, 1, 2];

    arr[iter.symbol] = func(arr) {
      return iter.Iterator(this);
    };

    var output = [];
    for (var i in arr) {
      arrays.push(output, i);
    }
    
    output
  `);
  deepEqual(result, [0, 1, 2]);
});
