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
    throw new BaseError(token.errors[0]!.description, {
      files: options.paths!,
      code: token.errors[0]!.code,
    });
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
      throw err;
    }
    
    throw new BaseError(`${err}`, {
      files: options.paths!,
    });
  }
}

export { run };
