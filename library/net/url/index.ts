import { FunctionBuilder, FunctionBuilderCodeError } from "../../FunctionBuilder";
import { Environment } from "../../../src/Environment";
import { type StmtType } from "../../../src/ast/StmtType";
import { isTypeArgs } from "../../utils/utils";

abstract class UrlMethodBuilder extends FunctionBuilder {
  constructor(args: any[], astArgs: StmtType[], environment: Environment) {
    super(args, astArgs, environment);
  }

  get pkgInfo() {
    return {
      name: "net/url",
      path: __dirname,
    };
  }

  protected validateUrl(url: any, argName: string = "url"): void {
    if (typeof url !== "string" && !(url instanceof globalThis.URL)) {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "string or URL",
        received: isTypeArgs(url),
      });
    }
  }

  protected validateString(str: any, argName: string): void {
    if (typeof str !== "string") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "string",
        received: isTypeArgs(str),
      });
    }
  }

  protected validateFunction(func: any, argName: string = "callback"): void {
    if (isTypeArgs(func) !== "function") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "function",
        received: isTypeArgs(func),
      });
    }
  }

  protected validateObject(obj: any, argName: string): void {
    if (typeof obj !== "object" || obj === null) {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "object",
        received: isTypeArgs(obj),
      });
    }
  }

  protected executeCallback(callbackFunc: any, args: any[]): any {
    if (this.isBuildModuleFunction(callbackFunc)) {
      return new callbackFunc(args, [], this.environment).call();
    }
    return callbackFunc.call(args.map((v) => ({ value: v })));
  }

  call() {
    throw new Error("Call is not implemented");
  }
}

