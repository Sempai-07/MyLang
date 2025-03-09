"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Adler32 = Adler32;
const adler_32_1 = require("adler-32");
const index_1 = require("../buffers/index");
const symbol_1 = require("../buffers/symbol");
function Adler32() {
    let checksum = 0;
    return {
        write: function ([data, seed]) {
            if ((0, index_1.is)([data])) {
                checksum = (0, adler_32_1.bstr)(data[symbol_1.BufferData].toString(), seed);
                return;
            }
            checksum = (0, adler_32_1.bstr)(Buffer.from(data).toString(), seed);
        },
        sum: function () {
            const result = new Uint8Array(4);
            new DataView(result.buffer).setUint32(0, checksum, false);
            return (0, index_1.from)([result]);
        },
        reset: function () {
            checksum = 0;
        },
        size: function () {
            return 4;
        },
    };
}
