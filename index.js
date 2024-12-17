const path = require("node:path");
const { Lexer, Parser, Interpreter } = require("./dist/index");

// const code = `
// import "events";
// import "coreio";
// import "./start.ml";
// import "ds";
// import "./package.json";
//
// var hash = ds.Bag();
//
// hash.add(1, "true");
//
// coreio.printf(import.cache == import.cache);
//
// coreio.printf(hash.values(), import.resolve("package.json"));
//
// var node = events.Emmiter();
//
// var assign = nil;
//
// coreio.printf(assign);
//
// assign = 12345;
//
// coreio.printf(assign);
//
// coreio.printf(package);
//
// package.devDependencies.names = "myLANG";
// package.name = "myLANG";
//
// coreio.printf(package);
//
// true && coreio.printf("Hello &{1}", (6 + 8));
//
// func Trigger(name) {
//   this.name = name;
//
//   func log(name) {
//     import "coreio"; // Облачная выдемость
//     coreio.printf(this.name + name);
//   }
// }
//
// var trigger = Trigger("SEMPAI");
//
// trigger.log("LOX");
//
// var king = "👑";
// var index = nil;
// {
//   king = "👑 2";
//   var index = 5; // Good...
//   coreio.printf(index); // 5
//   coreio.printf(king);
// }
// coreio.printf(index); // nil
// coreio.printf(king); // 👑 2
//
// var te = 5;
//
// {
//   var te = 6;
//   var started = func(text) {
//   start.fsk(text);
//   start.start(text);
//   coreio.printf(import("./start.ml"), start.g, coreio.printf());
//   }
//   coreio.printf(te);
// }
//   coreio.printf(te);
//
// node.on("start", started);
//
// node.off("start", started)
//
// node.emit("start", "Hello world 🗺");
// `;

const code = `
import "coreio";
import "dotenv";
dotenv.config(".env");

coreio.printf(process.env);
`;

const token = new Lexer(code).analyze();

if (token.errors.length > 0) {
  console.error(token.errors[0]);
  process.exit(1);
}

const parse = new Parser(token.tokens, code).parse();

// console.log(token, parse);

const { base } = path.parse(process.cwd());

new Interpreter(parse, [], {
  base: process.cwd(),
  main: path.join(process.cwd(), "./index.ml"),
  paths: [path.join(process.cwd(), "./start.ml")],
}).run();
