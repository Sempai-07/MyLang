import { FunctionBuilder, FunctionBuilderCodeError } from "../FunctionBuilder";
import { Environment } from "../../src/Environment";
import { type StmtType } from "../../src/ast/StmtType";
import { isTypeArgs } from "../utils/utils";
import * as crypto from "crypto";

abstract class CryptoMethodBuilder extends FunctionBuilder {
  constructor(args: any[], astArgs: StmtType[], environment: Environment) {
    super(args, astArgs, environment);
  }

  get pkgInfo() {
    return {
      name: "crypto",
      path: __dirname,
    };
  }

  protected validateString(str: any, argName: string = "string"): void {
    if (isTypeArgs(str) !== "string") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "string",
        received: isTypeArgs(str),
      });
    }
  }

  protected validateBuffer(buf: any, argName: string = "buffer"): void {
    if (!Buffer.isBuffer(buf) && isTypeArgs(buf) !== "string") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "buffer or string",
        received: isTypeArgs(buf),
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

  protected toBuffer(data: any): Buffer {
    if (Buffer.isBuffer(data?.[Environment.SymbolBuffer] || data)) {
      return data?.[Environment.SymbolBuffer] || data;
    }
    return Buffer.from(String(data), "utf-8");
  }

  call() {
    throw new Error("Call is not implemented");
  }
}

// Hash functions
class Md5 extends CryptoMethodBuilder {
  override call() {
    const [data] = this.args;
    this.validateBuffer(data, "data");

    return crypto.createHash("md5").update(this.toBuffer(data)).digest("hex");
  }
}

class Sha1 extends CryptoMethodBuilder {
  override call() {
    const [data] = this.args;
    this.validateBuffer(data, "data");

    return crypto.createHash("sha1").update(this.toBuffer(data)).digest("hex");
  }
}

class Sha256 extends CryptoMethodBuilder {
  override call() {
    const [data] = this.args;
    this.validateBuffer(data, "data");

    return crypto.createHash("sha256").update(this.toBuffer(data)).digest("hex");
  }
}

class Sha512 extends CryptoMethodBuilder {
  override call() {
    const [data] = this.args;
    this.validateBuffer(data, "data");

    return crypto.createHash("sha512").update(this.toBuffer(data)).digest("hex");
  }
}

class Hash extends CryptoMethodBuilder {
  override call() {
    const [algorithm, data, encoding = "hex"] = this.args;
    this.validateString(algorithm, "algorithm");
    this.validateBuffer(data, "data");
    this.validateString(encoding, "encoding");

    return crypto.createHash(algorithm).update(this.toBuffer(data)).digest(encoding as BufferEncoding);
  }
}

// HMAC functions
class HmacMd5 extends CryptoMethodBuilder {
  override call() {
    const [data, key] = this.args;
    this.validateBuffer(data, "data");
    this.validateBuffer(key, "key");

    return crypto.createHmac("md5", this.toBuffer(key)).update(this.toBuffer(data)).digest("hex");
  }
}

class HmacSha256 extends CryptoMethodBuilder {
  override call() {
    const [data, key] = this.args;
    this.validateBuffer(data, "data");
    this.validateBuffer(key, "key");

    return crypto.createHmac("sha256", this.toBuffer(key)).update(this.toBuffer(data)).digest("hex");
  }
}

class HmacSha512 extends CryptoMethodBuilder {
  override call() {
    const [data, key] = this.args;
    this.validateBuffer(data, "data");
    this.validateBuffer(key, "key");

    return crypto.createHmac("sha512", this.toBuffer(key)).update(this.toBuffer(data)).digest("hex");
  }
}

class Hmac extends CryptoMethodBuilder {
  override call() {
    const [algorithm, data, key, encoding = "hex"] = this.args;
    this.validateString(algorithm, "algorithm");
    this.validateBuffer(data, "data");
    this.validateBuffer(key, "key");
    this.validateString(encoding, "encoding");

    return crypto.createHmac(algorithm, this.toBuffer(key)).update(this.toBuffer(data)).digest(encoding as BufferEncoding);
  }
}

// Encoding functions
class Base64Encode extends CryptoMethodBuilder {
  override call() {
    const [data] = this.args;
    this.validateBuffer(data, "data");

    return this.toBuffer(data).toString("base64");
  }
}

class Base64Decode extends CryptoMethodBuilder {
  override call() {
    const [data] = this.args;
    this.validateString(data, "data");

    return Buffer.from(data, "base64").toString("utf-8");
  }
}

class HexEncode extends CryptoMethodBuilder {
  override call() {
    const [data] = this.args;
    this.validateBuffer(data, "data");

    return this.toBuffer(data).toString("hex");
  }
}

