import { BytesMethodBuilder } from "./BytesBuilder";
import { Environment } from "../../src/Environment";

class ByteArray extends BytesMethodBuilder {
  override call() {
    const [source, encoding] = this.args;
    let buffer: Uint8Array;

    if (source === undefined || source === null) {
      buffer = new Uint8Array(0);
    } else if (typeof source === "string") {
      buffer = this.stringToBytes(source, encoding || "utf8");
    } else if (typeof source === "number") {
      this.validateNumber(source, "size");
      if (source < 0) {
        throw this.throwErrorFormatters(new Error("Size cannot be negative"));
      }
      buffer = new Uint8Array(source);
    } else if (source instanceof Uint8Array) {
      buffer = new Uint8Array(source);
    } else if (Array.isArray(source)) {
      buffer = new Uint8Array(source);
    } else if (source instanceof ArrayBuffer) {
      buffer = new Uint8Array(source);
    } else if (Buffer.isBuffer(source?.[Environment.SymbolBuffer])) {
      buffer = new Uint8Array(source[Environment.SymbolBuffer]);
    } else {
      throw this.throwErrorFormatters(new Error("Invalid source type for ByteArray"));
    }

    return {
      length: buffer.length,

      get: class extends BytesMethodBuilder {
        override call() {
          const [index] = this.args;
          this.validateNumber(index, "index");
          if (index < 0 || index >= buffer.length) {
            throw this.throwErrorFormatters(
              new Error(`Index ${index} out of bounds for buffer of length ${buffer.length}`),
            );
          }
          return buffer[index];
        }
      },

      set: class extends BytesMethodBuilder {
        override call() {
          const [index, value] = this.args;
          this.validateNumber(index, "index");
          this.validateNumber(value, "value");
          if (index < 0 || index >= buffer.length) {
            throw this.throwErrorFormatters(
              new Error(`Index ${index} out of bounds for buffer of length ${buffer.length}`),
            );
          }
          if (value < 0 || value > 255) {
            throw this.throwErrorFormatters(
              new Error(`Byte value must be between 0 and 255, got ${value}`),
            );
          }
          buffer[index] = value;
          return null;
        }
      },

      append: class extends BytesMethodBuilder {
        override call() {
          const [item] = this.args;
          if (typeof item !== "number" || item < 0 || item > 255) {
            throw this.throwErrorFormatters(new Error("Item must be an integer between 0 and 255"));
          }

          const newBuffer = new Uint8Array(buffer.length + 1);
          newBuffer.set(buffer);
          newBuffer[buffer.length] = item;

          Object.setPrototypeOf(buffer, newBuffer);
          return null;
        }
      },

      extend: class extends BytesMethodBuilder {
        override call() {
          const [iterable] = this.args;
          let items: Uint8Array;

          if (typeof iterable === "string") {
            items = this.stringToBytes(iterable);
          } else if (iterable instanceof Uint8Array) {
            items = iterable;
          } else if (Array.isArray(iterable)) {
            items = new Uint8Array(iterable);
          } else {
            throw this.throwErrorFormatters(
              new Error("Iterable must be string, Uint8Array, or Array"),
            );
          }

          const newBuffer = new Uint8Array(buffer.length + items.length);
          newBuffer.set(buffer);
          newBuffer.set(items, buffer.length);

          Object.setPrototypeOf(buffer, newBuffer);
          return null;
        }
      },

      insert: class extends BytesMethodBuilder {
        override call() {
          const [index, item] = this.args;
          this.validateNumber(index, "index");
          this.validateNumber(item, "item");

          if (item < 0 || item > 255) {
            throw this.throwErrorFormatters(new Error("Item must be between 0 and 255"));
          }

          const actualIndex = Math.max(0, Math.min(index, buffer.length));
          const newBuffer = new Uint8Array(buffer.length + 1);

          newBuffer.set(buffer.subarray(0, actualIndex));
          newBuffer[actualIndex] = item;
          newBuffer.set(buffer.subarray(actualIndex), actualIndex + 1);

          Object.setPrototypeOf(buffer, newBuffer);
          return null;
        }
      },

      pop: class extends BytesMethodBuilder {
        override call() {
          const [index = -1] = this.args;

          if (buffer.length === 0) {
            throw this.throwErrorFormatters(new Error("pop from empty bytearray"));
          }

          const actualIndex = index < 0 ? buffer.length + index : index;
          if (actualIndex < 0 || actualIndex >= buffer.length) {
            throw this.throwErrorFormatters(new Error("pop index out of range"));
          }

          const value = buffer[actualIndex];
          const newBuffer = new Uint8Array(buffer.length - 1);

          newBuffer.set(buffer.subarray(0, actualIndex));
          newBuffer.set(buffer.subarray(actualIndex + 1), actualIndex);

          Object.setPrototypeOf(buffer, newBuffer);
          return value;
        }
      },

      remove: class extends BytesMethodBuilder {
        override call() {
          const [value] = this.args;
          this.validateNumber(value, "value");

          const index = buffer.indexOf(value);
          if (index === -1) {
            throw this.throwErrorFormatters(new Error("bytearray.remove(x): x not in bytearray"));
          }

          const newBuffer = new Uint8Array(buffer.length - 1);
          newBuffer.set(buffer.subarray(0, index));
          newBuffer.set(buffer.subarray(index + 1), index);

          Object.setPrototypeOf(buffer, newBuffer);
          return null;
        }
      },

      clear: class extends BytesMethodBuilder {
        override call() {
          Object.setPrototypeOf(buffer, new Uint8Array(0));
          return null;
        }
      },

      [Environment.SymbolBuffer]: Buffer.from(buffer),

      [Environment.SymbolFormatedText]: `ByteArray { ${buffer.length} }`,
    };
  }
}

export { ByteArray };
