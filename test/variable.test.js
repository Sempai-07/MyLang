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

test("init variable", () => {
  const result = run(`
    var n1;
    n1
  `);
  deepEqual(result, null);
});

test("variable assignment", () => {
  const result = run(`
    var n1;
    var n2 = nil;
    
    [n1, n2]
  `);
  deepEqual(result, [null, null]);
});

test("arithmetic operations", () => {
  const result = run(`
    var n1 = 1;
    var n2 = 2;

    n1 -= 1;
    n2 += 2;

    [n1, n2]
  `);
  deepEqual(result, [0, 4]);
});

test("increment operations", () => {
  const result = run(`
    var n1 = 0;
    var n2 = 4;

    n1++;
    n2++;

    [n1, n2]
  `);
  deepEqual(result, [1, 5]);
});

test("object assignment", () => {
  const result = run(`
    var n1 = {};
    var n2 = {};

    [n1, n2]
  `);
  deepEqual(result, [{}, {}]);
});

test("object property assignment", () => {
  const result = run(`
    var n1 = {};
    var n2 = {};

    n1["n1"] = 1;
    n2["n2"] = [1, 2];

    [n1, n2]
  `);
  deepEqual(result, [{ n1: 1 }, { n2: [1, 2] }]);
});

test("nested array assignment", () => {
  const result = run(`
    var n2 = { n2: [1, 2] };

    n2["n2"][2] = [1, 2];

    n2
  `);
  deepEqual(result, { n2: [1, 2, [1, 2]] });
});

test("constant assignment error", () => {
  throws(() =>
    run(`
    var constant = 10 as const;
    constant = 5;
  `),
  );
});

test("readonly array mutation", () => {
  const result = run(`
    var arr = [] as const;
    arr[0] = 100;

    arr
  `);
  deepEqual(result, [100]);
});

test("readonly array re-assignment error", () => {
  throws(() =>
    run(`
    var arr1 = [1, 2, 3] as readonly;
    arr1 = {};
  `),
  );
});

test("readonly array modification error", () => {
  throws(() =>
    run(`
    var arr1 = [1, 2, 3] as readonly;
    arr1[0] = 0;
  `),
  );
});

test("constant heir assignment", () => {
  const result = run(`
    var constant = 10 as const;
    var constant2 = constant;
    constant2 = 5;
    constant2
  `);
  deepEqual(result, 5);
});

test("readonly heir assignment error", () => {
  throws(() =>
    run(`
    var arr1 = [1, 2, 3] as readonly;
    var arr2 = arr1;
    var arr3 = arr2;
    arr3[0] = 0;
  `),
  );
});

test("readonly heir assignment variable error", () => {
  throws(() =>
    run(`
    var arr1 = [1, 2, 3] as readonly;
    var arr2;
    arr2 = arr1;
    var arr3 = arr2;
    arr3[0] = 0;
  `),
  );
});

test("readonly heir assignment variable cancellations", () => {
  const result = run(`
    var arr1 = [1, 2, 3] as readonly;
    var arr2 = arr1;
    arr2 = [];
    var arr3 = arr2;
    arr3[0] = 0;
    [arr1, arr2, arr3]
  `);
  deepEqual(result, [[1, 2, 3], [0], [0]]);
});

test("readonly assignment variable function parameters", () => {
  throws(() =>
    run(`
    var arr1 = [1, 2, 3] as readonly;
    var arr2;
    arr2 = arr1;
    
    func setObj(arr) {
      arr[0] = 1;
    }
    
    setObj(arr);
  `),
  );
});

test("readonly assignment variable function rest parameters", () => {
  const result = run(`
    var arr1 = [1, 2, 3] as readonly;
    var arr2;
    arr2 = arr1;
    
    func setObj(...arr) {
      arr[0][0] = 6;
    }
    
    setObj(arr1);
    
    [arr1, arr2];
  `);
  deepEqual(result, [
    [6, 2, 3],
    [6, 2, 3],
  ]);
});

test("readonly assignment variable function arguments", () => {
  const result = run(`
    var arr1 = [1, 2, 3] as readonly;
    var arr2;
    arr2 = arr1;
    
    func setObj(...arr) {
      arguments[0][0] = 6;
    }
    
    setObj(arr1);
    
    [arr1, arr2];
  `);
  deepEqual(result, [
    [6, 2, 3],
    [6, 2, 3],
  ]);
});
