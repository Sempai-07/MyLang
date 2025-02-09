"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportDeclaration = void 0;
const tslib_1 = require("tslib");
const request_sync_1 = tslib_1.__importDefault(require("request-sync"));
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const StmtType_1 = require("../StmtType");
const BaseError_1 = require("../../errors/BaseError");
const utils_1 = require("../../utils/utils");
class ImportDeclaration extends StmtType_1.StmtType {
    position;
    expression;
    package;
    constructor(packageName, expression, position) {
        super();
        this.package = packageName;
        this.expression = expression;
        this.position = position;
    }
    get buildInLibs() {
        return [
            "coreio",
            "fs",
            "buffers",
            "strings",
            "numbers",
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
                cache: {
                    ...score.get("import").cache,
                    [fullPath]: json,
                },
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
                    cache: {
                        ...score.get("import").cache,
                        [url]: json,
                    },
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
                    cache: {
                        ...score.get("import").cache,
                        [url]: score.get("#exports"),
                    },
                    paths: Array.from(new Set([score.get("import").main, ...score.get("import").paths])),
                    options: score.get("#options"),
                });
                score.update("import", {
                    ...score.get("import"),
                    cache: {
                        ...score.get("import").cache,
                        [url]: responseData,
                    },
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
            cache: {
                ...score.get("import").cache,
                [source]: resolvePackage,
            },
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
                cache: {
                    ...score.get("import").cache,
                    [fullPath]: score.get("#exports"),
                },
                paths: Array.from(new Set([score.get("import").main, ...score.get("import").paths])),
                options: score.get("#options"),
            });
            score.update("import", {
                ...score.get("import"),
                cache: {
                    ...score.get("import").cache,
                    [fullPath]: context.interpreter.globalScore.get("#exports"),
                },
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
    handleModuleImport(module, name, score) {
        if (this.expression)
            return module;
        if (!score.get("#options").disableCache)
            score.create(name, module);
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
        if (ext === "" && this.buildInLibs.includes(name)) {
            return this.handleModuleImport(this.resolveBuildInModule(fullPath, score), name, score);
        }
        if (ext === ".ml") {
            return this.handleModuleImport(this.resolveFileModule(fullPath, score), name, score);
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
            const resolvePath = packageStmt.evaluate(score);
            const { ext, base, name } = (0, node_path_1.parse)(resolvePath);
            if (resolvePath.startsWith("http://") ||
                resolvePath.startsWith("https://")) {
                packages[packageName] = this.resolveHTTPModule(resolvePath, score);
            }
            else if (ext === ".json") {
                packages[packageName] = this.resolveJSONModule(base, score);
            }
            else if (this.buildInLibs.includes(name)) {
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
