import { FunctionBuilder, FunctionBuilderCodeError } from "../FunctionBuilder";
import { Environment } from "../../src/Environment";
import { type StmtType } from "../../src/ast/StmtType";
import { isTypeArgs } from "../utils/utils";
import crypto from "node:crypto";
import os from "node:os";

abstract class UUIDMethodBuilder extends FunctionBuilder {
  constructor(args: any[], astArgs: StmtType[], environment: Environment) {
    super(args, astArgs, environment);
  }

  get pkgInfo() {
    return {
      name: "uuid",
      path: __dirname,
    };
  }

  protected validateString(str: any, argName?: string): void {
    if (argName && isTypeArgs(str) !== "string") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "string",
        received: isTypeArgs(str),
      });
    } else if (isTypeArgs(str) !== "string") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsFirstTypeError, {
        expectType: "string",
        received: isTypeArgs(str),
      });
    }
  }

  protected validateNumber(num: any, argName: string = "number"): void {
    if (isTypeArgs(num) !== "int") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "int",
        received: isTypeArgs(num),
      });
    }
  }

  protected validateUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  protected formatUUID(hex: string): string {
    return [
      hex.slice(0, 8),
      hex.slice(8, 12),
      hex.slice(12, 16),
      hex.slice(16, 20),
      hex.slice(20, 32),
    ].join("-");
  }

  protected parseHex(hex: string): Buffer {
    return Buffer.from(hex.replace(/-/g, ""), "hex");
  }

  call() {
    throw new Error("Call is not implemented");
  }
}

class V1 extends UUIDMethodBuilder {
  private static clockSeq = Math.floor(Math.random() * 0x4000);
  private static lastTime = 0;

  override call() {
    const [node, clockSeq] = this.args;

    const now = Date.now();
    const timeUUID = BigInt(now * 10000) + 0x01b21dd213814000n;

    let seq = clockSeq !== undefined ? clockSeq : V1.clockSeq;
    if (now <= V1.lastTime) {
      seq = (seq + 1) & 0x3fff;
    }
    V1.lastTime = now;
    V1.clockSeq = seq;

    let nodeBytes: Buffer;
    if (node) {
      this.validateString(node, "node");
      nodeBytes = Buffer.from(node.replace(/[:-]/g, ""), "hex");
      if (nodeBytes.length !== 6) {
        throw this.throwErrorFormatters(new Error("Node must be 6 bytes (MAC address format)"));
      }
    } else {
      const interfaces = os.networkInterfaces();
      let macAddress: string | null = null;

      for (const nets of Object.values(interfaces)) {
        if (nets) {
          for (const net of nets) {
            if (!net.internal && net.mac !== "00:00:00:00:00:00") {
              macAddress = net.mac;
              break;
            }
          }
        }
        if (macAddress) break;
      }

      if (macAddress) {
        nodeBytes = Buffer.from(macAddress.replace(/:/g, ""), "hex");
      } else {
        nodeBytes = crypto.randomBytes(6);
        nodeBytes[0]! |= 0x01;
      }
    }

    const buffer = Buffer.alloc(16);

    buffer.writeUInt32BE(Number(timeUUID & 0xffffffffn), 0);

    buffer.writeUInt16BE(Number((timeUUID >> 32n) & 0xffffn), 4);

    buffer.writeUInt16BE(Number(((timeUUID >> 48n) & 0x0fffn) | 0x1000n), 6);

    buffer.writeUInt16BE((seq & 0x3fff) | 0x8000, 8);

    nodeBytes.copy(buffer, 10);

    return this.formatUUID(buffer.toString("hex"));
  }
}

class V3 extends UUIDMethodBuilder {
  override call() {
    const [namespace, name] = this.args;
    this.validateString(namespace, "namespace");
    this.validateString(name, "name");

    if (!this.validateUUID(namespace)) {
      throw this.throwErrorFormatters(new Error("Invalid namespace UUID format"));
    }

    const namespaceBytes = this.parseHex(namespace);
    const nameBytes = Buffer.from(name, "utf8");

    const hash = crypto.createHash("md5");
    hash.update(namespaceBytes);
    hash.update(nameBytes);
    const hashBytes = hash.digest();

    hashBytes[6] = (hashBytes[6]! & 0x0f) | 0x30;
    hashBytes[8] = (hashBytes[8]! & 0x3f) | 0x80;

    return this.formatUUID(hashBytes.toString("hex"));
  }
}

class V4 extends UUIDMethodBuilder {
  override call() {
    const bytes = crypto.randomBytes(16);

    bytes[6] = (bytes[6]! & 0x0f) | 0x40;
    bytes[8] = (bytes[8]! & 0x3f) | 0x80;

    return this.formatUUID(bytes.toString("hex"));
  }
}

