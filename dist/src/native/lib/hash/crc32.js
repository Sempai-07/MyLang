"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CRC32 = CRC32;
const js_crc_1 = require("js-crc");
const index_1 = require("../buffers/index");
const symbol_1 = require("../buffers/symbol");
function CRC32() {
    let crc = js_crc_1.crc32.create();
    return {
        write: function ([data]) {
            if ((0, index_1.is)([data])) {
                crc.update(new Uint8Array(data[symbol_1.BufferData]));
                return;
            }
            crc.update(new Uint8Array(Buffer.from(data)));
        },
        sum: function () {
            return (0, index_1.from)([crc.array()]);
        },
        reset: function () {
            crc = js_crc_1.crc32.create();
        },
        size: function () {
            return 4;
        },
    };
}
