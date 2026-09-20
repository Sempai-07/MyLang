import { BytesMethodBuilder } from "./BytesBuilder";
import { Environment } from "../../src/Environment";
import { Bytes } from "./Bytes";

class Join extends BytesMethodBuilder {
  override call() {
    const [separator, iterable] = this.args;
    let sepBytes: Uint8Array;

    if (typeof separator === "string") {
      sepBytes = this.stringToBytes(separator);
    } else if (separator instanceof Uint8Array) {
      sepBytes = separator;
    } else if (Buffer.isBuffer(separator?.[Environment.SymbolBuffer])) {
      sepBytes = new Uint8Array(separator[Environment.SymbolBuffer]);
    } else {
      throw this.throwErrorFormatters(new Error("Separator must be string or Uint8Array"));
    }

    if (!Array.isArray(iterable)) {
      throw this.throwErrorFormatters(new Error("Iterable must be an array"));
    }

    if (iterable.length === 0) {
      return new Bytes([new Uint8Array(0)], [], this.environment).call();
    }

    const parts = iterable.map((item) => {
      if (typeof item === "string") {
        return this.stringToBytes(item);
      } else if (item instanceof Uint8Array) {
        return item;
      } else {
        throw this.throwErrorFormatters(new Error("All items must be strings or Uint8Arrays"));
      }
    });

    const totalLength =
      parts.reduce((sum, part) => sum + part.length, 0) + sepBytes.length * (parts.length - 1);

    const result = new Uint8Array(totalLength);
    let offset = 0;

    for (let i = 0; i < parts.length; i++) {
      if (i > 0) {
        result.set(sepBytes, offset);
        offset += sepBytes.length;
      }
      result.set(parts[i]!, offset);
      offset += parts[i]!.length;
    }

    return new Bytes([result], [], this.environment).call();
  }
}

class Equal extends BytesMethodBuilder {
  override call() {
    const [a, b] = this.args;
    this.validateBytes(a, "a");
    this.validateBytes(b, "b");

    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }
}

class TrimLeft extends BytesMethodBuilder {
  override call() {
    const [bytes, cutset] = this.args;
    this.validateBytes(bytes, "bytes");

    let cutBytes: Uint8Array;
    if (typeof cutset === "string") {
      cutBytes = this.stringToBytes(cutset);
    } else if (cutset instanceof Uint8Array) {
      cutBytes = cutset;
    } else if (Buffer.isBuffer(cutset?.[Environment.SymbolBuffer])) {
      cutBytes = new Uint8Array(cutset[Environment.SymbolBuffer]);
    } else {
      cutBytes = new Uint8Array([32]);
    }

    const cutSet = new Set(cutBytes);
    let start = 0;

    while (start < bytes.length && cutSet.has(bytes[start])) {
      start++;
    }

    return new Bytes([bytes.slice(start)], [], this.environment).call();
  }
}

class TrimRight extends BytesMethodBuilder {
  override call() {
    const [bytes, cutset] = this.args;
    this.validateBytes(bytes, "bytes");

    let cutBytes: Uint8Array;
    if (typeof cutset === "string") {
      cutBytes = this.stringToBytes(cutset);
    } else if (cutset instanceof Uint8Array) {
      cutBytes = cutset;
    } else if (Buffer.isBuffer(cutset?.[Environment.SymbolBuffer])) {
      cutBytes = new Uint8Array(cutset[Environment.SymbolBuffer]);
    } else {
      cutBytes = new Uint8Array([32]);
    }

    const cutSet = new Set(cutBytes);
    let end = bytes.length;

    while (end > 0 && cutSet.has(bytes[end - 1])) {
      end--;
    }

    return new Bytes([bytes.slice(0, end)], [], this.environment).call();
  }
}

class Trim extends BytesMethodBuilder {
  override call() {
    const [bytes, cutset] = this.args;
    const trimLeft = new bytes.trimLeft([bytes, cutset], [], this.environment).call();
    const trimmed = new bytes.trimRight([trimLeft.buffer, cutset], [], this.environment).call();
    return trimmed;
  }
}

export { Join, Equal, TrimRight, Trim, TrimLeft };
