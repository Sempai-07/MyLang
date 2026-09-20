import http from "node:http";
import https from "node:https";
import zlib from "node:zlib";
import { URL } from "node:url";
import querystring from "node:querystring";
import { HttpResponse } from "./Response";
import { isTypeArgs } from "../../utils/utils";
import { HttpMethodBuilder } from "./HttpBuilder";
import { FunctionBuilderCodeError } from "../../FunctionBuilder";

class HttpRequest extends HttpMethodBuilder {
  override call() {
    const [url, options = {}] = this.args;
    this.validateUrl(url);

    if (typeof options !== "object") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: "options",
        expectType: "object",
        received: isTypeArgs(options),
      });
    }

    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === "https:";
    const httpModule = isHttps ? https : http;

    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || "GET",
      headers: this.mergeHeaders(
        {
          "User-Agent": "HttpLib/1.0",
          Accept: "*/*",
          Connection: "close",
        },
        options.headers,
      ),
      timeout: options.timeout || 30000,
      ...options.requestOptions,
    };

    let currentRequest: http.ClientRequest | null = null;

    return {
      send: class extends HttpMethodBuilder {
        override call() {
          const [data] = this.args;

          return new Promise((resolve, reject) => {
            currentRequest = httpModule.request(requestOptions, (res: http.IncomingMessage) => {
              let responseData = Buffer.alloc(0);

              // Handle compression
              let stream: NodeJS.ReadableStream = res;
              const encoding = res.headers["content-encoding"];
              if (encoding === "gzip") {
                const gunzip = zlib.createGunzip();
                res.pipe(gunzip);
                stream = gunzip;
              } else if (encoding === "deflate") {
                const inflate = zlib.createInflate();
                res.pipe(inflate);
                stream = inflate;
              }

              stream.on("data", (chunk: Buffer) => {
                responseData = Buffer.concat([responseData, chunk]);
              });

              stream.on("end", () => {
                const response = new HttpResponse(
                  [
                    {
                      status: res.statusCode,
                      statusText: res.statusMessage,
                      headers: res.headers,
                      data: responseData,
                      url: url,
                    },
                  ],
                  [],
                  this.environment,
                ).call();

                resolve(response);
              });

              stream.on("error", reject);
            });

            currentRequest.on("error", reject);
            currentRequest.on("timeout", () => {
              if (currentRequest) {
                currentRequest.destroy();
              }
              reject(this.throwErrorFormatters(new Error("Request timeout")));
            });

            if (data) {
              if (
                typeof data === "object" &&
                requestOptions.headers["content-type"]?.includes("application/json")
              ) {
                currentRequest.write(JSON.stringify(data));
              } else if (
                typeof data === "object" &&
                requestOptions.headers["content-type"]?.includes(
                  "application/x-www-form-urlencoded",
                )
              ) {
                currentRequest.write(querystring.stringify(data));
              } else {
                currentRequest.write(data);
              }
            }

            currentRequest.end();
          });
        }
      },

      abort: class extends HttpMethodBuilder {
        override call() {
          if (currentRequest) {
            currentRequest.destroy();
            return true;
          }
          return false;
        }
      },

      setHeader: class extends HttpMethodBuilder {
        override call() {
          const [name, value] = this.args;
          requestOptions.headers[name.toLowerCase()] = value;
          return new HttpRequest(
            [url, { ...options, headers: requestOptions.headers }],
            [],
            this.environment,
          ).call();
        }
      },

      setTimeout: class extends HttpMethodBuilder {
        override call() {
          const [timeout] = this.args;
          requestOptions.timeout = timeout;
          return new HttpRequest([url, { ...options, timeout }], [], this.environment).call();
        }
      },
    };
  }
}

export { HttpRequest };