class URL extends UrlMethodBuilder {
  override call() {
    const [urlInput, base] = this.args;

    let url: globalThis.URL;
    try {
      if (base) {
        this.validateString(base, "base");
        url = new globalThis.URL(urlInput, base);
      } else {
        url = new globalThis.URL(urlInput);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw this.throwErrorFormatters(new Error(`Invalid URL: ${errorMessage}`));
    }

    return {
      href: class extends UrlMethodBuilder {
        override call() {
          const [newHref] = this.args;
          if (newHref !== undefined) {
            this.validateString(newHref, "href");
            url.href = newHref;
            return new URL([url.href], [], this.environment).call();
          }
          return url.href;
        }
      },

      origin: class extends UrlMethodBuilder {
        override call() {
          return url.origin;
        }
      },

      protocol: class extends UrlMethodBuilder {
        override call() {
          const [newProtocol] = this.args;
          if (newProtocol !== undefined) {
            this.validateString(newProtocol, "protocol");
            url.protocol = newProtocol;
            return new URL([url.href], [], this.environment).call();
          }
          return url.protocol;
        }
      },

      host: class extends UrlMethodBuilder {
        override call() {
          const [newHost] = this.args;
          if (newHost !== undefined) {
            this.validateString(newHost, "host");
            url.host = newHost;
            return new URL([url.href], [], this.environment).call();
          }
          return url.host;
        }
      },

      hostname: class extends UrlMethodBuilder {
        override call() {
          const [newHostname] = this.args;
          if (newHostname !== undefined) {
            this.validateString(newHostname, "hostname");
            url.hostname = newHostname;
            return new URL([url.href], [], this.environment).call();
          }
          return url.hostname;
        }
      },

      port: class extends UrlMethodBuilder {
        override call() {
          const [newPort] = this.args;
          if (newPort !== undefined) {
            this.validateString(newPort.toString(), "port");
            url.port = newPort.toString();
            return new URL([url.href], [], this.environment).call();
          }
          return url.port;
        }
      },

      pathname: class extends UrlMethodBuilder {
        override call() {
          const [newPathname] = this.args;
          if (newPathname !== undefined) {
            this.validateString(newPathname, "pathname");
            url.pathname = newPathname;
            return new URL([url.href], [], this.environment).call();
          }
          return url.pathname;
        }
      },

      search: class extends UrlMethodBuilder {
        override call() {
          const [newSearch] = this.args;
          if (newSearch !== undefined) {
            this.validateString(newSearch, "search");
            url.search = newSearch;
            return new URL([url.href], [], this.environment).call();
          }
          return url.search;
        }
      },

      hash: class extends UrlMethodBuilder {
        override call() {
          const [newHash] = this.args;
          if (newHash !== undefined) {
            this.validateString(newHash, "hash");
            url.hash = newHash;
            return new URL([url.href], [], this.environment).call();
          }
          return url.hash;
        }
      },

      searchParams: class extends UrlMethodBuilder {
        override call() {
          return new URLSearchParams([url.searchParams], [], this.environment).call();
        }
      },

      toString: class extends UrlMethodBuilder {
        override call() {
          return url.toString();
        }
      },

      toJSON: class extends UrlMethodBuilder {
        override call() {
          return url.toJSON();
        }
      },

      clone: class extends UrlMethodBuilder {
        override call() {
          return new URL([url.href], [], this.environment).call();
        }
      },

      resolve: class extends UrlMethodBuilder {
        override call() {
          const [relative] = this.args;
          this.validateString(relative, "relative");

          try {
            const resolved = new globalThis.URL(relative, url.href);
            return new URL([resolved.href], [], this.environment).call();
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw this.throwErrorFormatters(new Error(`Cannot resolve URL: ${errorMessage}`));
          }
        }
      },

      isAbsolute: class extends UrlMethodBuilder {
        override call() {
          return url.protocol !== "";
        }
      },

      isRelative: class extends UrlMethodBuilder {
        override call() {
          return url.protocol === "";
        }
      },

      [Environment.SymbolFormatedText]: `URL { "${url.href}" }`,
    };
  }
}

class URLSearchParams extends UrlMethodBuilder {
  override call() {
    const [init] = this.args;
    let params: globalThis.URLSearchParams;

    try {
      if (init instanceof globalThis.URLSearchParams) {
        params = new globalThis.URLSearchParams(init);
      } else {
        params = new globalThis.URLSearchParams(init);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw this.throwErrorFormatters(new Error(`Invalid URLSearchParams: ${errorMessage}`));
    }

    return {
      append: class extends UrlMethodBuilder {
        override call() {
          const [name, value] = this.args;
          this.validateString(name, "name");
          this.validateString(value, "value");

          params.append(name, value);
          return new URLSearchParams([params], [], this.environment).call();
        }
      },

      delete: class extends UrlMethodBuilder {
        override call() {
          const [name] = this.args;
          this.validateString(name, "name");

          params.delete(name);
          return new URLSearchParams([params], [], this.environment).call();
        }
      },

      get: class extends UrlMethodBuilder {
        override call() {
          const [name] = this.args;
          this.validateString(name, "name");

          return params.get(name);
        }
      },

      getAll: class extends UrlMethodBuilder {
        override call() {
          const [name] = this.args;
          this.validateString(name, "name");

          return params.getAll(name);
        }
      },

      has: class extends UrlMethodBuilder {
        override call() {
          const [name] = this.args;
          this.validateString(name, "name");

          return params.has(name);
        }
      },

      set: class extends UrlMethodBuilder {
        override call() {
          const [name, value] = this.args;
          this.validateString(name, "name");
          this.validateString(value, "value");

          params.set(name, value);
          return new URLSearchParams([params], [], this.environment).call();
        }
      },

      sort: class extends UrlMethodBuilder {
        override call() {
          params.sort();
          return new URLSearchParams([params], [], this.environment).call();
        }
      },

      toString: class extends UrlMethodBuilder {
        override call() {
          return params.toString();
        }
      },

      keys: class extends UrlMethodBuilder {
        override call() {
          return Array.from(params.keys());
        }
      },

      values: class extends UrlMethodBuilder {
        override call() {
          return Array.from(params.values());
        }
      },

      entries: class extends UrlMethodBuilder {
        override call() {
          return Array.from(params.entries());
        }
      },

      forEach: class extends UrlMethodBuilder {
        override async call() {
          const [callback] = this.args;
          this.validateFunction(callback);

          for (const [key, value] of params.entries()) {
            await this.executeCallback(callback, [value, key, params]);
          }
          return null;
        }
      },

      size: class extends UrlMethodBuilder {
        override call() {
          return Array.from(params.entries()).length;
        }
      },

      toObject: class extends UrlMethodBuilder {
        override call() {
          const obj: Record<string, string | string[]> = {};
          for (const [key, value] of params.entries()) {
            if (obj[key]) {
              if (Array.isArray(obj[key])) {
                (obj[key] as string[]).push(value);
              } else {
                obj[key] = [obj[key] as string, value];
              }
            } else {
              obj[key] = value;
            }
          }
          return obj;
        }
      },

      clone: class extends UrlMethodBuilder {
        override call() {
          return new URLSearchParams(
            [new globalThis.URLSearchParams(params)],
            [],
            this.environment,
          ).call();
        }
      },

      *[Symbol.iterator]() {
        for (const entry of params.entries()) {
          yield entry;
        }
      },

      [Environment.SymbolFormatedText]: `URLSearchParams { "${params.toString()}" }`,
    };
  }
}

class URLPattern extends UrlMethodBuilder {
  override call() {
    const [patterns, options = {}] = this.args;
    this.validateString(patterns, "pattern");

    let pattern!: string;
    let regex!: RegExp;
    const keys: string[] = [];

    let regexPattern = patterns
      .replace(/\*/g, ".*")
      .replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, (_match: string, key: string) => {
        keys.push(key);
        return "([^/]+)";
      });

