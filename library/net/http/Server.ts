import fs from "node:fs";
import http from "node:http";
import https from "node:https";
import path from "node:path";
import crypto from "node:crypto";
import express, { Request, Response, NextFunction, Application } from "express";
import { isTypeArgs } from "../../utils/utils";
import { Environment } from "../../../src/Environment";
import { Bytes } from "../../bytes/Bytes";
import { HttpMethodBuilder } from "./HttpBuilder";

type Handler = (ctx: RequestContext) => Promise<any> | any;
type Middleware = (ctx: RequestContext, next: () => Promise<void>) => Promise<void> | void;

interface RouteEntry {
  method: string;
  pattern: string;
  regex: RegExp;
  keys: string[];
  handler: Handler;
}

interface CacheOptions {
  enabled?: boolean;
  maxSize?: number;
  ttl?: number;
  clearOnRestart?: boolean;
  memoryLimit?: number;
}

interface ServerOptions {
  key?: Buffer | string;
  cert?: Buffer | string;
  port?: number;
  host?: string;
  cache?: CacheOptions;
  static?: {
    root?: string;
    index?: string;
    maxAge?: number;
    spa?: boolean;
    dotfiles?: "allow" | "deny" | "ignore";
    etag?: boolean;
    lastModified?: boolean;
    noCache?: boolean;
    cacheControl?: string;
  };
  cors?: {
    origin?: string | HttpMethodBuilder | ((origin?: string) => boolean);
    methods?: string[];
    credentials?: boolean;
    allowedHeaders?: string[];
    exposedHeaders?: string[];
    maxAge?: number;
  };
  bodyLimit?: number;
  trustProxy?: boolean;
  compression?: {
    threshold?: number;
    level?: number;
    filter?: (req: http.IncomingMessage, res: http.ServerResponse) => boolean;
  };
  security?: {
    helmet?: boolean;
    xss?: boolean;
    noSniff?: boolean;
    frameOptions?: string;
    hsts?: boolean;
  };
  timeout?: number;
  keepAliveTimeout?: number;
  maxConnections?: number;
}

interface RequestContext {
  res: Res;
  req: Req;
  method: string;
  url: string;
  path: string;
  query: Record<string, string | string[]>;
  params: Record<string, string | string[]>;
  headers: http.IncomingHttpHeaders;
  body: any;
  rawBody?: ReturnType<Bytes["call"]>;
  ip?: string;
  state?: Record<string, any>;
  cookies?: Record<string, string>;
  protocol: string;
  secure: boolean;
  hostname?: string;
  fresh: boolean;
  stale: boolean;
  send: typeof HttpMethodBuilder;
  sendFile: typeof HttpMethodBuilder;
  json: typeof HttpMethodBuilder;
  status: typeof HttpMethodBuilder;
  cookie: typeof HttpMethodBuilder;
  clearCookie: typeof HttpMethodBuilder;
  redirect: typeof HttpMethodBuilder;
  __req: Request;
  __res: Response;
  [key: string]: any;
}

interface Req {
  url: string;
  method: string;
  httpVersion: string;
  httpVersionMajor: number;
  httpVersionMinor: number;
  headers: http.IncomingHttpHeaders;
  rawHeaders: string[];
  aborted: boolean;
}

interface Res {
  statusCode: number;
  statusMessage: string | null;
  setHeader: typeof HttpMethodBuilder;
  getHeader: typeof HttpMethodBuilder;
  removeHeader: typeof HttpMethodBuilder;
  hasHeader: typeof HttpMethodBuilder;
}

interface RateLimitEntry {
  count: number;
  expires: number;
  resetTime: number;
}

class HttpServer extends HttpMethodBuilder {
  private static readonly DEFAULT_MIME_TYPES: Record<string, string> = {
    ".html": "text/html; charset=utf-8",
    ".htm": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".mjs": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".xml": "application/xml; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".avif": "image/avif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".txt": "text/plain; charset=utf-8",
    ".md": "text/markdown; charset=utf-8",
    ".pdf": "application/pdf",
    ".wasm": "application/wasm",
    ".map": "application/json; charset=utf-8",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".otf": "font/otf",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".zip": "application/zip",
    ".tar": "application/x-tar",
    ".gz": "application/gzip",
  };

  private static readonly SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Content-Security-Policy": "default-src 'self'",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  };

  private static cache = new Map<string, { data: Buffer; timestamp: number; etag?: string }>();
  private static cacheStats = { hits: 0, misses: 0, size: 0 };

