import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import readline from "node:readline";
import { inspect } from "node:util";
import { formattersText } from "../../library/coreio/formatters";
import { Environment } from "../../src/Environment";
import { Lexer, Parser, Interpreter } from "../../src/index";

const useColor = !process.env.NO_COLOR;
const paint = (code: number) => (text: string) => (useColor ? `\x1b[${code}m${text}\x1b[0m` : text);
const cyan = paint(36);
const green = paint(32);
const yellow = paint(33);
const red = paint(31);
const dim = paint(90);

const PROMPT = cyan("> ");
const CONTINUATION_PROMPT = dim("... ");

const KEYWORDS: string[] = [];
const LINE_COMMENT = "//";

const HISTORY_FILE = process.env.MYLANG_HISTORY ?? path.join(os.homedir(), ".mylang_history");
const HISTORY_SIZE = 1000;

const HELP: [string, string][] = [
  [".help", "Show this help message"],
  [".exit", "Exit the REPL (or press Ctrl+D)"],
  [".clear", "Clear the screen"],
  [".reset", "Forget all variables and start with a clean environment"],
  [".load <file>", "Run a file inside the current session"],
  [".save <file>", "Save successful inputs of this session to a file"],
  [".history", "Show inputs of this session"],
  [".tokens <code>", "Print the token stream of the code"],
  [".ast <code>", "Print the AST of the code"],
  [".time", "Toggle execution time display"],
];

const COMMANDS = HELP.map(([cmd]) => cmd.split(" ")[0]!);

type EvalResult = { ok: true; value: unknown } | { ok: false; error: string };