class V5 extends UUIDMethodBuilder {
  override call() {
    const [namespace, name] = this.args;
    this.validateString(namespace, "namespace");
    this.validateString(name, "name");

    if (!this.validateUUID(namespace)) {
      throw this.throwErrorFormatters(new Error("Invalid namespace UUID format"));
    }

    const namespaceBytes = this.parseHex(namespace);
    const nameBytes = Buffer.from(name, "utf8");

    const hash = crypto.createHash("sha1");
    hash.update(namespaceBytes);
    hash.update(nameBytes);
    const hashBytes = hash.digest();

    const uuid = hashBytes.slice(0, 16);
    uuid[6] = (uuid[6]! & 0x0f) | 0x50;
    uuid[8] = (uuid[8]! & 0x3f) | 0x80;

    return this.formatUUID(uuid.toString("hex"));
  }
}

class Generate extends UUIDMethodBuilder {
  override call() {
    return new V4([], [], this.environment).call();
  }
}

class Parse extends UUIDMethodBuilder {
  override call() {
    const [uuid] = this.args;
    this.validateString(uuid);

    if (!this.validateUUID(uuid)) {
      throw this.throwErrorFormatters(new Error("Invalid UUID format"));
    }

    const hex = uuid.replace(/-/g, "");
    const bytes = Buffer.from(hex, "hex");

    const version = (bytes[6]! & 0xf0) >> 4;
    const variant = (bytes[8]! & 0xc0) >> 6;

    const result: any = {
      hex: hex.toLowerCase(),
      bytes: Array.from(bytes),
      version: version,
      variant: variant,
      fields: {
        timeLow: hex.slice(0, 8),
        timeMid: hex.slice(8, 12),
        timeHiAndVersion: hex.slice(12, 16),
        clockSeqHiAndReserved: hex.slice(16, 18),
        clockSeqLow: hex.slice(18, 20),
        node: hex.slice(20, 32),
      },
    };

    if (version === 1) {
      const timeLow = parseInt(hex.slice(0, 8), 16);
      const timeMid = parseInt(hex.slice(8, 12), 16);
      const timeHi = parseInt(hex.slice(12, 16), 16) & 0x0fff;

      const timestamp = BigInt(timeLow) + (BigInt(timeMid) << 32n) + (BigInt(timeHi) << 48n);
      const unixTime = Number((timestamp - 0x01b21dd213814000n) / 10000n);

      result.timestamp = unixTime;
      result.datetime = new Date(unixTime);
      result.clockSequence = ((bytes[8]! & 0x3f) << 8) | bytes[9]!;
      result.node = hex.slice(20, 32);
    }

    return result;
  }
}

class IsValid extends UUIDMethodBuilder {
  override call() {
    const [uuid] = this.args;
    if (isTypeArgs(uuid) !== "string") return false;
    return this.validateUUID(uuid);
  }
}

class Version extends UUIDMethodBuilder {
  override call() {
    const [uuid] = this.args;
    this.validateString(uuid);

    if (!this.validateUUID(uuid)) {
      throw this.throwErrorFormatters(new Error("Invalid UUID format"));
    }

    const hex = uuid.replace(/-/g, "");
    const versionByte = parseInt(hex[12], 16);
    return (versionByte & 0xf0) >> 4;
  }
}

class ToBytes extends UUIDMethodBuilder {
  override call() {
    const [uuid] = this.args;
    this.validateString(uuid);

    if (!this.validateUUID(uuid)) {
      throw this.throwErrorFormatters(new Error("Invalid UUID format"));
    }

    const bytes = this.parseHex(uuid);
    return Array.from(bytes);
  }
}

class ToHex extends UUIDMethodBuilder {
  override call() {
    const [uuid] = this.args;
    this.validateString(uuid);

    if (!this.validateUUID(uuid)) {
      throw this.throwErrorFormatters(new Error("Invalid UUID format"));
    }

    return uuid.replace(/-/g, "").toLowerCase();
  }
}

class FromBytes extends UUIDMethodBuilder {
  override call() {
    const [bytes] = this.args;

    if (!Array.isArray(bytes) || bytes.length !== 16) {
      throw this.throwErrorFormatters(new Error("Bytes must be an array of 16 integers"));
    }

    const buffer = Buffer.from(bytes);
    return this.formatUUID(buffer.toString("hex"));
  }
}

class FromHex extends UUIDMethodBuilder {
  override call() {
    const [hex] = this.args;
    this.validateString(hex, "hex");

    const cleanHex = hex.replace(/[^0-9a-f]/gi, "");
    if (cleanHex.length !== 32) {
      throw this.throwErrorFormatters(new Error("Hex string must be exactly 32 characters"));
    }

    return this.formatUUID(cleanHex.toLowerCase());
  }
}

class Nil extends UUIDMethodBuilder {
  override call() {
    return "00000000-0000-0000-0000-000000000000";
  }
}

class IsNil extends UUIDMethodBuilder {
  override call() {
    const [uuid] = this.args;
    if (isTypeArgs(uuid) !== "string") return false;
    return uuid === "00000000-0000-0000-0000-000000000000";
  }
}

