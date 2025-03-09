import { bstr } from "adler-32";
import { from, is } from "../buffers/index";
import { BufferData } from "../buffers/symbol";

function Adler32() {
  let checksum: number = 0;

  return {
    write: function ([data, seed]: [Uint8Array, number?]): void {
      if (is([data])) {
        // @ts-ignore
        checksum = bstr(data[BufferData].toString(), seed);
        return;
      }
      checksum = bstr(Buffer.from(data).toString(), seed);
    },
    sum: function (): Uint8Array {
      const result = new Uint8Array(4);
      new DataView(result.buffer).setUint32(0, checksum, false);
      return from([result]);
    },
    reset: function (): void {
      checksum = 0;
    },
    size: function (): number {
      return 4;
    },
  };
}

export { Adler32 };
