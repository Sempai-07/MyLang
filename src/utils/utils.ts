import { BaseError } from "../errors/BaseError";
import { Lexer, Parser, Interpreter } from "../index";

function run(
  code: string,
  options: {
    main: string;
    base: string;
    paths?: string[];
    cache?: Record<string, any>;
    options?: Record<string, any>;
  },
): Interpreter {
  const token = new Lexer(code).analyze();

  if (token.errors.length > 0) {
    console.log(`${token.errors[0]!.code}: ${token.errors[0]!.description}`);
    console.log();
    console.log(` - ${options.main}`);
    console.log(
      options.paths
        ? options.paths.map((value) => ` - ${value}`).join("\n")
        : "",
    );
    process.exit(0);
  }

  try {
    const parse = new Parser(token.tokens).parse();

    const interpreter = new Interpreter(parse, [], {
      base: options.base,
      main: options.main,
      options: options || {},
    });

    interpreter.run();

    return interpreter;
  } catch (err) {
    if (err instanceof BaseError) {
      console.error(err.toString());
      process.exit(0);
    }

    console.log(err);
    console.log();
    console.log(` - ${options.main}`);
    console.log(
      options.paths
        ? options.paths.map((value) => ` - ${value}`).join("\n") + "\n"
        : "",
    );
    process.exit(0);
  }
}

export { run };
