import { Lexer, Parser, Interpreter } from "../index";

function run(
  code: string,
  options: { main: string; base: string },
): Interpreter {
  const token = new Lexer(code).analyze();

  if (token.errors.length > 0) {
    console.error(token.errors[0]);
    process.exit(1);
  }

  const parse = new Parser(token.tokens).parse();

  // console.log(token, parse);

  const interpreter = new Interpreter(parse, [], {
    base: options.base,
    main: options.main,
  });

  interpreter.run();

  return interpreter;
}

export { run };
