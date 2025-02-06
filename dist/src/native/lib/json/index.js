"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = parse;
exports.stringify = stringify;
function parse([string]) {
    return JSON.parse(string);
}
function stringify([obj]) {
    return JSON.stringify(obj);
}
