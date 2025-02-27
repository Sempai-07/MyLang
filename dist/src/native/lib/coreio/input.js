"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.input = input;
const tslib_1 = require("tslib");
const node_fs_1 = tslib_1.__importDefault(require("node:fs"));
const node_process_1 = tslib_1.__importDefault(require("node:process"));
const newLine = "\n".charCodeAt(0);
const carriageReturn = "\r".charCodeAt(0);
function input([prompt]) {
    const fd = node_process_1.default.platform === "win32"
        ? node_process_1.default.stdin.fd
        : node_fs_1.default.openSync("/dev/stdin", "rs");
    let str = "";
    let character = 0;
    const buf = Buffer.alloc(1);
    if (prompt) {
        node_process_1.default.stdout.write(prompt);
    }
    while (true) {
        node_fs_1.default.readSync(fd, buf);
        character = buf[0];
        if (character === carriageReturn) {
            continue;
        }
        if (character === newLine) {
            node_fs_1.default.closeSync(fd);
            break;
        }
        str += String.fromCharCode(character);
    }
    return str;
}
