import { Lexer } from "./lexer/Lexer";
import { Token } from "./lexer/Token";
import { Parser } from "./Parser";
import type { StmtType } from "./ast/StmtType";

function run(
  code: string,
  paths: string[] = [],
): {
  tokens: Token[];
  ast: StmtType[];
} {
  const lexer = new Lexer(code, paths).analyze();

  if (lexer.errors.length > 0) {
    console.log(lexer.errors.shift()!.genereteMessage(paths));
    process.exit();
  }

  const parser = new Parser(lexer.tokens, paths).parse();

  return {
    tokens: lexer.tokens,
    ast: parser,
  };
}

function formatMessage(message: string, params?: Record<string, any>): string {
  if (!params) return message;
  return message.replace(/\${(.*?)}/g, (_, key) => {
    return key in params ? String(params[key]) : `{${key}}`;
  });
}

export { run, formatMessage };
