import { BaseError } from "../errors/BaseError";
import { SyntaxError } from "../errors/SyntaxError";
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
): { result: any; interpreter: Interpreter } {
  const token = new Lexer(code).analyze();

  if (token.errors.length > 0) {
    throw new BaseError(token.errors[0]!.message, {
      files: options.paths!,
      ...(token.errors[0]!.code && { code: token.errors[0]!.code }),
    });
  }

  try {
    const parse = new Parser(token.tokens).parse();

    const interpreter = new Interpreter(parse, [], {
      base: options.base,
      main: options.main,
      options: options || {},
    });

    const result = interpreter.run();

    return { result, interpreter };
  } catch (err) {
    if (err instanceof BaseError) {
      if (err instanceof SyntaxError) {
        err.files = options.paths || [options.main];
      }
      throw err;
    }

    throw new BaseError(`${err}`, {
      files: options.paths || [options.main],
    });
  }
}

export { run };
