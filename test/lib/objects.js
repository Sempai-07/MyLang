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

test("assign function", () => {
  const result = run(`
    import "objects";
    var target = { a: 1 };
    var source = { b: 2 };
    objects.assign(target, source);
  `);
  deepEqual(result, { a: 1, b: 2 });
});

test("create function", () => {
  const result = run(`
    import "objects";
    var prototype = { a: 1 };
    var result = objects.create(prototype);
    result.a
  `);
  deepEqual(result, 1);
});

test("defineProperty function", () => {
  const result = run(`
    import "objects";
    var obj = {};
    objects.defineProperty(obj, "a", { value: 1 });
    obj.a
  `);
  deepEqual(result, 1);
});

test("defineProperties function", () => {
  const result = run(`
    import "objects";
    var obj = {};
    objects.defineProperties(obj, { a: { value: 1 }, b: { value: 2 } });
    [obj.a, obj.b];
  `);
  deepEqual(result, [1, 2]);
});

test("entries function", () => {
  const result = run(`
    import "objects";
    var obj = { a: 1, b: 2 };
    objects.entries(obj);
  `);
  deepEqual(result, [
    ["a", 1],
    ["b", 2],
  ]);
});

test("fromEntries function", () => {
  const result = run(`
    import "objects";
    var entries = [["a", 1], ["b", 2]];
    objects.fromEntries(entries);
  `);
  deepEqual(result, { a: 1, b: 2 });
});

test("getOwnPropertyNames function", () => {
  const result = run(`
    import "objects";
    var obj = { a: 1, b: 2 };
    objects.getOwnPropertyNames(obj);

  `);
  deepEqual(result, ["a", "b"]);
});

test("is function", () => {
  const result = run(`
    import "objects";
    objects.is(1, 1);
  `);
  deepEqual(result, true);
});

test("keys function", () => {
  const result = run(`
    import "objects";
    var obj = { a: 1, b: 2 };
    objects.keys(obj);
  `);
  deepEqual(result, ["a", "b"]);
});

test("setPrototypeOf function", () => {
  const result = run(`
    import "objects";
    var obj = {};
    var prototype = { a: 1 };
    var result = objects.setPrototypeOf(obj, prototype);
    result.a
  `);
  deepEqual(result, 1);
});

test("values function", () => {
  const result = run(`
    import "objects";
    var obj = { a: 1, b: 2 };
    objects.values(obj);
  `);
  deepEqual(result, [1, 2]);
});

test("pick function", () => {
  const result = run(`
    import "objects";
    
    var obj = { key1: 1, key2: 2 };
    
    var newObjFunc = objects.pick(obj, func(value, key) {
      if (key == "key2") {
        return false;
      }
      return true;
    });
    
    var newObjArr = objects.pick(obj, ["key1"]);
    
    [newObjFunc, newObjArr];
  `);
  deepEqual(result, [{ key1: 1 }, { key1: 1 }]);
});

test("omit function", () => {
  const result = run(`
    import "objects";
    
    var obj = { key1: 1, key2: 2 };
    
    var newObjFunc = objects.omit(obj, func(value, key) {
      if (key == "key2") {
        return false;
      }
      return true;
    });
    
    var newObjArr = objects.omit(obj, ["key1"]);
    
    [newObjFunc, newObjArr];
  `);
  deepEqual(result, [{ key2: 2 }, { key2: 2 }]);
});

test("clone function", () => {
  const result = run(`
   import "coreio";
   import "objects";
   
   var a = {
     key1: 1,
     key2: { 
       key3: 2,
     }
   };
   var b = objects.clone(a);
   
   a.key1 = 2;
   a.key2.key3 = 1;
   
   [a, b]
  `);
  deepEqual(result, [
    { key1: 2, key2: { key3: 1 } },
    { key1: 1, key2: { key3: 2 } },
  ]);
});
