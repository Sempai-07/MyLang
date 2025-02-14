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

test("join paths", () => {
  const result = run(`
    import "path";
    path.join("dir", "subdir", "file.txt")
  `);
  deepEqual(result, path.join("dir", "subdir", "file.txt"));
});

test("basename without extension", () => {
  const result = run(`
    import "path";
    path.basename("/dir/subdir/file.txt")
  `);
  deepEqual(result, path.basename("/dir/subdir/file.txt"));
});

test("basename with extension", () => {
  const result = run(`
    import "path";
    path.basename("/dir/subdir/file.txt", ".txt")
  `);
  deepEqual(result, path.basename("/dir/subdir/file.txt", ".txt"));
});

test("extname", () => {
  const result = run(`
    import "path";
    path.extname("/dir/subdir/file.txt")
  `);
  deepEqual(result, path.extname("/dir/subdir/file.txt"));
});

test("dirname", () => {
  const result = run(`
    import "path";
    path.dirname("/dir/subdir/file.txt")
  `);
  deepEqual(result, path.dirname("/dir/subdir/file.txt"));
});

test("normalize", () => {
  const result = run(`
    import "path";
    path.normalize("/dir/../subdir/file.txt")
  `);
  deepEqual(result, path.normalize("/dir/../subdir/file.txt"));
});

test("resolve", () => {
  const result = run(`
    import "path";
    path.resolve("./file.txt")
  `);
  deepEqual(result, path.resolve("./file.txt"));
});

test("parse", () => {
  const result = run(`
    import "path";
    path.parse("/dir/subdir/file.txt")
  `);
  deepEqual(result, path.parse("/dir/subdir/file.txt"));
});

test("format", () => {
  const result = run(`
    import "path";
    path.format({ dir: "/dir/subdir", base: "file.txt" })
  `);
  deepEqual(result, path.format({ dir: "/dir/subdir", base: "file.txt" }));
});

test("isAbsolute true", () => {
  const result = run(`
    import "path";
    path.isAbsolute("/dir/subdir/file.txt")
  `);
  deepEqual(result, path.isAbsolute("/dir/subdir/file.txt"));
});

test("isAbsolute false", () => {
  const result = run(`
    import "path";
    path.isAbsolute("./file.txt")
  `);
  deepEqual(result, path.isAbsolute("./file.txt"));
});

test("relative", () => {
  const result = run(`
    import "path";
    path.relative("/dir/subdir", "/dir/file.txt")
  `);
  deepEqual(result, path.relative("/dir/subdir", "/dir/file.txt"));
});
