"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
const BaseError_1 = require("../errors/BaseError");
const index_1 = require("../index");
function run(code, options) {
    const token = new index_1.Lexer(code).analyze();
    if (token.errors.length > 0) {
        throw new BaseError_1.BaseError(token.errors[0].description, {
            files: options.paths,
            code: token.errors[0].code,
        });
    }
    try {
        const parse = new index_1.Parser(token.tokens).parse();
        const interpreter = new index_1.Interpreter(parse, [], {
            base: options.base,
            main: options.main,
            options: options || {},
        });
        const result = interpreter.run();
        return { result, interpreter };
    }
    catch (err) {
        if (err instanceof BaseError_1.BaseError) {
            throw err;
        }
        throw new BaseError_1.BaseError(`${err}`, {
            files: options.paths || [options.main],
        });
    }
}
