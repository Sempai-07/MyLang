const fs = require("node:fs");
const { Lexer } = require("./src/Lexer");
const { Parser } = require("./src/Parser");
const { Interpreter } = require("./src/Interpreter");

const lexer = new Lexer(fs.readFileSync("./index.c").toString());
const analysis = lexer.lexAnalysis();
const parser = new Parser(analysis);
const interpreter = new Interpreter(parser.parse());
interpreter.interpret();