    try {
      regex = new RegExp(`^${regexPattern}$`, (options as any).ignoreCase ? "i" : "");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw this.throwErrorFormatters(new Error(`Invalid pattern: ${errorMessage}`));
    }

    return {
      test: class extends UrlMethodBuilder {
        override call() {
          const [url] = this.args;
          this.validateString(url, "url");

          return regex.test(url);
        }
      },

      exec: class extends UrlMethodBuilder {
        override call() {
          const [url] = this.args;
          this.validateString(url, "url");

          const match = regex.exec(url);
          if (!match) return null;

          const result: Record<string, string> = {};
          keys.forEach((key: string, index: number) => {
            result[key] = match[index + 1]!;
          });

          return {
            input: url,
            params: result,
            groups: match.slice(1),
            pathname: {
              input: url,
              groups: result,
            },
          };
        }
      },

      pathname: class extends UrlMethodBuilder {
        override call() {
          return pattern;
        }
      },

      [Environment.SymbolFormatedText]: `URLPattern { "${pattern}" }`,
    };
  }
}

class Format extends UrlMethodBuilder {
  override call() {
    const [urlObject] = this.args;
    this.validateObject(urlObject, "urlObject");

    const {
      protocol = "http:",
      hostname = "localhost",
      port = "",
      pathname = "/",
      search = "",
      hash = "",
    } = urlObject;

    let url = `${protocol}//${hostname}`;
    if (port) url += `:${port}`;
    url += pathname;
    if (search) url += search.startsWith("?") ? search : `?${search}`;
    if (hash) url += hash.startsWith("#") ? hash : `#${hash}`;

    return new URL([url], [], this.environment).call();
  }
}

class Resolve extends UrlMethodBuilder {
  override call() {
    const [from, to] = this.args;
    this.validateString(from, "from");
    this.validateString(to, "to");

    try {
      const resolved = new globalThis.URL(to, from);
      return resolved.href;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw this.throwErrorFormatters(new Error(`Cannot resolve URLs: ${errorMessage}`));
    }
  }
}

class IsAbsolute extends UrlMethodBuilder {
  override call() {
    const [urlString] = this.args;
    this.validateString(urlString, "url");

    try {
      new globalThis.URL(urlString);
      return true;
    } catch {
      return false;
    }
  }
}

class Join extends UrlMethodBuilder {
  override call() {
    const paths = this.args;

    if (paths.length === 0) return "";

    let result = paths[0];
    for (let i = 1; i < paths.length; i++) {
      const path = paths[i];
      this.validateString(path, `path[${i}]`);

      if (result.endsWith("/") && path.startsWith("/")) {
        result += path.slice(1);
      } else if (!result.endsWith("/") && !path.startsWith("/")) {
        result += "/" + path;
      } else {
        result += path;
      }
    }

    return result;
  }
}

class FileURLToPath extends UrlMethodBuilder {
  override call() {
    const [url] = this.args;

    let urlObj: globalThis.URL;
    if (typeof url === "string") {
      urlObj = new globalThis.URL(url);
    } else if (url instanceof globalThis.URL) {
      urlObj = url;
    } else {
      throw this.throwErrorFormatters(new Error("URL must be a string or URL object"));
    }

    if (urlObj.protocol !== "file:") {
      throw this.throwErrorFormatters(new Error("URL must be a file: URL"));
    }

    return decodeURIComponent(urlObj.pathname);
  }
}

class EncodeURIComponent extends UrlMethodBuilder {
  override call() {
    const [str] = this.args;
    this.validateString(str, "string");

    return encodeURIComponent(str);
  }
}

class DecodeURIComponent extends UrlMethodBuilder {
  override call() {
    const [str] = this.args;
    this.validateString(str, "string");

    try {
      return decodeURIComponent(str);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw this.throwErrorFormatters(new Error(`Cannot decode URI component: ${errorMessage}`));
    }
  }
}

class EncodeURI extends UrlMethodBuilder {
  override call() {
    const [str] = this.args;
    this.validateString(str, "string");

    return encodeURI(str);
  }
}

class DecodeURI extends UrlMethodBuilder {
  override call() {
    const [str] = this.args;
    this.validateString(str, "string");

    try {
      return decodeURI(str);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw this.throwErrorFormatters(new Error(`Cannot decode URI: ${errorMessage}`));
    }
  }
}

module.exports = {
  URL,
  URLSearchParams,
  URLPattern,
  decodeURI: DecodeURI,
  encodeURI: EncodeURI,
  decodeURIComponent: DecodeURIComponent,
  encodeURIComponent: EncodeURIComponent,
  format: Format,
  resolve: Resolve,
  isAbsolute: IsAbsolute,
  join: Join,
  fileURLToPath: FileURLToPath,
};
