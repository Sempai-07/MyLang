import path from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { type Environment } from "../../../Environment";

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
        throw `Invalid argument for load: "${files}". Must be a string or array of strings.`;
      }
    },

    _loadFile(file: string): void {
      if (typeof file !== "string" || file.trim() === "") {
        throw `Invalid file path: "${file}". Must be a non-empty string.`;
      }

      const fullPath = path.join(score.get("import").base, file);

      if (!existsSync(fullPath)) {
        throw `File not found: "${file}".`;
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
          throw `Invalid format in .env file: "${line}". Must be in "KEY=VALUE" format.`;
        }

        envMap.set(keyTrimmed, value);
      });
    },

    get([key]: [string]): string | undefined {
      if (typeof key !== "string" || key.trim() === "") {
        throw `Invalid key: "${key}". Must be a non-empty string.`;
      }
      return envMap.get(key);
    },

    set([key, value]: [string, string]): void {
      if (typeof key !== "string" || key.trim() === "") {
        throw `Invalid key: "${key}". Must be a non-empty string.`;
      }
      if (typeof value !== "string") {
        throw `Invalid value for key "${key}". Must be a string.`;
      }
      envMap.set(key, value);
    },

    unset([key]: [string]): void {
      if (typeof key !== "string" || key.trim() === "") {
        throw `Invalid key: "${key}". Must be a non-empty string.`;
      }
      if (!envMap.has(key)) {
        throw `Key "${key}" does not exist in the environment.`;
      }
      envMap.delete(key);
    },

    has([key]: [string]): boolean {
      if (typeof key !== "string" || key.trim() === "") {
        throw `Invalid key: "${key}". Must be a non-empty string.`;
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
        throw `Invalid override value: "${override}". Must be a boolean.`;
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
