import path from "node:path";
import readline from "node:readline";
import { Environment } from "../../src/Environment";
import { Lexer, Parser, Interpreter } from "../../src/index";

function replMyLang() {
  let callEnvironment: null | Environment = null;

  console.log("Welcome to the MyLang REPL!");
  console.log('Type ".help" for available commands or ".exit" to quit.');

  const rl = readline.createInterface({
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
    } else if (input === ".exit") {
      console.log("Goodbye!");
      rl.close();
      return;
    }

    try {
      const token = new Lexer(line).analyze();

      if (token.errors.length > 0) {
        console.error(`${token.errors[0]!.code}: ${token.errors[0]!.message}`);
        return;
      }

      try {
        const parse = new Parser(token.tokens).parse();

        const interpreter = new Interpreter(parse, [], {
          base: process.cwd(),
          main: path.join(process.cwd(), "./repl.ml"),
          options: {},
        });

        if (callEnvironment) {
          // @ts-expect-error
          interpreter.globalScore = callEnvironment;
        }

        const result = interpreter.run();
        console.log(result === undefined || result === null ? "nil" : result);

        callEnvironment = new Environment(interpreter.globalScore);

        return interpreter;
      } catch (err) {
        console.error(`${err}`);
        return;
      }
    } catch (err) {
      console.error(`BaseError: ${err}`);
    }

    return;
  });

  rl.on("close", () => {
    console.log("REPL session ended.");
    process.exit(0);
  });
}

export { replMyLang };
