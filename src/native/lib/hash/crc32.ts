import { crc32 } from "js-crc";
import { from, is } from "../buffers/index";
import { BufferData } from "../buffers/symbol";

function CRC32() {
  let crc = crc32.create();

  return {
    write: function ([data]: [Uint8Array]) {
      if (is([data])) {
        // @ts-ignore
        crc.update(new Uint8Array(data[BufferData]));
        return;
      }
      crc.update(new Uint8Array(Buffer.from(data)));
    },
    sum: function () {
      return from([crc.array()]);
    },
    reset: function () {
      crc = crc32.create();
    },
    size: function () {
      return 4;
    },
  };
}

export { CRC32 };
