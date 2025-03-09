"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FNV1a = exports.Adler32 = exports.CRC64 = exports.CRC32 = void 0;
exports.createHash = createHash;
const adler32_1 = require("./adler32");
Object.defineProperty(exports, "Adler32", { enumerable: true, get: function () { return adler32_1.Adler32; } });
const crc32_1 = require("./crc32");
Object.defineProperty(exports, "CRC32", { enumerable: true, get: function () { return crc32_1.CRC32; } });
const crc64_1 = require("./crc64");
Object.defineProperty(exports, "CRC64", { enumerable: true, get: function () { return crc64_1.CRC64; } });
const fnv_1 = require("./fnv");
Object.defineProperty(exports, "FNV1a", { enumerable: true, get: function () { return fnv_1.FNV1a; } });
const BaseError_1 = require("../../../errors/BaseError");
function createHash([data, algorithm, seed]) {
    switch (algorithm) {
        case "adler32":
            const adler32 = (0, adler32_1.Adler32)();
            if (seed) {
                adler32.write([data, seed]);
                return adler32;
            }
            adler32.write([data]);
            return adler32;
        case "crc32":
            const crc32 = (0, crc32_1.CRC32)();
            crc32.write([data]);
            return crc32;
        case "crc64":
            const crc64 = (0, crc64_1.CRC64)();
            crc64.write([data]);
            return crc64;
        case "fnv":
            const fnv1a = (0, fnv_1.FNV1a)();
            fnv1a.write([data]);
            return fnv1a;
        default:
            throw new BaseError_1.ArgumentsError(`Unsupported algorithm: ${algorithm}`, [
                `mylang:hash (${__filename})`,
            ]);
    }
}