  override call() {
    const [options = {} as ServerOptions] = this.args;

    this.validateOptions(options);

    // Local helper functions
    const validatePath = (pathStr: string): string => {
      if (!pathStr || typeof pathStr !== "string") {
        throw this.throwErrorFormatters(new Error("Path must be a non-empty string"));
      }
      const resolved = path.resolve(pathStr);
      return resolved;
    };

    const ensureStaticDirectory = (dir: string): void => {
      try {
        const stat = fs.statSync(dir);
        if (!stat.isDirectory()) {
          throw this.throwErrorFormatters(new Error(`Static path is not a directory: ${dir}`));
        }
      } catch (err: any) {
        if (err.code === "ENOENT") {
          console.warn(`Static directory does not exist: ${dir}`);
        } else {
          throw err;
        }
      }
    };

    const app: Application = express();
    let server: http.Server | https.Server | null = null;
    let shuttingDown = false;
    let connectionCount = 0;
    const activeConnections = new Set<any>();

    const staticOptions = {
      root: validatePath(
        options.static?.root || path.join(this.environment.get("import").base, "public"),
      ),
      index: options.static?.index || "index.html",
      maxAge: Math.max(0, options.static?.maxAge ?? 3600),
      spa: options.static?.spa ?? false,
      dotfiles: options.static?.dotfiles || ("ignore" as const),
      etag: options.static?.etag ?? true,
      lastModified: options.static?.lastModified ?? true,
    };

    ensureStaticDirectory(staticOptions.root);

    // Setup Express middleware
    if (options.trustProxy) {
      app.set("trust proxy", true);
    }

    // Connection tracking
    app.use((req: Request, res: Response, next: NextFunction) => {
      connectionCount++;
      activeConnections.add(req);

      const cleanup = () => {
        activeConnections.delete(req);
        connectionCount = Math.max(0, connectionCount - 1);
      };

      res.on("finish", cleanup);
      res.on("close", cleanup);
      req.on("error", cleanup);

      if (options.maxConnections && connectionCount > options.maxConnections) {
        return res.status(503).json({ error: "Service Unavailable - Too many connections" });
      }

      if (shuttingDown) {
        return res.status(503).json({ error: "Server shutting down" });
      }

      return next();
    });

    // Security headers
    if (options.security) {
      app.use((_req: Request, res: Response, next: NextFunction) => {
        if (options.security?.helmet !== false) {
          Object.entries(HttpServer.SECURITY_HEADERS).forEach(([key, value]) => {
            res.setHeader(key, value);
          });
        }
        next();
      });
    }

    // CORS
    if (options.cors) {
      app.use((req: Request, res: Response, next: NextFunction) => {
        const origin = req.headers.origin;
        const corsOptions = options.cors!;

        let allowOrigin: string = "*";
        if (typeof corsOptions.origin === "function") {
          allowOrigin = corsOptions.origin(origin) ? origin || "*" : "null";
        } else if (typeof corsOptions.origin === "string") {
          allowOrigin = corsOptions.origin;
        }

        res.setHeader("Access-Control-Allow-Origin", allowOrigin);
        res.setHeader(
          "Access-Control-Allow-Methods",
          (corsOptions.methods || ["GET", "POST", "PUT", "DELETE", "OPTIONS"]).join(", "),
        );
        res.setHeader(
          "Access-Control-Allow-Headers",
          (corsOptions.allowedHeaders || ["Content-Type", "Authorization"]).join(", "),
        );

        if (corsOptions.credentials) {
          res.setHeader("Access-Control-Allow-Credentials", "true");
        }

        if (corsOptions.exposedHeaders?.length) {
          res.setHeader("Access-Control-Expose-Headers", corsOptions.exposedHeaders.join(", "));
        }

        if (corsOptions.maxAge) {
          res.setHeader("Access-Control-Max-Age", String(corsOptions.maxAge));
        }

        if (req.method === "OPTIONS") {
          return res.sendStatus(204);
        }

        return next();
      });
    }

    // Compression
    if (options.compression) {
      const zlib = require("zlib");
      app.use((req: Request, res: Response, next: NextFunction) => {
        const threshold = options.compression?.threshold || 1024;
        const level = options.compression?.level || 6;

        const originalSend = res.send;
        res.send = function (body: any): Response {
          if (!body || (typeof body !== "string" && !Buffer.isBuffer(body))) {
            return originalSend.call(this, body);
          }

          const buffer = Buffer.isBuffer(body) ? body : Buffer.from(body);
          if (buffer.length < threshold) {
            return originalSend.call(this, body);
          }

          const acceptEncoding = req.headers["accept-encoding"] || "";

          if (acceptEncoding.includes("gzip")) {
            res.setHeader("Content-Encoding", "gzip");
            return originalSend.call(this, zlib.gzipSync(buffer, { level }));
          } else if (acceptEncoding.includes("deflate")) {
            res.setHeader("Content-Encoding", "deflate");
            return originalSend.call(this, zlib.deflateSync(buffer, { level }));
          }

          return originalSend.call(this, body);
        };
        next();
      });
    }

    // Body parsing (перед cookie parser)
    const bodyLimit = options.bodyLimit || 2000000;
    app.use(express.json({ limit: bodyLimit }));
    app.use(express.urlencoded({ extended: true, limit: bodyLimit }));
    app.use(express.raw({ limit: bodyLimit }));
    app.use(express.text({ limit: bodyLimit }));

    // Cookie parser
    app.use((req: Request, _res: Response, next: NextFunction) => {
      req.cookies = {};
      const cookieHeader = req.headers.cookie;
      if (cookieHeader) {
        cookieHeader.split(";").forEach((cookie: string) => {
          const [name, ...rest] = cookie.trim().split("=");
          if (name && rest.length > 0) {
            try {
              req.cookies[decodeURIComponent(name)] = decodeURIComponent(rest.join("="));
            } catch (err) {
              req.cookies[name] = rest.join("=");
            }
          }
        });
      }
      next();
    });

    // Routes и middlewares хранилища
    const routes: RouteEntry[] = [];
    const middlewares: Middleware[] = [];

    const compilePath = (pattern: string): { regex: RegExp; keys: string[] } => {
      validateRoute(pattern);

      const keys: string[] = [];

      const regexStr =
        "^" +
        pattern
          .replace(/([.+?^=!:${}()|[\]\/\\])/g, "\\$1")
          .replace(/\\:([a-zA-Z_][a-zA-Z0-9_]*)/g, (_, key) => {
            if (keys.includes(key)) {
              throw this.throwErrorFormatters(new Error(`Duplicate route parameter: ${key}`));
            }
            keys.push(key);
            return "([^\\/]+)";
          })
          .replace(/\\\*/g, "(.*)") +
        "\\/?$";

      try {
        return { regex: pattern === "/" ? new RegExp("^\\/?$") : new RegExp(regexStr, "i"), keys };
      } catch (err) {
        throw this.throwErrorFormatters(new Error(`Invalid route pattern: ${pattern}`));
      }
    };

    const addRoute = (method: string, pattern: string, handler: Handler): void => {
      validateHandler(handler);

      const normalizedMethod = method.toUpperCase();
      const validMethods = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS", "ALL"];

      if (!validMethods.includes(normalizedMethod)) {
        throw this.throwErrorFormatters(new Error(`Invalid HTTP method: ${method}`));
      }

      const { regex, keys } = compilePath(pattern);

      const existingRoute = routes.find(
        (r) => r.method === normalizedMethod && r.pattern === pattern,
      );

      if (existingRoute) {
        console.warn(`Warning: Overriding existing route ${normalizedMethod} ${pattern}`);
        const index = routes.indexOf(existingRoute);
        routes.splice(index, 1);
      }

      routes.push({ method: normalizedMethod, pattern, regex, keys, handler });
    };

    const matchRoute = (
      method: string,
      pathname: string,
    ): { handler: Handler; params: Record<string, string> } | null => {
      // Обрабатываем роуты в обратном порядке (последний зарегистрированный имеет приоритет)
      for (let i = routes.length - 1; i >= 0; i--) {
        const route = routes[i]!;
        if (route.method !== method && route.method !== "ALL") continue;

        const match = route.regex.exec(pathname);
        if (match) {
          const params: Record<string, string> = {};
          route.keys.forEach((key, index) => {
            const value = match[index + 1];
            if (value !== undefined) {
              try {
                params[key] = decodeURIComponent(value);
              } catch (err) {
                params[key] = value;
              }
            }
          });
          return { handler: route.handler, params };
        }
      }
      return null;
    };

    // Helper functions
    const generateETag = (content: Buffer | string): string => {
      const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content);
      const hash = crypto.createHash("sha1").update(buffer).digest("hex");
      return `W/"${hash.substring(0, 16)}"`;
    };

