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

test("create array", () => {
  const result = run(`
    import "arrays";
    arrays.create(3, 5)
  `);
  deepEqual(result, [5, 5, 5]);
});

test("concat arrays", () => {
  const result = run(`
    import "arrays";
    arrays.concat([1, 2], [3, 4])
  `);
  deepEqual(result, [1, 2, 3, 4]);
});

test("copyWithin", () => {
  const result = run(`
    import "arrays";
    arrays.copyWithin([1, 2, 3, 4, 5], 0, 3)
  `);
  deepEqual(result, [4, 5, 3, 4, 5]);
});

test("every", () => {
  const result = run(`
    import "arrays";
    arrays.every([2, 4, 6], func (x) { return((x % 2) == 0); })
  `);
  deepEqual(result, true);
});

test("fill", () => {
  const result = run(`
    import "arrays";
    arrays.fill([1, 2, 3], 9, 1, 2)
  `);
  deepEqual(result, [1, 9, 3]);
});

test("filter", () => {
  const result = run(`
    import "arrays";
    arrays.filter([1, 2, 3, 4], func (x) { return((x % 2) == 0); })
  `);
  deepEqual(result, [2, 4]);
});

test("find", () => {
  const result = run(`
    import "arrays";
    arrays.find([1, 2, 3, 4], func (x) { return x > 2; })
  `);
  deepEqual(result, 3);
});

test("findIndex", () => {
  const result = run(`
    import "arrays";
    arrays.findIndex([1, 2, 3, 4], func (x) { return x > 2; })
  `);
  deepEqual(result, 2);
});

test("flat", () => {
  const result = run(`
    import "arrays";
    arrays.flat([[1, 2], [3, 4]])
  `);
  deepEqual(result, [1, 2, 3, 4]);
});

test("flatMap", () => {
  const result = run(`
    import "arrays";
    arrays.flatMap([1, 2, 3], func (x) { return [x, x * 2]; })
  `);
  deepEqual(result, [1, 2, 2, 4, 3, 6]);
});

test("forEach", () => {
  const result = run(`
    import "arrays";
    var sum = 0;
    arrays.forEach([1, 2, 3], func (x) { return sum += x; });
    sum
  `);
  deepEqual(result, 6);
});

test("includes", () => {
  const result = run(`
    import "arrays";
    arrays.includes([1, 2, 3], 2)
  `);
  deepEqual(result, true);
});

test("indexOf", () => {
  const result = run(`
    import "arrays";
    arrays.indexOf([1, 2, 3, 2], 2)
  `);
  deepEqual(result, 1);
});

test("join", () => {
  const result = run(`
    import "arrays";
    arrays.join(["a", "b", "c"], "-")
  `);
  deepEqual(result, "a-b-c");
});

test("lastIndexOf", () => {
  const result = run(`
    import "arrays";
    arrays.lastIndexOf([1, 2, 3, 2], 2)
  `);
  deepEqual(result, 3);
});

test("map", () => {
  const result = run(`
    import "arrays";
    arrays.map([1, 2, 3], func (x) { return x * 2; })
  `);
  deepEqual(result, [2, 4, 6]);
});

test("pop", () => {
  const result = run(`
    import "arrays";
    var arr = [1, 2, 3];
    arrays.pop(arr);
    arr
  `);
  deepEqual(result, [1, 2]);
});

test("push", () => {
  const result = run(`
    import "arrays";
    var arr = [1, 2];
    arrays.push(arr, 3);
    arr
  `);
  deepEqual(result, [1, 2, 3]);
});

test("reduce", () => {
  const result = run(`
    import "arrays";
    arrays.reduce([1, 2, 3], func (acc, x) { return acc + x; }, 0)
  `);
  deepEqual(result, 6);
});

test("reverse", () => {
  const result = run(`
    import "arrays";
    arrays.reverse([1, 2, 3])
  `);
  deepEqual(result, [3, 2, 1]);
});

test("shift", () => {
  const result = run(`
    import "arrays";
    var arr = [1, 2, 3];
    arrays.shift(arr);
    arr
  `);
  deepEqual(result, [2, 3]);
});

test("slice", () => {
  const result = run(`
    import "arrays";
    arrays.slice([1, 2, 3, 4], 1, 3)
  `);
  deepEqual(result, [2, 3]);
});

test("some", () => {
  const result = run(`
    import "arrays";
    arrays.some([1, 2, 3], func (x) { return x > 2; })
  `);
  deepEqual(result, true);
});

test("sort", () => {
  const result = run(`
    import "arrays";
    arrays.sort([3, 1, 2])
  `);
  deepEqual(result, [1, 2, 3]);
});

test("splice", () => {
  const result = run(`
    import "arrays";
    var arr = [1, 2, 3];
    arrays.splice(arr, 1, 1);
    arr
  `);
  deepEqual(result, [1, 3]);
});

test("unshift", () => {
  const result = run(`
    import "arrays";
    var arr = [2, 3];
    arrays.unshift(arr, 1);
    arr
  `);
  deepEqual(result, [1, 2, 3]);
});

test("count", () => {
  const result = run(`
    import "arrays";
    arrays.count([1, 2, 3])
  `);
  deepEqual(result, 3);
});
