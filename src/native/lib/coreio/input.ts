import fs from "node:fs";
import process from "node:process";

const newLine = "\n".charCodeAt(0);
const carriageReturn = "\r".charCodeAt(0);

export function input([prompt]: [string?]): string {
  const fd: number =
    process.platform === "win32"
      ? process.stdin.fd
      : fs.openSync("/dev/stdin", "rs");

  let str = "";
  let character: number = 0;
  const buf = Buffer.alloc(1);

  if (prompt) {
    process.stdout.write(prompt);
  }

  while (true) {
    fs.readSync(fd, buf);
    character = buf[0]!;

    if (character === carriageReturn) {
      continue;
    }

    if (character === newLine) {
      fs.closeSync(fd);
      break;
    }

    str += String.fromCharCode(character);
  }

  return str;
}