    const createContext = (req: Request, res: Response): RequestContext => {
      const forwarded = req.headers["x-forwarded-for"] as string | undefined;
      const ip =
        options.trustProxy && forwarded
          ? forwarded.split(",")[0]?.trim()
          : req.socket.remoteAddress || "unknown";

      const protocol =
        options.trustProxy && req.headers["x-forwarded-proto"]
          ? (req.headers["x-forwarded-proto"] as string)
          : req.secure
            ? "https"
            : "http";

      const hostname = req.hostname;
      const cookies = req.cookies || {};

      const reqCtx: Req = {
        url: req.url || "/",
        method: req.method.toUpperCase(),
        httpVersion: req.httpVersion,
        httpVersionMajor: req.httpVersionMajor,
        httpVersionMinor: req.httpVersionMinor,
        headers: req.headers,
        rawHeaders: req.rawHeaders,
        aborted: (req as any).aborted || false,
      };

      const resCtx: Res = {
        statusCode: res.statusCode,
        statusMessage: res.statusMessage || null,

        setHeader: class extends HttpMethodBuilder {
          override call() {
            const [name, value] = this.args;
            res.setHeader(name, value);
            return resCtx;
          }
        },
        getHeader: class extends HttpMethodBuilder {
          override call() {
            const [name] = this.args;
            return res.getHeader(name);
          }
        },
        removeHeader: class extends HttpMethodBuilder {
          override call() {
            const [name] = this.args;
            res.removeHeader(name);
            return resCtx;
          }
        },
        hasHeader: class extends HttpMethodBuilder {
          override call() {
            const [name] = this.args;
            return res.hasHeader(name);
          }
        },
      };

      let currentStatus = 200;

      const ctx: RequestContext = {
        req: reqCtx,
        res: resCtx,
        method: req.method.toUpperCase(),
        url: req.url || "/",
        path: req.path,
        query: req.query as Record<string, string | string[]>,
        params: req.params as Record<string, string | string[]>,
        headers: req.headers,
        body: req.body,
        ...(ip && { ip }),
        state: {},
        cookies,
        protocol,
        secure: protocol === "https",
        ...(hostname && { hostname }),
        fresh: req.fresh,
        stale: req.stale,

        send: class extends HttpMethodBuilder {
          override call() {
            const [body, status = currentStatus, headers] = this.args;
            if (headers && typeof headers === "object") {
              Object.entries(headers).forEach(([key, value]) => {
                res.setHeader(key, value as string);
              });
            }
            res.status(status).send(body);
            return null;
          }
        },

        sendFile: class extends HttpMethodBuilder {
          override call() {
            let [filePathOrBuffer, options = {}, callback] = this.args;

            if (filePathOrBuffer?.[Environment.SymbolBuffer]) {
              filePathOrBuffer = filePathOrBuffer?.[Environment.SymbolBuffer];
            }

            // Если это Buffer
            if (Buffer.isBuffer(filePathOrBuffer)) {
              if (options && typeof options === "object" && options.headers) {
                Object.entries(options.headers).forEach(([key, value]) => {
                  res.setHeader(key, value as string);
                });
              }

              let contentType = options["Content-Type"];

              if (!contentType && options.filename) {
                const ext = path.extname(options.filename).toLowerCase();
                contentType = HttpServer.DEFAULT_MIME_TYPES[ext] || "application/octet-stream";
              }

              if (!contentType) {
                contentType = "application/octet-stream";
              }

              res.setHeader("Content-Type", contentType);

              if (options.download === true && options.filename) {
                res.setHeader("Content-Disposition", `attachment; filename="${options.filename}"`);
              } else if (options.download === false && options.filename) {
                res.setHeader("Content-Disposition", `inline; filename="${options.filename}"`);
              }

              res.setHeader("Content-Length", filePathOrBuffer.length);

              try {
                res.send(filePathOrBuffer);

                if (callback && isTypeArgs(callback) === "function") {
                  this.executeCallback(callback, [null]);
                }
              } catch (err: any) {
                if (!res.headersSent) {
                  res.status(500).json({
                    error: "Error sending file",
                    message: err.message,
                  });
                }

                if (callback && isTypeArgs(callback) === "function") {
                  this.executeCallback(callback, [err]);
                }
              }
            }
            // Если это путь к файлу (string)
            else if (typeof filePathOrBuffer === "string") {
              res.sendFile(filePathOrBuffer, options, (err) => {
                if (err && !res.headersSent) {
                  res.status((err as unknown as { status: number }).status ?? 500).json({
                    error: "Error sending file",
                    message: err.message,
                  });
                }

                if (callback && isTypeArgs(callback) === "function") {
                  this.executeCallback(callback, [err]);
                }
              });
            } else {
              const error = new Error("sendFile requires a file path (string) or Buffer");
              if (callback && isTypeArgs(callback) === "function") {
                this.executeCallback(callback, [error]);
              } else {
                throw this.throwErrorFormatters(error);
              }
            }

            return null;
          }
        },

        json: class extends HttpMethodBuilder {
          override call() {
            const [body, status = currentStatus, headers = {}] = this.args;
            if (headers && typeof headers === "object") {
              Object.entries(headers).forEach(([key, value]) => {
                res.setHeader(key, value as string);
              });
            }
            res.status(status).json(body);
            return null;
          }
        },

        status: class extends HttpMethodBuilder {
          override call() {
            const [code] = this.args;
            if (typeof code === "number" && code >= 100 && code <= 599) {
              currentStatus = code;
            }
            return ctx;
          }
        },

        cookie: class extends HttpMethodBuilder {
          override call() {
            const [name, value, opts = {}] = this.args;
            if (typeof name !== "string" || value === undefined) return ctx;
            res.cookie(name, value, opts);
            return ctx;
          }
        },

        clearCookie: class extends HttpMethodBuilder {
          override call() {
            const [name, opts] = this.args;
            res.clearCookie(name, opts);
            return ctx;
          }
        },

        redirect: class extends HttpMethodBuilder {
          override call() {
            const [url, status = 302] = this.args;
            if (typeof url === "string") {
              res.redirect(status, url);
            }
            return ctx;
          }
        },

        __req: req,
        __res: res,
      };

      return ctx;
    };

