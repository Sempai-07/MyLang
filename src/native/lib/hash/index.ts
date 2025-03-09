import { Adler32 } from "./adler32";
import { CRC32 } from "./crc32";
import { CRC64 } from "./crc64";
import { FNV1a } from "./fnv";
import { type Bytes } from "../buffers/index";
import { ArgumentsError } from "../../../errors/BaseError";

type HashAlgorithm = "adler32" | "crc32" | "crc64" | "fnv";

function createHash([data, algorithm, seed]: [
  Uint8Array,
  HashAlgorithm,
  number?,
]): ReturnType<typeof Bytes> {
  switch (algorithm) {
    case "adler32":
      const adler32 = Adler32();
      if (seed) {
        adler32.write([data, seed]);
        return adler32;
      }
      adler32.write([data]);
      return adler32;
    case "crc32":
      const crc32 = CRC32();
      crc32.write([data]);
      return crc32;
    case "crc64":
      const crc64 = CRC64();
      crc64.write([data]);
      return crc64;
    case "fnv":
      const fnv1a = FNV1a();
      fnv1a.write([data]);
      return fnv1a;
    default:
      throw new ArgumentsError(`Unsupported algorithm: ${algorithm}`, [
        `mylang:hash (${__filename})`,
      ]);
  }
}

export { CRC32, CRC64, Adler32, FNV1a, createHash };
