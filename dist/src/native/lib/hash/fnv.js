"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FNV1a = FNV1a;
const index_1 = require("../buffers/index");
const symbol_1 = require("../buffers/symbol");
const FNV_OFFSET = 0x811c9dc5;
const FNV_PRIME = 0x01000193;
function FNV1a() {
    let hash = FNV_OFFSET;
    return {
        write: function ([data]) {
            for (const byte of new Uint8Array((0, index_1.is)([data]) ? data[symbol_1.BufferData] : Buffer.from(data))) {
                hash ^= byte;
                hash *= FNV_PRIME;
            }
        },
        sum: function () {
            const result = new Uint8Array(4);
            new DataView(result.buffer).setUint32(0, hash, false);
            return (0, index_1.from)([result]);
        },
        reset: function () {
            hash = FNV_OFFSET;
        },
        size: function () {
            return 4;
        },
    };
}
