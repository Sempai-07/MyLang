"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.symbol = void 0;
exports.Iterator = Iterator;
const index_1 = require("../utils/index");
const BaseError_1 = require("../../../errors/BaseError");
function Iterator([collection]) {
    if ((0, index_1.typeOf)([collection]) === "array") {
        let index = 0;
        return {
            next: function () {
                if (index < collection.length) {
                    return { value: collection[index++], done: false };
                }
                return { value: null, done: true };
            },
            *[Symbol.iterator]() {
                for (const value of collection) {
                    yield value;
                }
            },
        };
    }
    if ((0, index_1.typeOf)([collection]) === "object") {
        let index = 0;
        const keys = Object.keys(collection);
        return {
            next: function () {
                if (index < keys.length) {
                    let key = keys[index++];
                    return {
                        value: { key, value: collection[key] },
                        done: false,
                    };
                }
                return { value: null, done: true };
            },
            *[Symbol.iterator]() {
                for (const key of keys) {
                    yield { key, value: collection[key] };
                }
            },
        };
    }
    throw new BaseError_1.BaseError("Unsupported type for iteration", {
        files: [`mylang:iter (${__filename})`],
    });
}
const symbol = Symbol.iterator;
exports.symbol = symbol;
