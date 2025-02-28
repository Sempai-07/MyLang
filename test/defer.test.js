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

test("score is not to be treated as const within the BlockStatement", () => {
  const result = run(`
    import "coreio";
    
    var isEmit;
    var isEmit2;
    
    func test() {
      coreio.print("Print 1", isEmit);
      
      defer {
        isEmit2 = isEmit;
        coreio.print("Print 2.1", isEmit);
        isEmit = true;
        coreio.print("Print 2.2", isEmit);
      }
      
      isEmit = false;
      
      coreio.print("Print 3", isEmit);
    }
    
    test();
    
    [isEmit, isEmit2]
  `);
  deepEqual(result, [true, false]);
});

test("score is treated as a constant outside of a BlockStatement", () => {
  const result = run(`
    import "coreio";
    
    var isEmit;
    
    func test2(emit) {
      isEmit = emit;
    }
    
    func test() {
      coreio.print("Print 1", isEmit);
      
      defer test2(isEmit);
      
      isEmit = false;
      
      coreio.print("Print 3", isEmit);
    }
    
    test();
    
    isEmit
  `);
  deepEqual(result, null);
});
