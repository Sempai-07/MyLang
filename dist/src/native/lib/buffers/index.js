"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BufferUtility = BufferUtility;
exports.BufferWrapper = BufferWrapper;
const node_buffer_1 = require("node:buffer");
const BaseError_1 = require("../../../errors/BaseError");
function BufferUtility() {
    return {
        from([input, encodingOrOffset, length]) {
            if (!input) {
                throw new BaseError_1.ArgumentsError("Input cannot be nil.", [
                    `mylang:buffers (${__filename})`,
                ]);
            }
            const arrayBufferLikeInput = typeof input === "string"
                ? new TextEncoder().encode(input).buffer
                : Array.isArray(input)
                    ? new Uint8Array(input).buffer
                    : input;
            return BufferWrapper([
                node_buffer_1.Buffer.from(arrayBufferLikeInput, encodingOrOffset, length),
            ]);
        },
        alloc([size, fill, encoding]) {
            if (typeof size !== "number" || size < 0) {
                throw new BaseError_1.ArgumentsError("Must be a non-negative number.", [
                    `mylang:buffers (${__filename})`,
                ]);
            }
            return BufferWrapper([node_buffer_1.Buffer.alloc(size, fill, encoding)]);
        },
        allocUnsafe([size]) {
            if (typeof size !== "number" || size < 0) {
                throw new BaseError_1.ArgumentsError("Must be a non-negative number.", [
                    `mylang:buffers (${__filename})`,
                ]);
            }
            return BufferWrapper([node_buffer_1.Buffer.allocUnsafe(size)]);
        },
        byteLength([string, encoding]) {
            if (typeof string !== "string" && !node_buffer_1.Buffer.isBuffer(string)) {
                throw new BaseError_1.ArgumentsError("Must be a string, BufferUtility.", [
                    `mylang:buffers (${__filename})`,
                ]);
            }
            return node_buffer_1.Buffer.byteLength(string, encoding);
        },
        compare([buf1, buf2]) {
            if (!node_buffer_1.Buffer.isBuffer(buf1) || !node_buffer_1.Buffer.isBuffer(buf2)) {
                throw new BaseError_1.ArgumentsError("Both arguments must be Buffers.", [
                    `mylang:buffers (${__filename})`,
                ]);
            }
            return node_buffer_1.Buffer.compare(buf1, buf2);
        },
        concat([list, totalLength]) {
            if (!Array.isArray(list) || !list.every(node_buffer_1.Buffer.isBuffer)) {
                throw new BaseError_1.ArgumentsError("Must be an array of Buffers.", [
                    `mylang:buffers (${__filename})`,
                ]);
            }
            return BufferWrapper([node_buffer_1.Buffer.concat(list, totalLength)]);
        },
        isBuffer([obj]) {
            return node_buffer_1.Buffer.isBuffer(obj);
        },
        toJSON([buffer]) {
            if (!node_buffer_1.Buffer.isBuffer(buffer)) {
                throw new BaseError_1.ArgumentsError("Must be a Buffer.", [
                    `mylang:buffers (${__filename})`,
                ]);
            }
            return buffer.toJSON();
        },
        write([buffer, string, offset, length, encoding]) {
            if (!node_buffer_1.Buffer.isBuffer(buffer)) {
                throw new BaseError_1.ArgumentsError("Must be a Buffer.", [
                    `mylang:buffers (${__filename})`,
                ]);
            }
            return buffer.write(string, offset ?? 0, length ?? string.length, encoding);
        },
        toString([buffer, encoding, start, end] = [node_buffer_1.Buffer.alloc(0)]) {
            if (!node_buffer_1.Buffer.isBuffer(buffer)) {
                throw new BaseError_1.ArgumentsError("Must be a BufferUtility.", [
                    `mylang:buffers (${__filename})`,
                ]);
            }
            return buffer.toString(encoding, start, end);
        },
        slice([buffer, start, end]) {
            if (!node_buffer_1.Buffer.isBuffer(buffer)) {
                throw new BaseError_1.ArgumentsError("Must be a BufferUtility.", [
                    `mylang:buffers (${__filename})`,
                ]);
            }
            return BufferWrapper([buffer.slice(start, end)]);
        },
        includes([buffer, value, byteOffset, encoding]) {
            if (!node_buffer_1.Buffer.isBuffer(buffer)) {
                throw new BaseError_1.ArgumentsError("Must be a BufferUtility.", [
                    `mylang:buffers (${__filename})`,
                ]);
            }
            return buffer.includes(value, byteOffset, encoding);
        },
        indexOf([buffer, value, byteOffset, encoding]) {
            if (!node_buffer_1.Buffer.isBuffer(buffer)) {
                throw new BaseError_1.ArgumentsError("Must be a BufferUtility.", [
                    `mylang:buffers (${__filename})`,
                ]);
            }
            return buffer.indexOf(value, byteOffset, encoding);
        },
        lastIndexOf([buffer, value, byteOffset, encoding]) {
            if (!node_buffer_1.Buffer.isBuffer(buffer)) {
                throw new BaseError_1.ArgumentsError("Must be a BufferUtility.", [
                    `mylang:buffers (${__filename})`,
                ]);
            }
            return buffer.lastIndexOf(value, byteOffset, encoding);
        },
        equals([buf1, buf2]) {
            if (!node_buffer_1.Buffer.isBuffer(buf1) || !node_buffer_1.Buffer.isBuffer(buf2)) {
                throw new BaseError_1.ArgumentsError("Both arguments must be Buffers.", [
                    `mylang:buffers (${__filename})`,
                ]);
            }
            return buf1.equals(buf2);
        },
    };
}
function BufferWrapper([buffer]) {
    buffer = node_buffer_1.Buffer.isBuffer(buffer) ? buffer : node_buffer_1.Buffer.from(buffer);
    if (!node_buffer_1.Buffer.isBuffer(buffer)) {
        throw new BaseError_1.ArgumentsError("Must be an instance of Buffer.", [
            `mylang:buffers (${__filename})`,
        ]);
    }
    return {
        toString([encoding, start, end] = []) {
            return buffer.toString(encoding, start, end);
        },
        slice([start, end]) {
            return BufferWrapper([buffer.slice(start, end)]);
        },
        write([string, offset, length, encoding]) {
            return buffer.write(string, offset, length, encoding);
        },
        includes([value, byteOffset, encoding]) {
            return buffer.includes(value, byteOffset, encoding);
        },
        indexOf([value, byteOffset, encoding]) {
            return buffer.indexOf(value, byteOffset, encoding);
        },
        lastIndexOf([value, byteOffset, encoding]) {
            return buffer.lastIndexOf(value, byteOffset, encoding);
        },
        equals([otherBuffer]) {
            if (!node_buffer_1.Buffer.isBuffer(otherBuffer)) {
                throw new BaseError_1.ArgumentsError("Must be an instance of Buffer.", [
                    `mylang:buffers (${__filename})`,
                ]);
            }
            return buffer.equals(otherBuffer);
        },
        toJSON() {
            return buffer.toJSON();
        },
        byteLength() {
            return buffer.length;
        },
    };
}
