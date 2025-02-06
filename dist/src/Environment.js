"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Environment = void 0;
const BaseError_1 = require("./errors/BaseError");
class Environment {
    parent;
    values = {};
    optionsVar = {};
    static SymbolEnum = Symbol("SymbolEnum");
    constructor(env) {
        if (env) {
            this.parent = env;
        }
    }
    create(key, value, options) {
        if (this.values.hasOwnProperty(key)) {
            throw new BaseError_1.BaseError(`${key} has been initialized`, {
                files: this.values["import"]?.paths ??
                    this.parent?.values["import"]?.paths ??
                    [],
            });
        }
        if (options) {
            this.optionsVar[key] = options;
        }
        this.values[key] = value;
    }
    update(key, value) {
        const matchedEnvironment = this.getEnvironmentWithKey(key);
        if (!matchedEnvironment) {
            throw new BaseError_1.BaseError(`${key} hasn't been defined`, {
                files: this.values["import"]?.paths ??
                    this.parent?.values["import"]?.paths ??
                    [],
            });
        }
        matchedEnvironment.values = {
            ...matchedEnvironment.values,
            [key]: value,
        };
    }
    get(key) {
        const matchedEnvironment = this.getEnvironmentWithKey(key);
        if (!matchedEnvironment) {
            throw new BaseError_1.BaseError(`${key} is not defined`, {
                files: this.values["import"]?.paths ??
                    this.parent?.values["import"]?.paths ??
                    [],
            });
        }
        return matchedEnvironment.values[key];
    }
    has(key) {
        if (this.values.hasOwnProperty(key)) {
            return true;
        }
        return false;
    }
    clone() {
        const newEnv = new Environment();
        newEnv.values = { ...this.values };
        newEnv.optionsVar = { ...this.optionsVar };
        if (this.parent) {
            newEnv.parent = this.parent.clone();
        }
        return newEnv;
    }
    getRootEnv() {
        let currentEnvironment = this;
        while (currentEnvironment.parent) {
            currentEnvironment = currentEnvironment.parent;
        }
        return currentEnvironment;
    }
    getEnvironmentWithKey(key) {
        if (this.values.hasOwnProperty(key)) {
            return this;
        }
        let currentEnvironment = this.parent;
        while (currentEnvironment) {
            if (currentEnvironment.values.hasOwnProperty(key)) {
                return currentEnvironment;
            }
            currentEnvironment = currentEnvironment.parent;
        }
        return null;
    }
}
exports.Environment = Environment;
