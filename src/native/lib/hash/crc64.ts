import { from, is } from "../buffers/index";
import { BufferData } from "../buffers/symbol";

const POLY: bigint = BigInt("0x42F0E1EBA9EA3693");
const INIT: bigint = BigInt("0xFFFFFFFFFFFFFFFF");

function crc64(data: Uint8Array, checksum: bigint): bigint {
  for (let i = 0; i < data.length; i++) {
    checksum ^= BigInt(data[i]!) << BigInt(56);

    for (let j = 0; j < 8; j++) {
      if (checksum & BigInt(0x8000000000000000)) {
        checksum = (checksum << BigInt(1)) ^ POLY;
      } else {
        checksum <<= BigInt(1);
      }
    }
  }

  return checksum;
}

function CRC64() {
  let checksum: bigint = INIT;

  return {
    write: function ([data]: [Uint8Array]): void {
      if (is([data])) {
        // @ts-ignore
        checksum = crc64(new Uint8Array(data[BufferData]), checksum);
        return;
      }
      checksum = crc64(new Uint8Array(Buffer.from(data)), checksum);
    },
    sum: function (): Uint8Array {
      const result = new Uint8Array(8);
      new DataView(result.buffer).setBigUint64(0, checksum, false);
      return from([result]);
    },
    reset: function (): void {
      checksum = INIT;
    },
    size: function (): number {
      return 8;
    },
  };
}

export { CRC64 };
