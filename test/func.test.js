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

test("function return multiple values", () => {
  const result = run(`
    func add(a, b) {
      return a + b, a, b;
    }
    add(1, 2)
  `);
  deepEqual(result, [3, 1, 2]);
});

test("function arguments object", () => {
  const result = run(`
    func args(name, name1) {
      return arguments;
    }
    [args("SempaiJS", "Sempa1JS"), args("SempaiJS")]
  `);
  deepEqual(result, [["SempaiJS", "Sempa1JS"], ["SempaiJS"]]);
});

test("function default arguments", () => {
  const result = run(`
    func defaults(count = 1000) {
      return count;
    }
    [defaults(), defaults(nil), defaults(1)]
  `);
  deepEqual(result, [1000, 1000, 1]);
});

test("function default nil argument", () => {
  const result = run(`
    func defaultNil(name) {
      return name;
    }
    [defaultNil("name"), defaultNil()]
  `);
  deepEqual(result, ["name", null]);
});

test("function inside object", () => {
  const result = run(`
    var obj = {
      name: func() {
        return "name";
      },
      name1: func name1() {
        return "name1";
      }
    };
    [obj.name(), obj.name1()]
  `);
  deepEqual(result, ["name", "name1"]);
});

test("function variables", () => {
  const result = run(`
    var name = func() {
      return "name";
    };
    var name1 = func name1() {
      return "name1";
    };
    [name(), name1()]
  `);
  deepEqual(result, ["name", "name1"]);
});

test("function variables", () => {
  const result = run(`
    func rest(arg, ...args) {
      return arg, args;
    }
    rest(1, 2, 3, 4, 5, 6);
  `);
  deepEqual(result, [1, [2, 3, 4, 5, 6]]);
});

test("class with methods", () => {
  const result = run(`
    var MyClass = func(name) {
      var username = name;

      return {
        getName: func() {
          return username;
        },
        setName: func(name) {
          username = name;
          return username;
        }
      };
    };

    var Vova = MyClass("SempaiJS");
    
    [Vova.getName(), Vova.setName("Hello"), Vova.getName()]
  `);
  deepEqual(result, ["SempaiJS", "Hello", "Hello"]);
});
