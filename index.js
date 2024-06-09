const fs = require("node:fs");
const path = require("node:path");
const { Lexer } = require("./src/Lexer");
const { Parser } = require("./src/Parser");
const { Interpreter } = require("./src/Interpreter");

const lexer = new Lexer(fs.readFileSync("./test/index.c").toString());
const analysis = lexer.lexAnalysis();
const parser = new Parser(analysis);

const interpreter = new Interpreter(parser.parse(), {
  exports: fs
    .readdirSync(__dirname, {
      recursive: true,
    })
    .filter((path) => path.endsWith(".ml") || path.endsWith(".json")),
  main: "./test/index.c",
});

interpreter.interpret();
