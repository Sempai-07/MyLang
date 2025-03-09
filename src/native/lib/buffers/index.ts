import { Buffer } from "node:buffer";
import { isFunctionNode } from "../../utils";
import { BufferData, BufferCustom } from "./symbol";
import { ArgumentsError, FunctionCallError } from "../../../errors/BaseError";
import { type FunctionDeclaration } from "../../../ast/declaration/FunctionDeclaration";
import { type FunctionExpression } from "../../../ast/expression/FunctionExpression";

function Bytes([initialSize]: [number] = [64]): any {
  let data = Buffer.allocUnsafe(initialSize);
  let length = 0;
  let offset = 0;

  function ensureCapacity(minCapacity: number) {
    if (minCapacity > data.length) {
      let newCapacity = Math.max(data.length * 2, minCapacity);
      const newBuffer = Buffer.allocUnsafe(newCapacity);
      data.copy(newBuffer, 0, offset, length);
      data = newBuffer;
      length -= offset;
      offset = 0;
    }
  }

  return {
    write: function ([input]: [Uint8Array | Buffer]) {
      ensureCapacity(length + input.length);
      Buffer.from(input).copy(data, length);
      length += input.length;
    },
    read: function (): ReturnType<typeof Bytes> {
      return from([data.subarray(offset, length)]);
    },
    readBytes: function ([n]: [number]): Buffer {
      const end = Math.min(offset + n, length);
      const chunk = data.subarray(offset, end);
      offset = end;
      return from([chunk]);
    },
    truncate: function ([n]: [number]) {
      if (n < 0 || n > length - offset) {
        throw new ArgumentsError("out of range", [
          `mylang:buffers (${__filename})`,
        ]);
      }
      length = offset + n;
    },
    clear: function () {
      offset = 0;
      length = 0;
    },
    reset: function () {
      offset = 0;
      length = 0;
      data = Buffer.allocUnsafe(data.length);
    },
    writeString: function ([str, encoding = "utf8"]: [
      string,
      BufferEncoding?,
    ]) {
      const input = Buffer.from(str, encoding);
      ensureCapacity(length + input.length);
      input.copy(data, length);
      length += input.length;
    },
    toString: function (
      [encoding = "utf8"]: [BufferEncoding?] = ["utf8"],
    ): string {
      return data.toString(encoding, offset, length);
    },
    grow: function ([n]: [number]) {
      if (n < 0) {
        throw new ArgumentsError("negative size", [
          `mylang:buffers (${__filename})`,
        ]);
      }
      ensureCapacity(length + n);
      length += n;
    },
    len: function () {
      return length - offset;
    },
    cap: function () {
      return data.length;
    },
    bytes: function (): Buffer {
      return data.subarray(offset, length);
    },
    writeTo: function ([target]: [FunctionDeclaration | FunctionExpression]) {
      const chunk = data.subarray(offset, length);

      if (!isFunctionNode(target)) {
        throw new FunctionCallError(
          "Invalid callback. Must be a FunctionDeclaration or FunctionExpression.",
          [`mylang:arrays (${__filename})`],
        );
      }

      target.call([{ value: chunk }]);
      offset = length;
      return chunk.length;
    },
    [BufferCustom]: true,
    [BufferData]: Buffer.from(data),
  };
}

function from([buffer]: [any]): ReturnType<typeof Bytes> {
  const bytes = Bytes();
  if (buffer instanceof Uint8Array || buffer instanceof Buffer) {
    bytes.write([buffer]);
    return bytes;
  }
  bytes.write([Buffer.from(buffer)]);
  return bytes;
}

function compare([a, b]: [
  ReturnType<typeof Bytes>,
  ReturnType<typeof Bytes>,
]): number {
  if (!a?.[BufferCustom]) {
    throw new ArgumentsError("The argument 'a' must be bytes", [
      `mylang:buffers (${__filename})`,
    ]);
  }
  if (!b?.[BufferCustom]) {
    throw new ArgumentsError("The argument 'b' must be bytes", [
      `mylang:buffers (${__filename})`,
    ]);
  }
  return Buffer.compare(a[BufferData], b[BufferData]);
}

function is([buffer]: [any]): boolean {
  return Boolean(buffer && buffer[BufferCustom]);
}

export { Bytes, from, compare, is };
