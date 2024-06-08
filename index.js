const { Lexer } = require("./src/Lexer");
const { Parser } = require("./src/Parser");
const { Interpreter } = require("./src/Interpreter");
const { readFileSync } = require("node:fs");

const lexer = new Lexer(readFileSync("./index.c").toString());
const analysis = lexer.lexAnalysis();
const parser = new Parser(analysis);
const interpreter = new Interpreter(parser.parse());
interpreter.interpret();
