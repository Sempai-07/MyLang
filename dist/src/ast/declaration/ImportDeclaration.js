"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportDeclaration = void 0;
const tslib_1 = require("tslib");
const request_sync_1 = tslib_1.__importDefault(require("request-sync"));
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const StmtType_1 = require("../StmtType");
const BaseError_1 = require("../../errors/BaseError");
const ExportsDeclaration_1 = require("./ExportsDeclaration");
const utils_1 = require("../../utils/utils");
class ImportDeclaration extends StmtType_1.StmtType {
    position;
    expression;
    destructuring;
    package;
    constructor(packageName, destructuring, expression, position) {
        super();
        this.package = packageName;
        this.destructuring = destructuring;
        this.expression = expression;
        this.position = position;
    }
    static get buildInLibs() {
        return [
            "coreio",
            "os",
            "os/exec",
            "fs",
            "buffers",
            "strings",
            "numbers",
            "numbers/bigint",
            "arrays",
            "objects",
            "math",
            "events",
            "timers",
            "ds",
            "time",
            "dotenv",
            "utils",
            "https",
            "json",
            "errors",
            "iter",
            "path",
            "module",
        ];
    }
    resolveJSONModule(source, score) {
        const fullPath = (0, node_path_1.join)(score.get("import").base, source);
        if (score.get("import").cache[fullPath] &&
            !score.get("#options").disableCache)
            return score.get("import").cache[fullPath];
        try {
            const json = JSON.parse((0, node_fs_1.readFileSync)(fullPath, "utf8"));
            score.update("import", {
                ...score.get("import"),
                ...(!score.get("#options").disableCache && {
                    cache: {
                        ...score.get("import").cache,
                        [fullPath]: json,
                    },
                }),
                paths: Array.from(new Set([score.get("import").main, ...score.get("import").paths])),
            });
            return json;
        }
        catch (err) {
            throw new BaseError_1.FileReadFaild(`JSON module: ${String(err)
                .split(":")
                .slice(1)
                .join("")
                .trim()
                .toLowerCase()}`, fullPath, score.get("import").paths);
        }
    }
    resolveHTTPModule(url, score) {
        if (score.get("import").cache[url] && !score.get("#options").disableCache) {
            return score.get("import").cache[url];
        }
        const options = {
            url,
            method: "GET",
        };
        const res = (0, request_sync_1.default)(options);
        if (res.statusCode !== 200) {
            throw new BaseError_1.ImportFaildError(`HTTP import status: ${res.statusCode}`, {
                code: "IMPORT_HTTP_FAILD",
                cause: {
                    url,
                    statusCode: res.statusCode,
                },
                files: score.get("import").paths,
            });
        }
        const responseData = res.body.toString("utf8");
        if (responseData.startsWith("Error:")) {
            throw responseData;
        }
        if ((0, node_path_1.parse)(url).ext === ".json") {
            try {
                const json = JSON.parse(responseData);
                score.update("import", {
                    ...score.get("import"),
                    ...(!score.get("#options").disableCache && {
                        cache: {
                            ...score.get("import").cache,
                            [url]: json,
                        },
                    }),
                    paths: Array.from(new Set([score.get("import").main, ...score.get("import").paths])),
                });
                return json;
            }
            catch (err) {
                throw new BaseError_1.ImportFaildError(`dynamic load JSON module: ${err}`, {
                    code: "IMPORT_HTTP_JSON_FAILD",
                    cause: {
                        url,
                        statusCode: res.statusCode,
                    },
                    files: score.get("import").paths,
                });
            }
        }
        else {
            try {
                const context = (0, utils_1.run)(responseData, {
                    base: score.get("import").base,
                    main: url,
                    ...(!score.get("#options").disableCache && {
                        cache: {
                            ...score.get("import").cache,
                            [url]: score.get("#exports"),
                        },
                    }),
                    paths: Array.from(new Set([score.get("import").main, ...score.get("import").paths])),
                    options: score.get("#options"),
                });
                const expModule = {};
                const contextExports = context.interpreter.globalScore.get("#exports");
                for (const key in contextExports) {
                    if (contextExports[key]?.[ExportsDeclaration_1.exportSymbol]) {
                        expModule[key] = contextExports[key].value;
                    }
                    else {
                        expModule[key] = contextExports[key];
                    }
                }
                score.update("import", {
                    ...score.get("import"),
                    ...(!score.get("#options").disableCache && {
                        cache: {
                            ...score.get("import").cache,
                            [url]: expModule,
                        },
                    }),
                    paths: Array.from(new Set([url, ...score.get("import").paths])),
                });
                return context.interpreter.globalScore.get("#exports");
            }
            catch (err) {
                throw new BaseError_1.ImportFaildError(`dynamic load module: ${"message" in err ? err.message : err}`, {
                    code: "IMPORT_HTTP_FAILD",
                    cause: {
                        url,
                        statusCode: res.statusCode,
                    },
                    files: score.get("import").paths,
                });
            }
        }
    }
    resolveBuildInModule(source, score) {
        if (score.get("import").cache[source] &&
            !score.get("#options").disableCache)
            return score.get("import").cache[source];
        const resolvePackage = require(`../../native/lib/${source}/index`);
        score.update("import", {
            ...score.get("import"),
            ...(!score.get("#options").disableCache && {
                cache: {
                    ...score.get("import").cache,
                    [source]: resolvePackage,
                },
            }),
            paths: Array.from(new Set([score.get("import").main, ...score.get("import").paths])),
        });
        return resolvePackage;
    }
    resolveFileModule(source, score) {
        const fullPath = (0, node_path_1.join)(score.get("import").base, source);
        if (score.get("import").cache[fullPath] &&
            !score.get("#options").disableCache)
            return score.get("import").cache[fullPath];
        if (!(0, node_fs_1.existsSync)(fullPath)) {
            throw new BaseError_1.ImportFaildError(`no such file: ${fullPath}`, {
                code: "IMPORT_FILE_FAILD",
                cause: {
                    fullPath,
                },
                files: score.get("import").paths,
            });
        }
        try {
            const content = (0, node_fs_1.readFileSync)(fullPath, "utf8").toString();
            const context = (0, utils_1.run)(content, {
                base: score.get("import").base,
                main: fullPath,
                ...(!score.get("#options").disableCache && {
                    cache: {
                        ...score.get("import").cache,
                        [fullPath]: score.get("#exports"),
                    },
                }),
                paths: Array.from(new Set([score.get("import").main, ...score.get("import").paths])),
                options: score.get("#options"),
            });
            const expModule = {};
            const contextExports = context.interpreter.globalScore.get("#exports");
            for (const key in contextExports) {
                if (contextExports[key]?.[ExportsDeclaration_1.exportSymbol]) {
                    expModule[key] = contextExports[key].value;
                }
                else {
                    expModule[key] = contextExports[key];
                }
            }
            score.update("import", {
                ...score.get("import"),
                ...(!score.get("#options").disableCache && {
                    cache: {
                        ...score.get("import").cache,
                        [fullPath]: expModule,
                    },
                }),
                paths: Array.from(new Set([score.get("import").main, ...score.get("import").paths])),
            });
            return context.interpreter.globalScore.get("#exports");
        }
        catch (err) {
            throw new BaseError_1.ImportFaildError(`${"message" in err ? err.message : err}`, {
                code: "IMPORT_FILE_RUN_FAILD",
                cause: {
                    fullPath,
                },
                files: score.get("import").paths,
            });
        }
    }
    resolvePackageModule(source, score) {
        if (score.get("import").cache[source] &&
            !score.get("#options").disableCache)
            return score.get("import").cache[source];
        const myLangJSON = JSON.parse((0, node_fs_1.readFileSync)((0, node_path_1.join)(score.get("import").base, "mylang.json")).toString());
        const dependenciesSource = myLangJSON.dependencies[source.split(":")[1]];
        if (!dependenciesSource) {
            throw new BaseError_1.ImportFaildError(`No resolve module: "${source}"`, {
                code: "IMPORT_MODULE_FAILD",
                cause: {
                    packageName: source,
                },
                files: score.get("import").paths,
            });
        }
        const runFileSource = (0, node_path_1.join)(score.get("import").base, ".module", source.replace(":", "/"), myLangJSON.main);
        if (!(0, node_fs_1.existsSync)(runFileSource)) {
            throw new BaseError_1.ImportFaildError(`File main "${runFileSource}" not found`, {
                code: "IMPORT_FILE_RUN_FAILD",
                cause: {
                    fullPath: runFileSource,
                },
                files: score.get("import").paths,
            });
        }
        const runLibSource = (0, node_path_1.join)(score.get("import").base, ".module", source);
        const context = (0, utils_1.run)((0, node_fs_1.readFileSync)(runFileSource).toString(), {
            base: (0, node_path_1.join)(score.get("import").base, ".module", source.replace(":", "/")),
            main: runLibSource,
            ...(!score.get("#options").disableCache && {
                cache: {
                    ...score.get("import").cache,
                    [source]: score.get("#exports"),
                },
            }),
            paths: Array.from(new Set([score.get("import").main, ...score.get("import").paths])),
            options: score.get("#options"),
        });
        const expModule = {};
        const contextExports = context.interpreter.globalScore.get("#exports");
        for (const key in contextExports) {
            if (contextExports[key]?.[ExportsDeclaration_1.exportSymbol]) {
                expModule[key] = contextExports[key].value;
            }
            else {
                expModule[key] = contextExports[key];
            }
        }
        score.update("import", {
            ...score.get("import"),
            ...(!score.get("#options").disableCache && {
                cache: {
                    ...score.get("import").cache,
                    [source]: expModule,
                },
            }),
            paths: Array.from(new Set([source, ...score.get("import").paths])),
        });
        return context.interpreter.globalScore.get("#exports");
    }
    handleModuleImport(module, name, score) {
        if (this.expression)
            return module;
        if (!score.get("#options").disableCache) {
            if (this.destructuring) {
                for (const key of this.destructuring) {
                    if (!(key in module)) {
                        throw new BaseError_1.ImportFaildError(`The key '${key}' is not in the object.`, {
                            code: "IMPORT_DESTRUCTURING_FAILD",
                            cause: {
                                key,
                            },
                            files: score.get("import").paths,
                        });
                    }
                    if (module[key]?.[ExportsDeclaration_1.exportSymbol]) {
                        score.create(key, module[key].value, module[key].optionsVar);
                    }
                    else
                        score.create(key, module[key]);
                }
            }
            else {
                const expModule = {};
                for (const key in module) {
                    if (module[key]?.[ExportsDeclaration_1.exportSymbol]) {
                        expModule[key] = module[key].value;
                    }
                    else
                        expModule[key] = module[key];
                }
                score.create(name, expModule);
                return expModule;
            }
        }
    }
    evaluateSinglePackage(packageName, score) {
        const { ext, dir, base, name } = (0, node_path_1.parse)(packageName);
        const fullPath = (0, node_path_1.join)(dir, base);
        if (packageName.startsWith("http://") ||
            packageName.startsWith("https://")) {
            return this.handleModuleImport(this.resolveHTTPModule(packageName, score), name, score);
        }
        if (ext === ".json") {
            return this.handleModuleImport(this.resolveJSONModule(fullPath, score), name, score);
        }
        if (ext === "" && ImportDeclaration.buildInLibs.includes(packageName)) {
            return this.handleModuleImport(this.resolveBuildInModule(fullPath, score), packageName.includes("/") ? packageName.split("/")[1] : packageName, score);
        }
        if (ext === ".ml") {
            return this.handleModuleImport(this.resolveFileModule(fullPath, score), name, score);
        }
        if (packageName.split(":")[1]) {
            return this.handleModuleImport(this.resolvePackageModule(packageName, score), packageName.split(":")[1], score);
        }
        throw new BaseError_1.ImportFaildError(`Cannot find module: "${name}"`, {
            code: "IMPORT_MODULE_FAILD",
            cause: {
                packageName: name,
            },
            files: score.get("import").paths,
        });
    }
    evaluateMultiplePackages(score) {
        const packages = {};
        for (const [packageName, packageStmt] of Object.entries(this.package)) {
            const resolvePath = packageStmt instanceof StmtType_1.StmtType
                ? packageStmt.evaluate(score)
                : packageStmt;
            const { ext, base, name } = (0, node_path_1.parse)(resolvePath);
            if (resolvePath.startsWith("http://") ||
                resolvePath.startsWith("https://")) {
                packages[packageName] = this.resolveHTTPModule(resolvePath, score);
            }
            else if (ext === ".json") {
                packages[packageName] = this.resolveJSONModule(base, score);
            }
            else if (ImportDeclaration.buildInLibs.includes(name)) {
                packages[packageName] = this.resolveBuildInModule(base, score);
            }
            else if (ext === ".ml") {
                packages[packageName] = this.resolveFileModule(base, score);
            }
            else {
                throw new BaseError_1.ImportFaildError(`No such built-in module: "${packageName}"`, {
                    code: "IMPORT_MODULE_FAILD",
                    cause: {
                        packageName,
                    },
                    files: score.get("import").paths,
                });
            }
            score.create(packageName, packages[packageName]);
        }
        return this.expression ? packages : null;
    }
    evaluate(score) {
        if (typeof this.package === "string") {
            return this.evaluateSinglePackage(this.package, score);
        }
        else {
            return this.evaluateMultiplePackages(score);
        }
    }
}
exports.ImportDeclaration = ImportDeclaration;
