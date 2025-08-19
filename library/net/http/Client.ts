import { URL } from "node:url";
import { HttpRequest } from "./Request";
import { HttpMethodBuilder } from "./HttpBuilder";
import { isTypeArgs } from "../../utils/utils";
import { FunctionBuilderCodeError } from "../../FunctionBuilder";

interface InterceptorConfig {
  onFulfilled?: any;
  onRejected?: any;
}

class HttpClient extends HttpMethodBuilder {
  override call() {
    const [baseConfig = {}] = this.args;

    if (typeof baseConfig !== "object") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: "baseConfig",
        expectType: "object",
        received: isTypeArgs(baseConfig),
      });
    }

    const client = {
      baseURL: baseConfig.baseURL || "",
      timeout: baseConfig.timeout || 30000,
      headers: baseConfig.headers || {},
      interceptors: {
        request: [] as InterceptorConfig[],
        response: [] as InterceptorConfig[],
      },
    };

    const requestMethod = class extends HttpMethodBuilder {
      override async call() {
        const [config] = this.args;
        let finalConfig = { ...baseConfig, ...config };

        for (const interceptor of client.interceptors.request) {
          if (interceptor.onFulfilled) {
            finalConfig = await this.executeCallback(interceptor.onFulfilled, [finalConfig]);
          }
        }

        const fullUrl = client.baseURL
          ? new URL(finalConfig.url, client.baseURL).toString()
          : finalConfig.url;
        const request = new HttpRequest([fullUrl, finalConfig], [], this.environment).call();

        try {
          const sendMethod = request.send as any;
          let response = await new sendMethod([], [], this.environment).call();

          for (const interceptor of client.interceptors.response) {
            if (interceptor.onFulfilled) {
              response = await this.executeCallback(interceptor.onFulfilled, [response]);
            }
          }

          return response;
        } catch (error) {
          for (const interceptor of client.interceptors.response) {
            if (interceptor.onRejected) {
              return await this.executeCallback(interceptor.onRejected, [error]);
            }
          }
          throw error;
        }
      }
    };

    return {
      request: requestMethod,

      get: class extends HttpMethodBuilder {
        override call() {
          const [url, config = {}] = this.args;
          return new requestMethod({ ...config, method: "GET", url }, [], this.environment).call();
        }
      },

      post: class extends HttpMethodBuilder {
        override call() {
          const [url, data, config = {}] = this.args;
          return new requestMethod(
            [
              {
                ...config,
                method: "POST",
                url,
                data,
                headers: this.mergeHeaders({ "content-type": "application/json" }, config.headers),
              },
            ],
            [],
            this.environment,
          ).call();
        }
      },

      put: class extends HttpMethodBuilder {
        override call() {
          const [url, data, config = {}] = this.args;
          return new requestMethod(
            [
              {
                ...config,
                method: "PUT",
                url,
                data,
                headers: this.mergeHeaders({ "content-type": "application/json" }, config.headers),
              },
            ],
            [],
            this.environment,
          ).call();
        }
      },

      delete: class extends HttpMethodBuilder {
        override call() {
          const [url, config = {}] = this.args;
          return new requestMethod(
            [{ ...config, method: "DELETE", url }],
            [],
            this.environment,
          ).call();
        }
      },

      patch: class extends HttpMethodBuilder {
        override call() {
          const [url, data, config = {}] = this.args;
          return new requestMethod(
            [
              {
                ...config,
                method: "PATCH",
                url,
                data,
                headers: this.mergeHeaders({ "content-type": "application/json" }, config.headers),
              },
            ],
            [],
            this.environment,
          ).call();
        }
      },

      head: class extends HttpMethodBuilder {
        override call() {
          const [url, config = {}] = this.args;
          return new requestMethod(
            [{ ...config, method: "HEAD", url }],
            [],
            this.environment,
          ).call();
        }
      },

      options: class extends HttpMethodBuilder {
        override call() {
          const [url, config = {}] = this.args;
          return new requestMethod(
            [{ ...config, method: "OPTIONS", url }],
            [],
            this.environment,
          ).call();
        }
      },

      setBaseURL: class extends HttpMethodBuilder {
        override call() {
          const [baseURL] = this.args;
          client.baseURL = baseURL;
          return new HttpClient([{ ...baseConfig, baseURL }], [], this.environment).call();
        }
      },

      setHeader: class extends HttpMethodBuilder {
        override call() {
          const [name, value] = this.args;
          client.headers[name] = value;
          return new HttpClient(
            [{ ...baseConfig, headers: { ...client.headers } }],
            [],
            this.environment,
          ).call();
        }
      },

      setTimeout: class extends HttpMethodBuilder {
        override call() {
          const [timeout] = this.args;
          client.timeout = timeout;
          return new HttpClient([{ ...baseConfig, timeout }], [], this.environment).call();
        }
      },

      addRequestInterceptor: class extends HttpMethodBuilder {
        override call() {
          const [onFulfilled, onRejected] = this.args;
          this.validateFunction(onFulfilled);
          if (onRejected) this.validateFunction(onRejected);

          client.interceptors.request.push({ onFulfilled, onRejected });
          return client.interceptors.request.length - 1;
        }
      },

      addResponseInterceptor: class extends HttpMethodBuilder {
        override call() {
          const [onFulfilled, onRejected] = this.args;
          this.validateFunction(onFulfilled);
          if (onRejected) this.validateFunction(onRejected);

          client.interceptors.response.push({ onFulfilled, onRejected });
          return client.interceptors.response.length - 1;
        }
      },

      removeInterceptor: class extends HttpMethodBuilder {
        override call() {
          const [type, id] = this.args;
          if (type === "request" && client.interceptors.request[id]) {
            delete client.interceptors.request[id];
          } else if (type === "response" && client.interceptors.response[id]) {
            delete client.interceptors.response[id];
          }
          return null;
        }
      },
    };
  }
}

export { HttpClient };
