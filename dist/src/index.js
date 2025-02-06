"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interpreter = exports.Parser = void 0;
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./lexer/index"), exports);
var Parser_1 = require("./ast/Parser");
Object.defineProperty(exports, "Parser", { enumerable: true, get: function () { return Parser_1.Parser; } });
var Interpreter_1 = require("./Interpreter");
Object.defineProperty(exports, "Interpreter", { enumerable: true, get: function () { return Interpreter_1.Interpreter; } });
