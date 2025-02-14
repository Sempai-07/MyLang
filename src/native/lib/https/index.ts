import fs from "node:fs";
// @ts-expect-error
import requestSync from "request-sync";
import { BaseError } from "../../../errors/BaseError";
import { emitWarning } from "../../../errors/WarningError";

emitWarning('module "https" is in an experimental state', {
  name: "ModuleExperimental",
  code: "WARN001",
});

interface RequestOptions {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: string | Buffer;
  timeout?: number;
}

function request([url, options]: [
  string,
  string | Omit<RequestOptions, "url">,
]) {
  const config: RequestOptions = {
    url,
    ...(typeof options === "string" ? { method: options } : options),
  };

  if (config.body && typeof config.body !== "string") {
    config.body = Buffer.from(config.body?.toJSON().data);
  }

  try {
    const response = requestSync(config);

    return {
      statusCode: response.statusCode,
      headers: response.headers,
      body: {
        toJSON() {
          try {
            return JSON.parse(response.body.toString("utf8"));
          } catch (err) {
            throw new BaseError(
              `Failed to parse response body as JSON: ${err}`,
              {
                files: [`mylang:https (${__filename})`],
              },
            );
          }
        },
        toStr([encoding]: [string] = ["utf8"]) {
          return response.body.toString(encoding);
        },
        toBuffer() {
          return Buffer.from(response.body);
        },
        saveToFile([filePath]: [string]) {
          fs.writeFileSync(filePath, response.body);
          return filePath;
        },
        toBinaryString() {
          return response.body.toString("binary");
        },
        toString() {
          return `${response.body}`;
        },
      },
    };
  } catch (err) {
    throw new BaseError(`Failed to perform request: ${err}`, {
      files: [`mylang:https (${__filename})`],
    });
  }
}

export { request };
