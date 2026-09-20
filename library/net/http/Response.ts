import { HttpMethodBuilder } from "./HttpBuilder";
import { Bytes } from "../../bytes/Bytes";
import { ByteArray } from "../../bytes/ByteArray";

class HttpResponse extends HttpMethodBuilder {
  override call() {
    const [responseData] = this.args;

    const { status, statusText, headers, data, url: responseUrl } = responseData;

    return {
      status: class extends HttpMethodBuilder {
        override call() {
          return status;
        }
      },

      statusText,

      headers,

      getHeader: class extends HttpMethodBuilder {
        override call() {
          const [name] = this.args;
          return headers[name.toLowerCase()];
        }
      },

      text: class extends HttpMethodBuilder {
        override call() {
          const contentType = headers["content-type"] || "";
          const { charset = "utf8" } = this.parseContentType(contentType);
          return data.toString(charset);
        }
      },

      json: class extends HttpMethodBuilder {
        override call() {
          try {
            const text = data.toString("utf8");
            return JSON.parse(text);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            throw this.throwErrorFormatters(new Error(`Failed to parse JSON: ${errorMessage}`));
          }
        }
      },

      buffer: class extends HttpMethodBuilder {
        override call() {
          return new Bytes([data], [], this.environment).call();
        }
      },

      arrayBuffer: class extends HttpMethodBuilder {
        override call() {
          return new ByteArray(
            [data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)],
            [],
            this.environment,
          ).call();
        }
      },

      ok: status >= 200 && status < 300,

      redirected: status >= 300 && status < 400,

      url: responseUrl,

      clone: class extends HttpMethodBuilder {
        override call() {
          return new HttpResponse(
            [
              {
                ...responseData,
                data: Buffer.from(data),
              },
            ],
            [],
            this.environment,
          ).call();
        }
      },
    };
  }
}

export { HttpResponse };
