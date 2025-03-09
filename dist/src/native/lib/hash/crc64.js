"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CRC64 = CRC64;
const index_1 = require("../buffers/index");
const symbol_1 = require("../buffers/symbol");
const POLY = BigInt("0x42F0E1EBA9EA3693");
const INIT = BigInt("0xFFFFFFFFFFFFFFFF");
function crc64(data, checksum) {
    for (let i = 0; i < data.length; i++) {
        checksum ^= BigInt(data[i]) << BigInt(56);
        for (let j = 0; j < 8; j++) {
            if (checksum & BigInt(0x8000000000000000)) {
                checksum = (checksum << BigInt(1)) ^ POLY;
            }
            else {
                checksum <<= BigInt(1);
            }
        }
    }
    return checksum;
}
function CRC64() {
    let checksum = INIT;
    return {
        write: function ([data]) {
            if ((0, index_1.is)([data])) {
                checksum = crc64(new Uint8Array(data[symbol_1.BufferData]), checksum);
                return;
            }
            checksum = crc64(new Uint8Array(Buffer.from(data)), checksum);
        },
        sum: function () {
            const result = new Uint8Array(8);
            new DataView(result.buffer).setBigUint64(0, checksum, false);
            return (0, index_1.from)([result]);
        },
        reset: function () {
            checksum = INIT;
        },
        size: function () {
            return 8;
        },
    };
}