    // Главный middleware для обработки роутов
    app.use(async (req: Request, res: Response, next: NextFunction) => {
      try {
        const ctx = createContext(req, res);

        // Выполняем все middlewares последовательно
        let middlewareIndex = 0;
        const executeNextMiddleware = async (): Promise<void> => {
          if (middlewareIndex >= middlewares.length) {
            return;
          }

          const middleware = middlewares[middlewareIndex]!;
          middlewareIndex++;

          await this.executeCallback(middleware, [
            ctx,
            class extends HttpMethodBuilder {
              override async call() {
                await executeNextMiddleware();
                return null;
              }
            },
          ]);
        };

        await executeNextMiddleware();

        // Ищем подходящий роут
        const match = matchRoute(ctx.method, ctx.path);

        if (!match) {
          // Если роут не найден, передаём управление следующему middleware (например, статическим файлам)
          return next();
        }

        // Устанавливаем параметры роута
        ctx.params = match.params;

        // Выполняем обработчик роута
        const result = await this.executeCallback(match.handler, [ctx]);

        // Если ответ ещё не отправлен и есть результат
        if (!res.headersSent && result !== undefined && result !== null) {
          let finalResult = result;

          // Разворачиваем SymbolBuffer если есть
          if (finalResult?.[Environment.SymbolBuffer]) {
            finalResult = finalResult[Environment.SymbolBuffer];
          }

          if (typeof finalResult === "object" && !Buffer.isBuffer(finalResult)) {
            if (finalResult && typeof finalResult.pipe === "function") {
              finalResult.pipe(res);
            } else {
              res.json(finalResult);
            }
          } else {
            res.send(finalResult);
          }
        }
      } catch (err) {
        next(err);
      }
    });