class HexDecode extends CryptoMethodBuilder {
  override call() {
    const [data] = this.args;
    this.validateString(data, "data");

    return Buffer.from(data, "hex").toString("utf-8");
  }
}

// Random generation
class RandomBytes extends CryptoMethodBuilder {
  override call() {
    const [size, encoding = "hex"] = this.args;
    this.validateNumber(size, "size");

    if (encoding !== undefined) {
      this.validateString(encoding, "encoding");
    }

    const buffer = crypto.randomBytes(size);
    return encoding ? buffer.toString(encoding as BufferEncoding) : buffer;
  }
}

class RandomInt extends CryptoMethodBuilder {
  override call() {
    const [min, max] = this.args;

    if (max === undefined) {
      // Only one argument - treat as max
      this.validateNumber(min, "max");
      return crypto.randomInt(min);
    }

    this.validateNumber(min, "min");
    this.validateNumber(max, "max");

    return crypto.randomInt(min, max);
  }
}

class RandomUUID extends CryptoMethodBuilder {
  override call() {
    return crypto.randomUUID();
  }
}

// Encryption/Decryption (AES)
class AesEncrypt extends CryptoMethodBuilder {
  override call() {
    const [data, key, iv = null, algorithm = "aes-256-cbc"] = this.args;
    this.validateBuffer(data, "data");
    this.validateBuffer(key, "key");
    this.validateString(algorithm, "algorithm");

    const keyBuffer = this.toBuffer(key);
    const cipher = iv 
      ? crypto.createCipheriv(algorithm, keyBuffer, this.toBuffer(iv))
      : crypto.createCipher(algorithm as any, keyBuffer);

    let encrypted = cipher.update(this.toBuffer(data), undefined, "hex");
    encrypted += cipher.final("hex");

    return encrypted;
  }
}

class AesDecrypt extends CryptoMethodBuilder {
  override call() {
    const [encryptedData, key, iv = null, algorithm = "aes-256-cbc"] = this.args;
    this.validateString(encryptedData, "encryptedData");
    this.validateBuffer(key, "key");
    this.validateString(algorithm, "algorithm");

    const keyBuffer = this.toBuffer(key);
    const decipher = iv
      ? crypto.createDecipheriv(algorithm, keyBuffer, this.toBuffer(iv))
      : crypto.createDecipher(algorithm as any, keyBuffer);

    let decrypted = decipher.update(encryptedData, "hex", "utf-8");
    decrypted += decipher.final("utf-8");

    return decrypted;
  }
}

// Comparison
class TimingSafeEqual extends CryptoMethodBuilder {
  override call() {
    const [a, b] = this.args;
    this.validateBuffer(a, "a");
    this.validateBuffer(b, "b");

    const bufferA = this.toBuffer(a);
    const bufferB = this.toBuffer(b);

    if (bufferA.length !== bufferB.length) {
      return false;
    }

    return crypto.timingSafeEqual(bufferA, bufferB);
  }
}

// PBKDF2
class Pbkdf2 extends CryptoMethodBuilder {
  override call() {
    const [password, salt, iterations, keylen, digest = "sha256"] = this.args;
    this.validateBuffer(password, "password");
    this.validateBuffer(salt, "salt");
    this.validateNumber(iterations, "iterations");
    this.validateNumber(keylen, "keylen");
    this.validateString(digest, "digest");

    return crypto.pbkdf2Sync(
      this.toBuffer(password),
      this.toBuffer(salt),
      iterations,
      keylen,
      digest
    ).toString("hex");
  }
}

// Scrypt
class Scrypt extends CryptoMethodBuilder {
  override call() {
    const [password, salt, keylen, options = {}] = this.args;
    this.validateBuffer(password, "password");
    this.validateBuffer(salt, "salt");
    this.validateNumber(keylen, "keylen");

    return crypto.scryptSync(
      this.toBuffer(password),
      this.toBuffer(salt),
      keylen,
      options
    ).toString("hex");
  }
}

module.exports = {
  // Hash
  md5: Md5,
  sha1: Sha1,
  sha256: Sha256,
  sha512: Sha512,
  hash: Hash,

  // HMAC
  hmacMd5: HmacMd5,
  hmacSha256: HmacSha256,
  hmacSha512: HmacSha512,
  hmac: Hmac,

  // Encoding
  base64Encode: Base64Encode,
  base64Decode: Base64Decode,
  hexEncode: HexEncode,
  hexDecode: HexDecode,

  // Random
  randomBytes: RandomBytes,
  randomInt: RandomInt,
  randomUUID: RandomUUID,

  // Encryption
  aesEncrypt: AesEncrypt,
  aesDecrypt: AesDecrypt,

  // Comparison
  timingSafeEqual: TimingSafeEqual,

  // Key derivation
  pbkdf2: Pbkdf2,
  scrypt: Scrypt,
};