class NamespaceDNS extends UUIDMethodBuilder {
  override call() {
    return "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
  }
}

class NamespaceURL extends UUIDMethodBuilder {
  override call() {
    return "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
  }
}

class NamespaceOID extends UUIDMethodBuilder {
  override call() {
    return "6ba7b812-9dad-11d1-80b4-00c04fd430c8";
  }
}

class NamespaceX500 extends UUIDMethodBuilder {
  override call() {
    return "6ba7b814-9dad-11d1-80b4-00c04fd430c8";
  }
}

class Compare extends UUIDMethodBuilder {
  override call() {
    const [uuid1, uuid2] = this.args;
    this.validateString(uuid1, "uuid1");
    this.validateString(uuid2, "uuid2");

    if (!this.validateUUID(uuid1)) {
      throw this.throwErrorFormatters(new Error("Invalid uuid1 format"));
    }
    if (!this.validateUUID(uuid2)) {
      throw this.throwErrorFormatters(new Error("Invalid uuid2 format"));
    }

    const hex1 = uuid1.replace(/-/g, "").toLowerCase();
    const hex2 = uuid2.replace(/-/g, "").toLowerCase();

    if (hex1 < hex2) return -1;
    if (hex1 > hex2) return 1;
    return 0;
  }
}

class Equal extends UUIDMethodBuilder {
  override call() {
    const [uuid1, uuid2] = this.args;
    if (isTypeArgs(uuid1) !== "string" || isTypeArgs(uuid2) !== "string") return false;

    return uuid1.toLowerCase() === uuid2.toLowerCase();
  }
}

class Batch extends UUIDMethodBuilder {
  override call() {
    const [count = 1, version = 4] = this.args;
    this.validateNumber(count, "count");
    this.validateNumber(version, "version");

    if (count < 1) {
      throw this.throwErrorFormatters(new Error("Count must be positive"));
    }
    if (![1, 3, 4, 5].includes(version)) {
      throw this.throwErrorFormatters(new Error("Version must be 1, 3, 4, or 5"));
    }

    const uuids: string[] = [];
    for (let i = 0; i < count; i++) {
      if (version === 4) {
        uuids.push(new V4([], [], this.environment).call());
      } else if (version === 1) {
        uuids.push(new V1([], [], this.environment).call());
      } else {
        throw this.throwErrorFormatters(
          new Error(`Batch generation not supported for version ${version}`),
        );
      }
    }
    return uuids;
  }
}

class Short extends UUIDMethodBuilder {
  override call() {
    const [uuid] = this.args;
    let uuidToConvert = uuid;

    if (!uuid) {
      uuidToConvert = new V4([], [], this.environment).call();
    } else {
      this.validateString(uuid);
      if (!this.validateUUID(uuid)) {
        throw this.throwErrorFormatters(new Error("Invalid UUID format"));
      }
    }

    // Convert UUID to base62
    const hex = uuidToConvert.replace(/-/g, "");
    const decimal = BigInt("0x" + hex);

    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let result = "";
    let num = decimal;

    while (num > 0) {
      result = chars[Number(num % 62n)] + result;
      num = num / 62n;
    }

    return result || "0";
  }
}

class FromShort extends UUIDMethodBuilder {
  override call() {
    const [short] = this.args;
    this.validateString(short, "short");

    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let decimal = 0n;

    for (let i = 0; i < short.length; i++) {
      const char = short[i];
      const index = chars.indexOf(char);
      if (index === -1) {
        throw this.throwErrorFormatters(new Error("Invalid character in short UUID"));
      }
      decimal = decimal * 62n + BigInt(index);
    }

    let hex = decimal.toString(16).padStart(32, "0");
    return this.formatUUID(hex);
  }
}

class GetTime extends UUIDMethodBuilder {
  override call() {
    const [uuid] = this.args;
    this.validateString(uuid);

    if (!this.validateUUID(uuid)) {
      throw this.throwErrorFormatters(new Error("Invalid UUID format"));
    }

    const version = new Version([uuid], [], this.environment).call();
    if (version !== 1) {
      throw this.throwErrorFormatters(new Error("UUID must be version 1 (time-based)"));
    }

    const parsed = new Parse([uuid], [], this.environment).call();
    return parsed.timestamp;
  }
}

module.exports = {
  v1: V1,
  v3: V3,
  v4: V4,
  v5: V5,
  generate: Generate,
  parse: Parse,
  isValid: IsValid,
  version: Version,
  toBytes: ToBytes,
  toHex: ToHex,
  fromBytes: FromBytes,
  fromHex: FromHex,
  nil: Nil,
  isNil: IsNil,
  namespaceDNS: NamespaceDNS,
  namespaceURL: NamespaceURL,
  namespaceOID: NamespaceOID,
  namespaceX500: NamespaceX500,
  compare: Compare,
  equal: Equal,
  batch: Batch,
  short: Short,
  fromShort: FromShort,
  getTime: GetTime,
};