    // Cache options
    const cacheOptions = {
      enabled: options.cache?.enabled ?? true,
      maxSize: options.cache?.maxSize ?? 1000,
      ttl: options.cache?.ttl ?? 300000,
      clearOnRestart: options.cache?.clearOnRestart ?? true,
      memoryLimit: options.cache?.memoryLimit ?? 100 * 1024 * 1024,
      ...options.cache,
    };

    // Static file handler with caching
    if (options.static) {
      app.use(async (req: Request, res: Response, next: NextFunction) => {
        if (req.method !== "GET" && req.method !== "HEAD") {
          return next();
        }

        const urlPath = decodeURIComponent(req.path);
        const sensitivePatterns = [
          /\.env/,
          /\.git/,
          /node_modules/,
          /package\.json/,
          /yarn\.lock/,
          /\.DS_Store/,
          /Thumbs\.db/,
        ];

        if (sensitivePatterns.some((pattern) => pattern.test(urlPath))) {
          return next();
        }

        let targetPath = path.join(staticOptions.root, urlPath || staticOptions.index);

        try {
          const stat = await fs.promises.stat(targetPath);

          if (stat.isDirectory()) {
            targetPath = path.join(targetPath, staticOptions.index);
            await fs.promises.access(targetPath);
          }

          // Cache check
          const cacheKey = `file:${targetPath}`;
          const cached = HttpServer.cache.get(cacheKey);

          if (cached && cacheOptions.enabled) {
            if (Date.now() - cached.timestamp < cacheOptions.ttl) {
              HttpServer.cacheStats.hits++;

              const ext = path.extname(targetPath).toLowerCase();
              const contentType = HttpServer.DEFAULT_MIME_TYPES[ext] || "application/octet-stream";

              res.setHeader("Content-Type", contentType);
              res.setHeader("Content-Length", String(cached.data.length));

              if (cached.etag) {
                res.setHeader("ETag", cached.etag);
              }

              if (options.static?.noCache) {
                res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
              } else if (options.static?.cacheControl) {
                res.setHeader("Cache-Control", options.static.cacheControl);
              } else {
                res.setHeader("Cache-Control", `public, max-age=${staticOptions.maxAge}`);
              }

              return res.send(cached.data);
            } else {
              HttpServer.cache.delete(cacheKey);
            }
          }

          HttpServer.cacheStats.misses++;

          const content = await fs.promises.readFile(targetPath);
          const ext = path.extname(targetPath).toLowerCase();
          const contentType = HttpServer.DEFAULT_MIME_TYPES[ext] || "application/octet-stream";
          const fileStat = await fs.promises.stat(targetPath);

          const lastModified = fileStat.mtime.toUTCString();
          const etag = staticOptions.etag ? generateETag(content) : undefined;

          if (cacheOptions.enabled && content.length < 1024 * 1024) {
            HttpServer.cache.set(cacheKey, {
              data: content,
              timestamp: Date.now(),
              ...(etag && { etag }),
            });
            HttpServer.cacheStats.size = HttpServer.cache.size;
          }

          res.setHeader("Content-Type", contentType);
          res.setHeader("Content-Length", String(content.length));

          if (etag) {
            res.setHeader("ETag", etag);
          }

          if (staticOptions.lastModified) {
            res.setHeader("Last-Modified", lastModified);
          }

          if (options.static?.noCache) {
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
          } else if (options.static?.cacheControl) {
            res.setHeader("Cache-Control", options.static.cacheControl);
          } else {
            res.setHeader("Cache-Control", `public, max-age=${staticOptions.maxAge}`);
          }

          res.send(content);
        } catch (err) {
          if (staticOptions.spa && req.method === "GET") {
            const indexPath = path.join(staticOptions.root, staticOptions.index);
            try {
              await fs.promises.access(indexPath);
              return res.sendFile(indexPath);
            } catch (spaErr) {
              next();
            }
          } else {
            next();
          }
        }
      });
    }

    // Cache cleanup
    if (cacheOptions.enabled) {
      const cacheCleanupInterval = setInterval(() => {
        this.pruneExpiredCache(cacheOptions.ttl);
        this.pruneCacheBySize(cacheOptions.maxSize);
        this.pruneCacheByMemory(cacheOptions.memoryLimit);
      }, 60000);

      process.on("exit", () => {
        clearInterval(cacheCleanupInterval);
        if (cacheOptions.clearOnRestart) {
          this.clearCache();
        }
      });
    }

