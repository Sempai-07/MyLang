import { Buffer } from "node:buffer";
import { ArgumentsError } from "../../../errors/BaseError";

function BufferUtility() {
  return {
    from([input, encodingOrOffset, length]: [
      string | number[],
      number | undefined,
      number | undefined,
    ]): ReturnType<typeof BufferWrapper> {
      if (!input) {
        throw new ArgumentsError("Input cannot be nil.", [
          `mylang:buffers (${__filename})`,
        ]);
      }

      const arrayBufferLikeInput =
        typeof input === "string"
          ? new TextEncoder().encode(input).buffer
          : Array.isArray(input)
            ? new Uint8Array(input).buffer
            : input;

      return BufferWrapper([
        Buffer.from(arrayBufferLikeInput, encodingOrOffset, length),
      ]);
    },
    alloc([size, fill, encoding]: [
      number,
      string | number | Buffer | undefined,
      BufferEncoding | undefined,
    ]): ReturnType<typeof BufferWrapper> {
      if (typeof size !== "number" || size < 0) {
        throw new ArgumentsError("Must be a non-negative number.", [
          `mylang:buffers (${__filename})`,
        ]);
      }
      return BufferWrapper([Buffer.alloc(size, fill, encoding)]);
    },
    allocUnsafe([size]: [number]): ReturnType<typeof BufferWrapper> {
      if (typeof size !== "number" || size < 0) {
        throw new ArgumentsError("Must be a non-negative number.", [
          `mylang:buffers (${__filename})`,
        ]);
      }
      return BufferWrapper([Buffer.allocUnsafe(size)]);
    },
    byteLength([string, encoding]: [
      string | Buffer,
      BufferEncoding | undefined,
    ]): number {
      if (typeof string !== "string" && !Buffer.isBuffer(string)) {
        throw new ArgumentsError("Must be a string, BufferUtility.", [
          `mylang:buffers (${__filename})`,
        ]);
      }
      return Buffer.byteLength(string, encoding);
    },
    compare([buf1, buf2]: [Buffer, Buffer]): number {
      if (!Buffer.isBuffer(buf1) || !Buffer.isBuffer(buf2)) {
        throw new ArgumentsError("Both arguments must be Buffers.", [
          `mylang:buffers (${__filename})`,
        ]);
      }
      return Buffer.compare(buf1, buf2);
    },
    concat([list, totalLength]: [Buffer[], number | undefined]): ReturnType<
      typeof BufferWrapper
    > {
      if (!Array.isArray(list) || !list.every(Buffer.isBuffer)) {
        throw new ArgumentsError("Must be an array of Buffers.", [
          `mylang:buffers (${__filename})`,
        ]);
      }
      return BufferWrapper([Buffer.concat(list, totalLength)]);
    },
    isBuffer([obj]: [any]): boolean {
      return Buffer.isBuffer(obj);
    },
    toJSON([buffer]: [Buffer]): Object {
      if (!Buffer.isBuffer(buffer)) {
        throw new ArgumentsError("Must be a Buffer.", [
          `mylang:buffers (${__filename})`,
        ]);
      }
      return buffer.toJSON();
    },
    write([buffer, string, offset, length, encoding]: [
      Buffer,
      string,
      number | undefined,
      number | undefined,
      BufferEncoding | undefined,
    ]): number {
      if (!Buffer.isBuffer(buffer)) {
        throw new ArgumentsError("Must be a Buffer.", [
          `mylang:buffers (${__filename})`,
        ]);
      }
      return buffer.write(
        string,
        offset ?? 0,
        length ?? string.length,
        encoding,
      );
    },
    toString(
      // @ts-expect-error
      [buffer, encoding, start, end]: [
        Buffer,
        BufferEncoding | undefined,
        number | undefined,
        number | undefined,
      ] = [Buffer.alloc(0)],
    ): string {
      if (!Buffer.isBuffer(buffer)) {
        throw new ArgumentsError("Must be a BufferUtility.", [
          `mylang:buffers (${__filename})`,
        ]);
      }
      return buffer.toString(encoding, start, end);
    },
    slice([buffer, start, end]: [
      Buffer,
      number | undefined,
      number | undefined,
    ]): ReturnType<typeof BufferWrapper> {
      if (!Buffer.isBuffer(buffer)) {
        throw new ArgumentsError("Must be a BufferUtility.", [
          `mylang:buffers (${__filename})`,
        ]);
      }
      return BufferWrapper([buffer.slice(start, end)]);
    },
    includes([buffer, value, byteOffset, encoding]: [
      Buffer,
      string | number,
      number | undefined,
      BufferEncoding | undefined,
    ]): boolean {
      if (!Buffer.isBuffer(buffer)) {
        throw new ArgumentsError("Must be a BufferUtility.", [
          `mylang:buffers (${__filename})`,
        ]);
      }
      return buffer.includes(value, byteOffset, encoding);
    },
    indexOf([buffer, value, byteOffset, encoding]: [
      Buffer,
      string | number,
      number | undefined,
      BufferEncoding | undefined,
    ]): number {
      if (!Buffer.isBuffer(buffer)) {
        throw new ArgumentsError("Must be a BufferUtility.", [
          `mylang:buffers (${__filename})`,
        ]);
      }
      return buffer.indexOf(value, byteOffset, encoding);
    },
    lastIndexOf([buffer, value, byteOffset, encoding]: [
      Buffer,
      string | number,
      number | undefined,
      BufferEncoding | undefined,
    ]): number {
      if (!Buffer.isBuffer(buffer)) {
        throw new ArgumentsError("Must be a BufferUtility.", [
          `mylang:buffers (${__filename})`,
        ]);
      }
      return buffer.lastIndexOf(value, byteOffset, encoding);
    },
    equals([buf1, buf2]: [Buffer, Buffer]): boolean {
      if (!Buffer.isBuffer(buf1) || !Buffer.isBuffer(buf2)) {
        throw new ArgumentsError("Both arguments must be Buffers.", [
          `mylang:buffers (${__filename})`,
        ]);
      }
      return buf1.equals(buf2);
    },
  };
}