function bracketDepth(code: string): number {
  let depth = 0;
  let quote: string | null = null;

  for (let i = 0; i < code.length; i++) {
    const ch = code[i]!;

    if (quote) {
      if (ch === "\\") i++;
      else if (ch === quote) quote = null;
      else if (ch === "\n" && quote !== "`") quote = null;
      continue;
    }

    if (LINE_COMMENT && code.startsWith(LINE_COMMENT, i)) {
      const newline = code.indexOf("\n", i);
      if (newline === -1) break;
      i = newline;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") quote = ch;
    else if ("([{".includes(ch)) depth++;
    else if (")]}".includes(ch)) depth--;
  }

  return Math.max(depth, 0);
}

function completeFile(partial: string): string[] {
  const lastSep = Math.max(partial.lastIndexOf("/"), partial.lastIndexOf("\\"));
  const dirPart = lastSep >= 0 ? partial.slice(0, lastSep + 1) : "";
  const prefix = partial.slice(lastSep + 1);
  try {
    return fs
      .readdirSync(dirPart || ".", { withFileTypes: true })
      .filter((entry) => entry.name.startsWith(prefix))
      .map((entry) => dirPart + entry.name + (entry.isDirectory() ? "/" : ""));
  } catch {
    return [];
  }
}

function completer(line: string): [string[], string] {
  const fileCommand = line.match(/^\.(?:load|save)\s+(.*)$/);
  if (fileCommand) {
    const partial = fileCommand[1]!;
    return [completeFile(partial), partial];
  }

  if (line.startsWith(".") && !line.includes(" ")) {
    return [COMMANDS.filter((cmd) => cmd.startsWith(line)), line];
  }

  const word = line.match(/[\w$]+$/)?.[0] ?? "";
  if (!word) return [[], line];
  return [KEYWORDS.filter((kw) => kw.startsWith(word)), word];
}

function loadHistory(): string[] {
  if (!HISTORY_FILE) return [];
  try {
    return fs
      .readFileSync(HISTORY_FILE, "utf8")
      .split(/\r?\n/)
      .filter(Boolean)
      .reverse()
      .slice(0, HISTORY_SIZE);
  } catch {
    return [];
  }
}

function saveHistory(entries: string[]) {
  if (!HISTORY_FILE || !entries.length) return;

  try {
    fs.writeFileSync(HISTORY_FILE, [...entries].reverse().join("\n") + "\n");
  } catch {
    return;
  }
}

function replMyLang(mylangVersion = ""): Promise<void> {
  let callEnvironment: null | Environment = null;
  let buffer: string[] = [];
  const session: string[] = [];
  let showTime = false;
  let sigintOnce = false;
  let closed = false;

  async function evaluate(
    code: string,
    mainFile = path.join(process.cwd(), "repl.ml"),
  ): Promise<EvalResult> {
    let stage: "lex" | "run" = "lex";

    try {
      const lexed = new Lexer(code).analyze();

      if (lexed.errors.length > 0) {
        const first = lexed.errors[0]!;
        return { ok: false, error: `${first.code}: ${first.message}` };
      }

      stage = "run";
      const parse = new Parser(lexed.tokens).parse();

      const interpreter = new Interpreter(parse, [], {
        base: path.dirname(mainFile),
        main: mainFile,
        options: {},
      });

      if (callEnvironment) {
        // @ts-expect-error
        interpreter.globalScore = callEnvironment;
      }

      const value = await interpreter.run();
      callEnvironment = new Environment(interpreter.globalScore);

      return { ok: true, value };
    } catch (err) {
      return { ok: false, error: stage === "lex" ? `BaseError: ${err}` : `${err}` };
    }
  }

  async function runCode(code: string) {
    const start = performance.now();
    const result = await evaluate(code);
    const elapsed = performance.now() - start;

    if (result.ok) {
      session.push(code);
      console.log(...formattersText([result.value]));
    } else {
      console.error(red(result.error));
    }

    if (showTime) console.log(dim(`⏱ ${elapsed.toFixed(2)} ms`));
  }

  function printHelp() {
    const width = Math.max(...HELP.map(([cmd]) => cmd.length));
    console.log(cyan("Available commands:"));
    for (const [cmd, description] of HELP) {
      console.log(`  ${cyan(cmd.padEnd(width))}  ${description}`);
    }
    console.log(dim("\nUnclosed (, [ or { continue on the next line. Ctrl+C cancels the input."));
  }

  async function handleCommand(input: string) {
    const command = input.split(/\s+/)[0]!;
    const arg = input.slice(command.length).trim();

    switch (command) {
      case ".help":
        printHelp();
        break;

      case ".exit":
        rl.close();
        break;

      case ".clear":
        console.clear();
        break;

      case ".reset":
        callEnvironment = null;
        console.log(green("✓ Environment reset."));
        break;

      case ".time":
        showTime = !showTime;
        console.log(dim(`Execution time display: ${showTime ? "on" : "off"}`));
        break;

      case ".history":
        if (!session.length) {
          console.log(dim("No inputs yet."));
          break;
        }
        session.forEach((code, i) => {
          const [first, ...rest] = code.split("\n");
          console.log(
            `  ${dim(String(i + 1).padStart(3))}  ${first}${rest.length ? dim(" ...") : ""}`,
          );
        });
        break;

      case ".load": {
        if (!arg) {
          console.log(yellow("Usage: .load <file>"));
          break;
        }
        const file = path.resolve(arg);
        let source: string;
        try {
          source = fs.readFileSync(file, "utf8");
        } catch (err) {
          console.error(red(`Cannot read "${arg}": ${err instanceof Error ? err.message : err}`));
          break;
        }
        const result = await evaluate(source, file);
        if (result.ok) {
          console.log(green(`✓ Loaded ${arg}`));
        } else {
          console.error(red(result.error));
        }
        break;
      }

      case ".save": {
        if (!arg) {
          console.log(yellow("Usage: .save <file>"));
          break;
        }
        if (!session.length) {
          console.log(dim("Nothing to save yet."));
          break;
        }
        try {
          fs.writeFileSync(path.resolve(arg), session.join("\n") + "\n");
          console.log(green(`✓ Saved ${session.length} input(s) to ${arg}`));
        } catch (err) {
          console.error(red(`Cannot write "${arg}": ${err instanceof Error ? err.message : err}`));
        }
        break;
      }

      case ".tokens":
      case ".ast": {
        if (!arg) {
          console.log(yellow(`Usage: ${command} <code>`));
          break;
        }
        try {
          const lexed = new Lexer(arg).analyze();
          if (lexed.errors.length > 0) {
            const first = lexed.errors[0]!;
            console.error(red(`${first.code}: ${first.message}`));
            break;
          }
          const output = command === ".tokens" ? lexed.tokens : new Parser(lexed.tokens).parse();
          console.log(
            inspect(output, {
              colors: useColor,
              depth: command === ".tokens" ? 3 : null,
              maxArrayLength: null,
            }),
          );
        } catch (err) {
          console.error(red(`${err}`));
        }
        break;
      }

      default:
        console.log(yellow(`Unknown command "${command}". Type .help for the list.`));
    }
  }

  console.log(
    `${cyan("MyLang")}${mylangVersion ? ` v${mylangVersion}` : ""} ${dim(`REPL (Node ${process.version})`)}`,
  );
  console.log(dim('Type ".help" for commands, ".exit" or Ctrl+D to quit.'));

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: PROMPT,
    completer,
    history: loadHistory(),
    historySize: HISTORY_SIZE,
  });

  rl.prompt();

  rl.on("line", async (line) => {
    sigintOnce = false;
    const trimmed = line.trim();

    if (!buffer.length) {
      if (!trimmed) {
        rl.prompt();
        return;
      }
      if (/^\.[a-z]+/i.test(trimmed)) {
        await handleCommand(trimmed);
        if (!closed) {
          rl.setPrompt(PROMPT);
          rl.prompt();
        }
        return;
      }
    }

    buffer.push(line);
    const code = buffer.join("\n");
    const depth = bracketDepth(code);

    if (depth > 0) {
      rl.setPrompt(CONTINUATION_PROMPT);
      rl.prompt();
      rl.write("  ".repeat(depth));
      return;
    }

    buffer = [];
    await runCode(code);
    rl.setPrompt(PROMPT);
    rl.prompt();
  });

  rl.on("SIGINT", () => {
    if (buffer.length) {
      buffer = [];
      console.log(dim("\n(input cancelled)"));
      rl.setPrompt(PROMPT);
    } else if (sigintOnce) {
      rl.close();
      return;
    } else {
      sigintOnce = true;
      console.log(yellow("\n(To exit, press Ctrl+C again, Ctrl+D, or type .exit)"));
    }
    rl.prompt();
  });

  return new Promise<void>((resolve) => {
    rl.on("close", () => {
      closed = true;
      saveHistory(((rl as any).history as string[] | undefined) ?? []);
      console.log(dim("\nGoodbye!"));
      resolve();
    });
  });
}

export { replMyLang };
