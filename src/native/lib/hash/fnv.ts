import { from, is } from "../buffers/index";
import { BufferData } from "../buffers/symbol";

const FNV_OFFSET = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

function FNV1a() {
  let hash: number = FNV_OFFSET;

  return {
    write: function ([data]: [Uint8Array]): void {
      for (const byte of new Uint8Array(
        // @ts-ignore
        is([data]) ? data[BufferData] : Buffer.from(data),
      )) {
        hash ^= byte;
        hash *= FNV_PRIME;
      }
    },
    sum: function (): Uint8Array {
      const result = new Uint8Array(4);
      new DataView(result.buffer).setUint32(0, hash, false);
      return from([result]);
    },
    reset: function (): void {
      hash = FNV_OFFSET;
    },
    size: function (): number {
      return 4;
    },
  };
}

export { FNV1a };
