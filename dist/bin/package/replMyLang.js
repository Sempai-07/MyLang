"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replMyLang = replMyLang;
const tslib_1 = require("tslib");
const node_path_1 = tslib_1.__importDefault(require("node:path"));
const node_readline_1 = tslib_1.__importDefault(require("node:readline"));
const Environment_1 = require("../../src/Environment");
const index_1 = require("../../src/index");
function replMyLang() {
    let callEnvironment = null;
    console.log("Welcome to the MyLang REPL!");
    console.log('Type ".help" for available commands or ".exit" to quit.');
    const rl = node_readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: "> ",
    });
    rl.prompt();
    rl.on("line", (line) => {
        const input = line.trim();
        if (input === ".help") {
            console.log("Available commands:");
            console.log("  .help       Show this help message");
            console.log("  .exit       Exit the REPL");
            return;
        }
        else if (input === ".exit") {
            console.log("Goodbye!");
            rl.close();
            return;
        }
        try {
            const token = new index_1.Lexer(line).analyze();
            if (token.errors.length > 0) {
                console.error(`${token.errors[0].code}: ${token.errors[0].message}`);
                return;
            }
            try {
                const parse = new index_1.Parser(token.tokens).parse();
                const interpreter = new index_1.Interpreter(parse, [], {
                    base: process.cwd(),
                    main: node_path_1.default.join(process.cwd(), "./repl.ml"),
                    options: {},
                });
                if (callEnvironment) {
                    interpreter.globalScore = callEnvironment;
                }
                const result = interpreter.run();
                console.log(result === undefined || result === null ? "nil" : result);
                callEnvironment = new Environment_1.Environment(interpreter.globalScore);
                return interpreter;
            }
            catch (err) {
                console.error(`${err}`);
                return;
            }
        }
        catch (err) {
            console.error(`BaseError: ${err}`);
        }
        return;
    });
    rl.on("close", () => {
        console.log("REPL session ended.");
        process.exit(0);
    });
}
