"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bytes = Bytes;
exports.from = from;
exports.compare = compare;
exports.is = is;
const node_buffer_1 = require("node:buffer");
const utils_1 = require("../../utils");
const symbol_1 = require("./symbol");
const BaseError_1 = require("../../../errors/BaseError");
function Bytes([initialSize] = [64]) {
    let data = node_buffer_1.Buffer.allocUnsafe(initialSize);
    let length = 0;
    let offset = 0;
    function ensureCapacity(minCapacity) {
        if (minCapacity > data.length) {
            let newCapacity = Math.max(data.length * 2, minCapacity);
            const newBuffer = node_buffer_1.Buffer.allocUnsafe(newCapacity);
            data.copy(newBuffer, 0, offset, length);
            data = newBuffer;
            length -= offset;
            offset = 0;
        }
    }
    return {
        write: function ([input]) {
            ensureCapacity(length + input.length);
            node_buffer_1.Buffer.from(input).copy(data, length);
            length += input.length;
        },
        read: function () {
            return from([data.subarray(offset, length)]);
        },
        readBytes: function ([n]) {
            const end = Math.min(offset + n, length);
            const chunk = data.subarray(offset, end);
            offset = end;
            return from([chunk]);
        },
        truncate: function ([n]) {
            if (n < 0 || n > length - offset) {
                throw new BaseError_1.ArgumentsError("out of range", [
                    `mylang:buffers (${__filename})`,
                ]);
            }
            length = offset + n;
        },
        clear: function () {
            offset = 0;
            length = 0;
        },
        reset: function () {
            offset = 0;
            length = 0;
            data = node_buffer_1.Buffer.allocUnsafe(data.length);
        },
        writeString: function ([str, encoding = "utf8"]) {
            const input = node_buffer_1.Buffer.from(str, encoding);
            ensureCapacity(length + input.length);
            input.copy(data, length);
            length += input.length;
        },
        toString: function ([encoding = "utf8"] = ["utf8"]) {
            return data.toString(encoding, offset, length);
        },
        grow: function ([n]) {
            if (n < 0) {
                throw new BaseError_1.ArgumentsError("negative size", [
                    `mylang:buffers (${__filename})`,
                ]);
            }
            ensureCapacity(length + n);
            length += n;
        },
        len: function () {
            return length - offset;
        },
        cap: function () {
            return data.length;
        },
        bytes: function () {
            return data.subarray(offset, length);
        },
        writeTo: function ([target]) {
            const chunk = data.subarray(offset, length);
            if (!(0, utils_1.isFunctionNode)(target)) {
                throw new BaseError_1.FunctionCallError("Invalid callback. Must be a FunctionDeclaration or FunctionExpression.", [`mylang:arrays (${__filename})`]);
            }
            target.call([{ value: chunk }]);
            offset = length;
            return chunk.length;
        },
        [symbol_1.BufferCustom]: true,
        [symbol_1.BufferData]: node_buffer_1.Buffer.from(data),
    };
}
function from([buffer]) {
    const bytes = Bytes();
    if (buffer instanceof Uint8Array || buffer instanceof node_buffer_1.Buffer) {
        bytes.write([buffer]);
        return bytes;
    }
    bytes.write([node_buffer_1.Buffer.from(buffer)]);
    return bytes;
}
function compare([a, b]) {
    if (!a?.[symbol_1.BufferCustom]) {
        throw new BaseError_1.ArgumentsError("The argument 'a' must be bytes", [
            `mylang:buffers (${__filename})`,
        ]);
    }
    if (!b?.[symbol_1.BufferCustom]) {
        throw new BaseError_1.ArgumentsError("The argument 'b' must be bytes", [
            `mylang:buffers (${__filename})`,
        ]);
    }
    return node_buffer_1.Buffer.compare(a[symbol_1.BufferData], b[symbol_1.BufferData]);
}
function is([buffer]) {
    return Boolean(buffer && buffer[symbol_1.BufferCustom]);
}