    // Error handler (должен быть последним)
    app.use((err: any, __: Request, res: Response, next: NextFunction) => {
      console.error("Error:", err);

      if (res.headersSent) {
        return next(err);
      }

      res.status(err.status || 500).json({
        error: err.message || "Internal Server Error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
      });
    });

    // Graceful shutdown
    const setupGracefulShutdown = () => {
      const gracefulShutdown = () => {
        if (shuttingDown) return;

        shuttingDown = true;

        server?.close((err) => {
          if (err) {
            console.error("Error during server shutdown:", err);
            process.exit(1);
          }

          const shutdownTimeout = setTimeout(() => {
            for (const connection of activeConnections) {
              if (connection.destroy) {
                connection.destroy();
              }
            }
            process.exit(0);
          }, 10000);

          const checkConnections = () => {
            if (activeConnections.size === 0) {
              clearTimeout(shutdownTimeout);
              process.exit(0);
            } else {
              setTimeout(checkConnections, 100);
            }
          };

          checkConnections();
        });
      };

      process.on("SIGTERM", gracefulShutdown);
      process.on("SIGINT", gracefulShutdown);
      process.on("uncaughtException", (err) => {
        console.error("Uncaught exception:", err);
        gracefulShutdown();
      });
      process.on("unhandledRejection", (reason, promise) => {
        console.error("Unhandled rejection at:", promise, "reason:", reason);
        gracefulShutdown();
      });
    };

    // Validation functions
    const validateRoute = (pattern: string): void => {
      if (!pattern || typeof pattern !== "string") {
        throw this.throwErrorFormatters(new Error("Route pattern must be a non-empty string"));
      }
      if (!pattern.startsWith("/")) {
        throw this.throwErrorFormatters(new Error('Route pattern must start with "/"'));
      }
    };

    const validateHandler = (handler: any): void => {
      if (!handler || (typeof handler !== "function" && isTypeArgs(handler) !== "function")) {
        throw this.throwErrorFormatters(
          new Error("Route handler must be a function or HttpMethodBuilder"),
        );
      }
    };

    const clearCache = (pattern?: string | RegExp): number => {
      let cleared = 0;

      if (!pattern) {
        cleared = HttpServer.cache.size;
        HttpServer.cache.clear();
        HttpServer.cacheStats.size = 0;
      } else if (typeof pattern === "string") {
        const keys = Array.from(HttpServer.cache.keys());
        for (const key of keys) {
          if (key.includes(pattern)) {
            HttpServer.cache.delete(key);
            cleared++;
          }
        }
        HttpServer.cacheStats.size = HttpServer.cache.size;
      } else if (pattern instanceof RegExp) {
        const keys = Array.from(HttpServer.cache.keys());
        for (const key of keys) {
          if (pattern.test(key)) {
            HttpServer.cache.delete(key);
            cleared++;
          }
        }
        HttpServer.cacheStats.size = HttpServer.cache.size;
      }

      return cleared;
    };

