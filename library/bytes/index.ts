import { Bytes } from "./Bytes";
import { ByteArray } from "./ByteArray";
import { Join, Equal, TrimRight, Trim, TrimLeft } from "./BytesUtils";
import { BytesMethodBuilder } from "./BytesBuilder";
import { Environment } from "../../src/Environment";
import { FunctionBuilderCodeError } from "../FunctionBuilder";
import { isTypeArgs } from "../utils/utils";

class IsBytes extends BytesMethodBuilder {
  override call() {
    const [bytes] = this.args;

    if (!bytes) return false;

    return (
      Buffer.isBuffer(bytes?.[Environment.SymbolBuffer] || bytes) ||
      bytes instanceof Uint8Array ||
      bytes instanceof ArrayBuffer
    );
  }
}

class Alloc extends BytesMethodBuilder {
  override call() {
    const [size, fill, encoding] = this.args;
    this.validateNumber(size, "size");

    if (encoding) {
      this.validateEncoding(encoding);
    }

    return new Bytes([Buffer.alloc(size, fill, encoding)], [], this.environment).call();
  }
}

class AllocUnsafe extends BytesMethodBuilder {
  override call() {
    const [size] = this.args;
    this.validateNumber(size, "size");

    return new Bytes([Buffer.allocUnsafe(size)], [], this.environment).call();
  }
}

class AllocUnsafeSlow extends BytesMethodBuilder {
  override call() {
    const [size] = this.args;
    this.validateNumber(size, "size");

    return new Bytes([Buffer.allocUnsafeSlow(size)], [], this.environment).call();
  }
}

class ByteLength extends BytesMethodBuilder {
  override call() {
    const [bytes, encoding] = this.args;
    this.validateBytes(bytes);

    if (encoding) {
      this.validateEncoding(encoding);
    }

    return Buffer.byteLength(bytes[Environment.SymbolBuffer] || bytes, encoding);
  }
}

class Compare extends BytesMethodBuilder {
  override call() {
    const [bytes1, bytes2] = this.args;
    this.validateBytes(bytes1, "bytes1");
    this.validateBytes(bytes2, "bytes2");

    const minLength = Math.min(bytes1.length, bytes2.length);
    for (let i = 0; i < minLength; i++) {
      if (bytes1[i]! < bytes2[i]!) return -1;
      if (bytes1[i]! > bytes2[i]!) return 1;
    }

    if (bytes1.length < bytes2.length) return -1;
    if (bytes1.length > bytes2.length) return 1;
    return 0;
  }
}

class Concat extends BytesMethodBuilder {
  override call() {
    const [bytes, totalLength] = this.args;

    if (!Array.isArray(bytes)) {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsFirstTypeError, {
        expectType: "array",
        received: isTypeArgs(bytes),
      });
    }

    if (totalLength) {
      this.validateNumber(totalLength, "totalLength");
    }

    bytes.forEach((buf) => this.validateBytes(buf, "bytesList"));

    return Buffer.concat(
      bytes.map((buf) => buf[Environment.SymbolBuffer] || buf),
      totalLength,
    );
  }
}

class IsEncoding extends BytesMethodBuilder {
  override call() {
    const [encoding] = this.args;

    try {
      this.validateEncoding(encoding);
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = {
  Bytes,
  ByteArray,
  join: Join,
  equal: Equal,
  trimRight: TrimRight,
  trim: Trim,
  trimLeft: TrimLeft,
  is: IsBytes,
  alloc: Alloc,
  allocUnsafe: AllocUnsafe,
  allocUnsafeSlow: AllocUnsafeSlow,
  byteLength: ByteLength,
  compare: Compare,
  concat: Concat,
  isEncoding: IsEncoding,
};