function BufferWrapper([buffer]: [Buffer | string]): {
  toString: ([encoding, start, end]: [
    BufferEncoding | undefined,
    number | undefined,
    number | undefined,
  ]) => string;
  slice: ([start, end]: [number | undefined, number | undefined]) => {
    toString: any;
  };
  write: ([string, offset, length, encoding]: [
    string,
    number,
    number,
    BufferEncoding | undefined,
  ]) => number;
  includes: ([value, byteOffset, encoding]: [
    string | number,
    number | undefined,
    BufferEncoding | undefined,
  ]) => boolean;
  indexOf: ([value, byteOffset, encoding]: [
    string | number,
    number | undefined,
    BufferEncoding | undefined,
  ]) => number;
  lastIndexOf: ([value, byteOffset, encoding]: [
    string | number,
    number | undefined,
    BufferEncoding | undefined,
  ]) => number;
  equals: ([otherBuffer]: [Buffer]) => boolean;
  toJSON: () => object;
  byteLength: () => number;
} {
  buffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);

  if (!Buffer.isBuffer(buffer)) {
    throw new ArgumentsError("Must be an instance of Buffer.", [
      `mylang:buffers (${__filename})`,
    ]);
  }

  return {
    toString(
      // @ts-expect-error
      [encoding, start, end]: [
        BufferEncoding | undefined,
        number | undefined,
        number | undefined,
      ] = [],
    ): string {
      return buffer.toString(encoding, start, end);
    },
    slice([start, end]: [number | undefined, number | undefined]): ReturnType<
      typeof BufferWrapper
    > {
      return BufferWrapper([buffer.slice(start, end)]);
    },
    write([string, offset, length, encoding]: [
      string,
      number,
      number,
      BufferEncoding | undefined,
    ]): number {
      return buffer.write(string, offset, length, encoding);
    },
    includes([value, byteOffset, encoding]: [
      string | number,
      number | undefined,
      BufferEncoding | undefined,
    ]): boolean {
      return buffer.includes(value, byteOffset, encoding);
    },
    indexOf([value, byteOffset, encoding]: [
      string | number,
      number | undefined,
      BufferEncoding | undefined,
    ]): number {
      return buffer.indexOf(value, byteOffset, encoding);
    },
    lastIndexOf([value, byteOffset, encoding]: [
      string | number,
      number | undefined,
      BufferEncoding | undefined,
    ]): number {
      return buffer.lastIndexOf(value, byteOffset, encoding);
    },
    equals([otherBuffer]: [Buffer]): boolean {
      if (!Buffer.isBuffer(otherBuffer)) {
        throw new ArgumentsError("Must be an instance of Buffer.", [
          `mylang:buffers (${__filename})`,
        ]);
      }
      return buffer.equals(otherBuffer);
    },
    toJSON(): object {
      return buffer.toJSON();
    },
    byteLength(): number {
      return buffer.length;
    },
  };
}

export { BufferUtility, BufferWrapper };
