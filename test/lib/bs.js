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

test("Hash - set and get values", () => {
  const result = run(`
    import "ds";
    var hash = ds.Hash();
    hash.set("key1", "value1");
    hash.set("key2", 2);
    var value1 = hash.get("key1");
    var value2 = hash.get("key2");
    [value1, value2]
  `);
  deepEqual(result, ["value1", 2]);
});

test("Hash - check if key exists (has)", () => {
  const result = run(`
    import "ds";
    var hash = ds.Hash();
    hash.set("key1", "value1");
    hash.set("key2", "value2");
    var hasKey1 = hash.has("key1");
    var hasKey2 = hash.has("key2");
    var hasKey3 = hash.has("key3");
    [hasKey1, hasKey2, hasKey3]
  `);
  deepEqual(result, [true, true, false]);
});

test("Hash - delete key", () => {
  const result = run(`
    import "ds";
    var hash = ds.Hash();
    hash.set("key1", "value1");
    var deleted = hash.delete("key1");
    var hasKey = hash.has("key1");
    [deleted, hasKey]
  `);
  deepEqual(result, [true, false]);
});

test("Hash - clear all keys", () => {
  const result = run(`
    import "ds";
    var hash = ds.Hash();
    hash.set("key1", "value1");
    hash.set("key2", "value2");
    hash.clear();
    var size = hash.size();
    var hasKey1 = hash.has("key1");
    var hasKey2 = hash.has("key2");
    [size, hasKey1, hasKey2]
  `);
  deepEqual(result, [0, false, false]);
});

test("Hash - keys, values, entries", () => {
  const result = run(`
    import "ds";
    var hash = ds.Hash();
    hash.set("key1", "value1");
    hash.set("key2", "value2");
    var keys = hash.keys();
    var values = hash.values();
    var entries = hash.entries();
    [keys, values, entries]
  `);
  deepEqual(result, [["key1", "key2"], ["value1", "value2"], [["key1", "value1"], ["key2", "value2"]]]);
});

test("Hash - size of the map", () => {
  const result = run(`
    import "ds";
    var hash = ds.Hash();
    hash.set("key1", "value1");
    hash.set("key2", "value2");
    var sizeBefore = hash.size();
    hash.delete("key2");
    var sizeAfter = hash.size();
    [sizeBefore, sizeAfter]
  `);
  deepEqual(result, [2, 1]);
});

test("Bag - add and check if value exists", () => {
  const result = run(`
    import "ds";
    var bag = ds.Bag();
    bag.add(1);
    bag.add(2);
    var has1 = bag.has(1);
    var has2 = bag.has(2);
    var has3 = bag.has(3);
    [has1, has2, has3]
  `);
  deepEqual(result, [true, true, false]);
});

test("Bag - delete value", () => {
  const result = run(`
    import "ds";
    var bag = ds.Bag();
    bag.add(1);
    bag.add(2);
    var deleted = bag.delete(1);
    var has1 = bag.has(1);
    var has2 = bag.has(2);
    [deleted, has1, has2]
  `);
  deepEqual(result, [true, false, true]);
});

test("Bag - clear all values", () => {
  const result = run(`
    import "ds";
    var bag = ds.Bag();
    bag.add(1);
    bag.add(2);
    bag.clear();
    var size = bag.size();
    var has1 = bag.has(1);
    var has2 = bag.has(2);
    [size, has1, has2]
  `);
  deepEqual(result, [0, false, false]);
});

test("Bag - size of the set", () => {
  const result = run(`
    import "ds";
    var bag = ds.Bag();
    bag.add(1);
    bag.add(2);
    var sizeBefore = bag.size();
    bag.delete(1);
    var sizeAfter = bag.size();
    [sizeBefore, sizeAfter]
  `);
  deepEqual(result, [2, 1]);
});

test("Bag - values in the set", () => {
  const result = run(`
    import "ds";
    var bag = ds.Bag();
    bag.add(1);
    bag.add(2);
    var values = bag.values();
    [values]
  `);
  deepEqual(result, [ [1, 2] ]);
});

test("Bag - add same value multiple times", () => {
  const result = run(`
    import "ds";
    var bag = ds.Bag();
    bag.add(1);
    bag.add(1);
    var sizeAfter = bag.size();
    var valuesAfter = bag.values();
    [sizeAfter, valuesAfter]
  `);
  deepEqual(result, [1, [1]]);
});