    return {
      get: class extends HttpMethodBuilder {
        override call() {
          const [pattern, handler] = this.args;
          validateRoute(pattern);
          validateHandler(handler);
          addRoute("GET", pattern, handler);
          return null;
        }
      },

      post: class extends HttpMethodBuilder {
        override call() {
          const [pattern, handler] = this.args;
          validateRoute(pattern);
          validateHandler(handler);
          addRoute("POST", pattern, handler);
          return null;
        }
      },

      put: class extends HttpMethodBuilder {
        override call() {
          const [pattern, handler] = this.args;
          validateRoute(pattern);
          validateHandler(handler);
          addRoute("PUT", pattern, handler);
          return null;
        }
      },

      patch: class extends HttpMethodBuilder {
        override call() {
          const [pattern, handler] = this.args;
          validateRoute(pattern);
          validateHandler(handler);
          addRoute("PATCH", pattern, handler);
          return null;
        }
      },

      delete: class extends HttpMethodBuilder {
        override call() {
          const [pattern, handler] = this.args;
          validateRoute(pattern);
          validateHandler(handler);
          addRoute("DELETE", pattern, handler);
          return null;
        }
      },

      head: class extends HttpMethodBuilder {
        override call() {
          const [pattern, handler] = this.args;
          validateRoute(pattern);
          validateHandler(handler);
          addRoute("HEAD", pattern, handler);
          return null;
        }
      },

      options: class extends HttpMethodBuilder {
        override call() {
          const [pattern, handler] = this.args;
          validateRoute(pattern);
          validateHandler(handler);
          addRoute("OPTIONS", pattern, handler);
          return null;
        }
      },

      all: class extends HttpMethodBuilder {
        override call() {
          const [pattern, handler] = this.args;
          validateRoute(pattern);
          validateHandler(handler);
          addRoute("ALL", pattern, handler);
          return null;
        }
      },

      use: class extends HttpMethodBuilder {
        override call() {
          const [middleware] = this.args;
          if (typeof middleware !== "function" && isTypeArgs(middleware) !== "function") {
            throw this.throwErrorFormatters(new Error("Middleware must be a function"));
          }

          middlewares.push(middleware);
          return null;
        }
      },

      cors: class extends HttpMethodBuilder {
        override call() {
          const [corsOptions] = this.args;
          app.use((req: Request, res: Response, next: NextFunction) => {
            const origin = req.headers.origin;

            let allowOrigin: string = "*";
            if (typeof corsOptions.origin === "function") {
              allowOrigin = corsOptions.origin(origin) ? origin || "*" : "null";
            } else if (typeof corsOptions.origin === "string") {
              allowOrigin = corsOptions.origin;
            }

            res.setHeader("Access-Control-Allow-Origin", allowOrigin);
            res.setHeader(
              "Access-Control-Allow-Methods",
              (corsOptions.methods || ["GET", "POST", "PUT", "DELETE", "OPTIONS"]).join(", "),
            );
            res.setHeader(
              "Access-Control-Allow-Headers",
              (corsOptions.allowedHeaders || ["Content-Type", "Authorization"]).join(", "),
            );

            if (corsOptions.credentials) {
              res.setHeader("Access-Control-Allow-Credentials", "true");
            }

            if (corsOptions.exposedHeaders?.length) {
              res.setHeader("Access-Control-Expose-Headers", corsOptions.exposedHeaders.join(", "));
            }

            if (corsOptions.maxAge) {
              res.setHeader("Access-Control-Max-Age", String(corsOptions.maxAge));
            }

            if (req.method === "OPTIONS") {
              return res.sendStatus(204);
            }

            return next();
          });
        }
      },

      rateLimit: class extends HttpMethodBuilder {
        override call() {
          const [rateLimitOptions = {}] = this.args;
          const windowMs = rateLimitOptions.windowMs ?? 60000;
          const max = rateLimitOptions.max ?? 60;
          const store = new Map<string, RateLimitEntry>();

          const cleanupInterval = setInterval(() => {
            const now = Date.now();
            for (const [key, entry] of store.entries()) {
              if (entry.expires < now) {
                store.delete(key);
              }
            }
          }, windowMs);

          process.on("exit", () => clearInterval(cleanupInterval));

          app.use((req: Request, res: Response, next: NextFunction) => {
            const key = rateLimitOptions.keyGenerator
              ? rateLimitOptions.keyGenerator(createContext(req, res))
              : req.ip || "unknown";

            const now = Date.now();
            const record = store.get(key);

            if (!record || record.expires < now) {
              store.set(key, {
                count: 1,
                expires: now + windowMs,
                resetTime: now + windowMs,
              });
            } else {
              record.count++;
              if (record.count > max) {
                res.setHeader("X-RateLimit-Limit", String(max));
                res.setHeader("X-RateLimit-Remaining", "0");
                res.setHeader("X-RateLimit-Reset", String(Math.ceil(record.resetTime / 1000)));

                return res.status(429).json({
                  error: "Too Many Requests",
                  retryAfter: Math.ceil((record.resetTime - now) / 1000),
                });
              }
            }

            const currentRecord = store.get(key)!;
            res.setHeader("X-RateLimit-Limit", String(max));
            res.setHeader("X-RateLimit-Remaining", String(Math.max(0, max - currentRecord.count)));
            res.setHeader("X-RateLimit-Reset", String(Math.ceil(currentRecord.resetTime / 1000)));

            return next();
          });

          return null;
        }
      },

      clearCache: class extends HttpMethodBuilder {
        override call() {
          const [pattern] = this.args;
          return clearCache(pattern);
        }
      },

      cacheStats: class extends HttpMethodBuilder {
        override call() {
          return HttpServer.cacheStats;
        }
      },

      static: class extends HttpMethodBuilder {
        override call() {
          const [root, config] = this.args;

          if (root) {
            staticOptions.root = validatePath(root);
            ensureStaticDirectory(staticOptions.root ?? root);
          }

          if (config && typeof config === "object") {
            if (config.index) staticOptions.index = config.index;
            if (typeof config.maxAge === "number")
              staticOptions.maxAge = Math.max(0, config.maxAge);
            if (typeof config.spa === "boolean") staticOptions.spa = config.spa;
            if (config.dotfiles && ["allow", "deny", "ignore"].includes(config.dotfiles)) {
              staticOptions.dotfiles = config.dotfiles;
            }
            if (typeof config.etag === "boolean") staticOptions.etag = config.etag;
            if (typeof config.lastModified === "boolean")
              staticOptions.lastModified = config.lastModified;
          }

          return null;
        }
      },

      listen: class extends HttpMethodBuilder {
        override call() {
          let [port = options.port || 3000, host = options.host || "0.0.0.0", callback] = this.args;

          if (isTypeArgs(callback) !== "function" && isTypeArgs(host) === "function") {
            callback = host;
            host = "0.0.0.0";
          }

          if (server) {
            throw this.throwErrorFormatters(new Error("Server is already listening"));
          }

          try {
            if (options.key && options.cert) {
              server = https.createServer(
                {
                  key: options.key,
                  cert: options.cert,
                },
                app,
              );
            } else {
              server = http.createServer(app);
            }

            if (options.keepAliveTimeout) {
              server.keepAliveTimeout = options.keepAliveTimeout;
            }

            if (options.timeout) {
              server.timeout = options.timeout;
            }

            server.on("error", (err: any) => {
              console.error("Server error:", err);
              if (err.code === "EADDRINUSE") {
                console.error(`Port ${port} is already in use`);
              } else if (err.code === "EACCES") {
                console.error(`Permission denied to bind to port ${port}`);
              }
              process.exit(1);
            });

            server.on("clientError", (err, socket) => {
              console.error("Client error:", err);
              if (!socket.destroyed) {
                socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
              }
            });

            server.listen(port, host, () => {
              const address = server?.address();
              const actualPort = typeof address === "object" && address ? address.port : port;
              const protocol = options.key && options.cert ? "https" : "http";

              if (isTypeArgs(callback) === "function") {
                this.executeCallback(callback, [{ port: actualPort, host, protocol }]);
              }
            });

            setupGracefulShutdown();
          } catch (err) {
            console.error("Failed to start server:", err);
            throw err;
          }

          return null;
        }
      },

      close: class extends HttpMethodBuilder {
        override call() {
          const [callback] = this.args;

          if (!server) {
            if (isTypeArgs(callback) === "function") {
              this.executeCallback(callback, [false]);
            }
            return false;
          }

          shuttingDown = true;

          server.close((err) => {
            const success = !err;
            server = null;
            shuttingDown = false;

            if (err) {
              console.error("Error closing server:", err);
            }

            if (isTypeArgs(callback) === "function") {
              this.executeCallback(callback, [success, err]);
            }
          });

          return true;
        }
      },

      info: class extends HttpMethodBuilder {
        override call() {
          const address = server?.address();
          return {
            listening: !!server && server.listening,
            address: address,
            connections: connectionCount,
            shuttingDown,
            static: staticOptions,
            cache: HttpServer.cacheStats,
          };
        }
      },

      [Environment.SymbolFormatedText]: `Server ${JSON.stringify(
        {
          listening: !!server && (server as any).listening,
          address: (server as any)?.address() || null,
          connections: connectionCount,
          shuttingDown,
          static: staticOptions,
        },
        null,
        2,
      )}`,
    };
  }

  private validateOptions(options: ServerOptions): void {
    if (
      options.port &&
      (typeof options.port !== "number" || options.port < 1 || options.port > 65535)
    ) {
      throw this.throwErrorFormatters(new Error("Port must be a number between 1 and 65535"));
    }

    if (options.bodyLimit && (typeof options.bodyLimit !== "number" || options.bodyLimit < 0)) {
      throw this.throwErrorFormatters(new Error("bodyLimit must be a positive number"));
    }

    if (options.timeout && (typeof options.timeout !== "number" || options.timeout < 0)) {
      throw this.throwErrorFormatters(new Error("timeout must be a positive number"));
    }

    if (
      options.maxConnections &&
      (typeof options.maxConnections !== "number" || options.maxConnections < 1)
    ) {
      throw this.throwErrorFormatters(new Error("maxConnections must be a positive number"));
    }
  }

  private pruneExpiredCache(ttl: number): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of HttpServer.cache.entries()) {
      if (now - entry.timestamp > ttl) {
        HttpServer.cache.delete(key);
        removed++;
      }
    }

    HttpServer.cacheStats.size = HttpServer.cache.size;
    return removed;
  }

  private pruneCacheBySize(maxSize: number): number {
    if (HttpServer.cache.size <= maxSize) return 0;

    const entries = Array.from(HttpServer.cache.entries()).sort(
      (a, b) => a[1].timestamp - b[1].timestamp,
    );

    const toRemove = HttpServer.cache.size - maxSize;
    let removed = 0;

    for (let i = 0; i < toRemove && i < entries.length; i++) {
      HttpServer.cache.delete(entries[i]![0]);
      removed++;
    }

    HttpServer.cacheStats.size = HttpServer.cache.size;
    return removed;
  }

  private getCacheMemoryUsage(): number {
    let totalSize = 0;
    for (const [key, entry] of HttpServer.cache.entries()) {
      totalSize += Buffer.byteLength(key, "utf8") + entry.data.length;
    }
    return totalSize;
  }

  private pruneCacheByMemory(memoryLimit: number): number {
    const currentMemory = this.getCacheMemoryUsage();
    if (currentMemory <= memoryLimit) return 0;

    const entries = Array.from(HttpServer.cache.entries()).sort(
      (a, b) => a[1].timestamp - b[1].timestamp,
    );

    let removedMemory = 0;
    let removed = 0;

    for (const [key, entry] of entries) {
      if (currentMemory - removedMemory <= memoryLimit) break;

      removedMemory += Buffer.byteLength(key, "utf8") + entry.data.length;
      HttpServer.cache.delete(key);
      removed++;
    }

    HttpServer.cacheStats.size = HttpServer.cache.size;
    return removed;
  }

  private clearCache(): void {
    HttpServer.cache.clear();
    HttpServer.cacheStats = { hits: 0, misses: 0, size: 0 };
  }
}

export { HttpServer };
