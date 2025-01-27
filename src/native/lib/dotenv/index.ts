import path from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { type Environment } from "../../../Environment";
import { ArgumentsError, FileReadFaild } from "../../../errors/BaseError";

// @ts-expect-error
function DotEnv(args: [], score: Environment) {
  const envMap = new Map();

  return {
    load([files]: [string | string[]]): void {
      if (typeof files === "string") {
        this._loadFile(files);
      } else if (Array.isArray(files)) {
        files.forEach((file) => this._loadFile(file));
      } else {
        throw new ArgumentsError(`Must be a string or array of strings.`, [
          `mylang:dotenv (${__filename})`,
        ]);
      }
    },

    _loadFile(file: string): void {
      if (typeof file !== "string" || file.trim() === "") {
        throw new ArgumentsError(`Must be a non-empty string.`, [
          `mylang:dotenv (${__filename})`,
        ]);
      }

      const fullPath = path.join(score.get("import").base, file);

      if (!existsSync(fullPath)) {
        throw new FileReadFaild(`File not found: "${file}".`, fullPath, [
          `mylang:dotenv (${__filename})`,
        ]);
      }

      const content = readFileSync(fullPath, "utf-8");
      const lines = content.split(/\r?\n/);

      lines.forEach((line) => {
        const trimmedLine = line.trim();
        if (trimmedLine === "" || trimmedLine.startsWith("#")) return;

        const [key, ...valueParts] = trimmedLine.split("=");
        const keyTrimmed = key?.trim();
        const value = valueParts
          .join("=")
          .trim()
          .replace(/^['"]|['"]$/g, "");

        if (!keyTrimmed || !value) {
          throw new FileReadFaild(
            `Invalid format in .env file: "${line}". Must be in "KEY=VALUE" format.`,
            fullPath,
            [`mylang:dotenv (${__filename})`],
          );
        }

        envMap.set(keyTrimmed, value);
      });
    },

    get([key]: [string]): string | undefined {
      if (typeof key !== "string" || key.trim() === "") {
        throw new ArgumentsError(`Must be a non-empty string.`, [
          `mylang:dotenv (${__filename})`,
        ]);
      }
      return envMap.get(key);
    },

    set([key, value]: [string, string]): void {
      if (typeof key !== "string" || key.trim() === "") {
        throw new ArgumentsError(`Must be a non-empty string.`, [
          `mylang:dotenv (${__filename})`,
        ]);
      }
      if (typeof value !== "string") {
        throw new ArgumentsError(
          `Invalid value for key "${key}". Must be a string.`,
          [`mylang:dotenv (${__filename})`],
        );
      }
      envMap.set(key, value);
    },

    unset([key]: [string]): void {
      if (typeof key !== "string" || key.trim() === "") {
        throw new ArgumentsError(
          `Invalid key: "${key}". Must be a non-empty string.`,
          [`mylang:dotenv (${__filename})`],
        );
      }
      if (!envMap.has(key)) {
        throw new ArgumentsError(
          `Key "${key}" does not exist in the environment.`,
          [`mylang:dotenv (${__filename})`],
        );
      }
      envMap.delete(key);
    },

    has([key]: [string]): boolean {
      if (typeof key !== "string" || key.trim() === "") {
        throw new ArgumentsError(
          `Invalid key: "${key}". Must be a non-empty string.`,
          [`mylang:dotenv (${__filename})`],
        );
      }
      return envMap.has(key);
    },

    all(): Record<string, string> {
      const result: Record<string, string> = {};
      for (const [key, value] of envMap) {
        result[key] = value;
      }
      return result;
    },

    applyToProcess([override = false]: [boolean]): void {
      if (typeof override !== "boolean") {
        throw new ArgumentsError(
          `Invalid override value: "${override}". Must be a boolean.`,
          [`mylang:dotenv (${__filename})`],
        );
      }

      for (const [key, value] of envMap) {
        if (!process.env[key] || override) {
          process.env[key] = value;
        }
      }
    },

    config([files, override = false]: [string | string[], boolean]): void {
      this.load([files]);
      this.applyToProcess([override]);
    },
  };
}

function config(
  [files, override = false]: [string | string[], boolean],
  score: Environment,
) {
  return DotEnv([], score).config([files, override]);
}

export { DotEnv, config };
