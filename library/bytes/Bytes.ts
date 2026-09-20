import { BytesMethodBuilder } from "./BytesBuilder";
import { Environment } from "../../src/Environment";

class Bytes extends BytesMethodBuilder {
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
      throw this.throwErrorFormatters(new Error("Invalid source type for Bytes"));
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
          return new Bytes([buffer], [], this.environment).call();
        }
      },

      slice: class extends BytesMethodBuilder {
        override call() {
          const [start = 0, end = buffer.length] = this.args;
          return new Bytes([buffer.slice(start, end)], [], this.environment).call();
        }
      },

      subarray: class extends BytesMethodBuilder {
        override call() {
          const [start = 0, end = buffer.length] = this.args;
          return new Bytes([buffer.subarray(start, end)], [], this.environment).call();
        }
      },

      toString: class extends BytesMethodBuilder {
        override call() {
          const [encoding = "utf8"] = this.args;
          return this.bytesToString(buffer, encoding);
        }
      },

      decode: class extends BytesMethodBuilder {
        override call() {
          const [encoding = "utf8"] = this.args;
          return this.bytesToString(buffer, encoding);
        }
      },

      indexOf: class extends BytesMethodBuilder {
        override call() {
          const [searchValue, fromIndex = 0] = this.args;
          let searchBytes: Uint8Array;

          if (typeof searchValue === "string") {
            searchBytes = this.stringToBytes(searchValue);
          } else if (typeof searchValue === "number") {
            searchBytes = new Uint8Array([searchValue]);
          } else if (searchValue instanceof Uint8Array) {
            searchBytes = searchValue;
          } else {
            throw this.throwErrorFormatters(
              new Error("Search value must be string, number, or Uint8Array"),
            );
          }

          for (let i = fromIndex; i <= buffer.length - searchBytes.length; i++) {
            let found = true;
            for (let j = 0; j < searchBytes.length; j++) {
              if (buffer[i + j] !== searchBytes[j]) {
                found = false;
                break;
              }
            }
            if (found) return i;
          }
          return -1;
        }
      },

      lastIndexOf: class extends BytesMethodBuilder {
        override call() {
          const [searchValue, fromIndex = buffer.length] = this.args;
          let searchBytes: Uint8Array;

          if (typeof searchValue === "string") {
            searchBytes = this.stringToBytes(searchValue);
          } else if (typeof searchValue === "number") {
            searchBytes = new Uint8Array([searchValue]);
          } else if (searchValue instanceof Uint8Array) {
            searchBytes = searchValue;
          } else {
            throw this.throwErrorFormatters(
              new Error("Search value must be string, number, or Uint8Array"),
            );
          }

          for (let i = Math.min(fromIndex, buffer.length - searchBytes.length); i >= 0; i--) {
            let found = true;
            for (let j = 0; j < searchBytes.length; j++) {
              if (buffer[i + j] !== searchBytes[j]) {
                found = false;
                break;
              }
            }
            if (found) return i;
          }
          return -1;
        }
      },

      includes: class extends BytesMethodBuilder {
        override call() {
          const [searchValue, fromIndex = 0] = this.args;
          const indexOf = new Bytes([buffer], [], this.environment).call().indexOf;
          return new indexOf([searchValue, fromIndex], [], this.environment).call() !== -1;
        }
      },

      startsWith: class extends BytesMethodBuilder {
        override call() {
          const [prefix, start = 0] = this.args;
          let prefixBytes: Uint8Array;

          if (typeof prefix === "string") {
            prefixBytes = this.stringToBytes(prefix);
          } else if (prefix instanceof Uint8Array) {
            prefixBytes = prefix;
          } else {
            throw this.throwErrorFormatters(new Error("Prefix must be string or Uint8Array"));
          }

          if (start + prefixBytes.length > buffer.length) return false;

          for (let i = 0; i < prefixBytes.length; i++) {
            if (buffer[start + i] !== prefixBytes[i]) return false;
          }
          return true;
        }
      },

      endsWith: class extends BytesMethodBuilder {
        override call() {
          const [suffix] = this.args;
          let suffixBytes: Uint8Array;

          if (typeof suffix === "string") {
            suffixBytes = this.stringToBytes(suffix);
          } else if (suffix instanceof Uint8Array) {
            suffixBytes = suffix;
          } else {
            throw this.throwErrorFormatters(new Error("Suffix must be string or Uint8Array"));
          }

          const start = buffer.length - suffixBytes.length;
          if (start < 0) return false;

          for (let i = 0; i < suffixBytes.length; i++) {
            if (buffer[start + i] !== suffixBytes[i]) return false;
          }
          return true;
        }
      },

      concat: class extends BytesMethodBuilder {
        override call() {
          const [other] = this.args;
          let otherBytes: Uint8Array;

          if (typeof other === "string") {
            otherBytes = this.stringToBytes(other);
          } else if (other instanceof Uint8Array) {
            otherBytes = other;
          } else if (Array.isArray(other)) {
            otherBytes = new Uint8Array(other);
          } else {
            throw this.throwErrorFormatters(
              new Error("Other must be string, Uint8Array, or Array"),
            );
          }

          const result = new Uint8Array(buffer.length + otherBytes.length);
          result.set(buffer);
          result.set(otherBytes, buffer.length);
          return new Bytes([result], [], this.environment).call();
        }
      },

      repeat: class extends BytesMethodBuilder {
        override call() {
          const [count] = this.args;
          this.validateNumber(count, "count");
          if (count < 0) {
            throw this.throwErrorFormatters(new Error("Count cannot be negative"));
          }

          const result = new Uint8Array(buffer.length * count);
          for (let i = 0; i < count; i++) {
            result.set(buffer, i * buffer.length);
          }
          return new Bytes([result], [], this.environment).call();
        }
      },

      reverse: class extends BytesMethodBuilder {
        override call() {
          const result = new Uint8Array(buffer);
          result.reverse();
          return new Bytes([result], [], this.environment).call();
        }
      },

      split: class extends BytesMethodBuilder {
        override call() {
          const [separator, maxSplit = -1] = this.args;
          let sepBytes: Uint8Array;

          if (typeof separator === "string") {
            sepBytes = this.stringToBytes(separator);
          } else if (typeof separator === "number") {
            sepBytes = new Uint8Array([separator]);
          } else if (separator instanceof Uint8Array) {
            sepBytes = separator;
          } else {
            throw this.throwErrorFormatters(
              new Error("Separator must be string, number, or Uint8Array"),
            );
          }

          const results = [];
          let start = 0;
          let splits = 0;

          while (start < buffer.length && (maxSplit === -1 || splits < maxSplit)) {
            let index = -1;
            for (let i = start; i < buffer.length; i++) {
              if (buffer[i] === sepBytes[0]) {
                index = i;
                break;
              }
            }
            if (index === -1) break;

            let matches = true;
            for (let i = 1; i < sepBytes.length; i++) {
              if (index + i >= buffer.length || buffer[index + i] !== sepBytes[i]) {
                matches = false;
                break;
              }
            }

            if (matches) {
              results.push(new Bytes([buffer.slice(start, index)], [], this.environment).call());
              start = index + sepBytes.length;
              splits++;
            } else {
              start = index + 1;
            }
          }

          if (start < buffer.length) {
            results.push(new Bytes([buffer.slice(start)], [], this.environment).call());
          }

          return results;
        }
      },

      equals: class extends BytesMethodBuilder {
        override call() {
          const [other] = this.args;
          let otherBytes: Uint8Array;

          if (other instanceof Uint8Array) {
            otherBytes = other;
          } else if (typeof other === "string") {
            otherBytes = this.stringToBytes(other);
          } else {
            return false;
          }

          if (buffer.length !== otherBytes.length) return false;

          for (let i = 0; i < buffer.length; i++) {
            if (buffer[i] !== otherBytes[i]) return false;
          }
          return true;
        }
      },

      compare: class extends BytesMethodBuilder {
        override call() {
          const [other] = this.args;
          this.validateBytes(other, "other");

          const minLength = Math.min(buffer.length, other.length);
          for (let i = 0; i < minLength; i++) {
            if (buffer[i]! < other[i]!) return -1;
            if (buffer[i]! > other[i]!) return 1;
          }

          if (buffer.length < other.length) return -1;
          if (buffer.length > other.length) return 1;
          return 0;
        }
      },

      copy: class extends BytesMethodBuilder {
        override call() {
          return new Bytes([new Uint8Array(buffer)], [], this.environment).call();
        }
      },

      fill: class extends BytesMethodBuilder {
        override call() {
          const [value, start = 0, end = buffer.length] = this.args;

          let fillValue: number;
          if (typeof value === "number") {
            fillValue = value;
          } else if (typeof value === "string" && value.length === 1) {
            fillValue = value.charCodeAt(0);
          } else {
            throw this.throwErrorFormatters(
              new Error("Fill value must be a number or single character string"),
            );
          }

          if (fillValue < 0 || fillValue > 255) {
            throw this.throwErrorFormatters(new Error("Fill value must be between 0 and 255"));
          }

          const result = new Uint8Array(buffer);
          result.fill(fillValue, start, end);
          return new Bytes([result], [], this.environment).call();
        }
      },

      toArray: class extends BytesMethodBuilder {
        override call() {
          return Array.from(buffer);
        }
      },

      toArrayBuffer: class extends BytesMethodBuilder {
        override call() {
          return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
        }
      },

      *[Symbol.iterator]() {
        for (let i = 0; i < buffer.length; i++) {
          yield buffer[i];
        }
      },

      [Environment.SymbolBuffer]: Buffer.from(buffer),

      [Environment.SymbolFormatedText]: `Bytes { ${buffer.length} }`,
    };
  }
}

export { Bytes };
