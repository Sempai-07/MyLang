import { BigIntMethodBuilder } from "./BigIntBuilder";

class ToString extends BigIntMethodBuilder {
  override call() {
    const [value, base] = this.args;
    const bigValue = this.validateBigInt(value, "value");
    const radix = base !== undefined ? this.validateNumber(base, "base") : 10;

    if (radix < 2 || radix > 36) {
      throw this.throwErrorFormatters(new Error("base must be between 2 and 36"));
    }

    return bigValue.toString(radix);
  }
}

class FromString extends BigIntMethodBuilder {
  override call() {
    const [str, base] = this.args;

    if (typeof str !== "string") {
      throw this.throwErrorFormatters(new Error("first argument must be a string"));
    }

    const radix = base !== undefined ? this.validateNumber(base, "base") : 10;

    if (radix < 2 || radix > 36) {
      throw this.throwErrorFormatters(new Error("base must be between 2 and 36"));
    }

    try {
      if (radix === 10) {
        return BigInt(str);
      } else {
        const cleanStr = str.toLowerCase().trim();
        let negative = false;
        let parseStr = cleanStr;

        if (parseStr.startsWith("-")) {
          negative = true;
          parseStr = parseStr.slice(1);
        } else if (parseStr.startsWith("+")) {
          parseStr = parseStr.slice(1);
        }

        let result = 0n;
        const bigRadix = BigInt(radix);

        for (const char of parseStr) {
          let digit: number;

          if (char >= "0" && char <= "9") {
            digit = char.charCodeAt(0) - "0".charCodeAt(0);
          } else if (char >= "a" && char <= "z") {
            digit = char.charCodeAt(0) - "a".charCodeAt(0) + 10;
          } else {
            throw new Error(`Invalid character '${char}' for base ${radix}`);
          }

          if (digit >= radix) {
            throw new Error(`Invalid character '${char}' for base ${radix}`);
          }

          result = result * bigRadix + BigInt(digit);
        }

        return negative ? -result : result;
      }
    } catch (error) {
      throw this.throwErrorFormatters(
        new Error(`Cannot parse '${str}' as BigInt in base ${radix}`),
      );
    }
  }
}

class ToHex extends BigIntMethodBuilder {
  override call() {
    const [value] = this.args;
    const bigValue = this.validateBigInt(value, "value");
    return bigValue.toString(16);
  }
}

class ToBinary extends BigIntMethodBuilder {
  override call() {
    const [value] = this.args;
    const bigValue = this.validateBigInt(value, "value");
    return bigValue.toString(2);
  }
}

class ToOctal extends BigIntMethodBuilder {
  override call() {
    const [value] = this.args;
    const bigValue = this.validateBigInt(value, "value");
    return bigValue.toString(8);
  }
}

class ToBytes extends BigIntMethodBuilder {
  override call() {
    const [value, byteLength, byteOrder] = this.args;
    const bigValue = this.validateBigInt(value, "value");

    if (bigValue < 0n) {
      throw this.throwErrorFormatters(new Error("toBytes requires non-negative value"));
    }

    const length =
      byteLength !== undefined ? this.validateNumber(byteLength, "byteLength") : undefined;
    const order = byteOrder || "big";

    if (order !== "big" && order !== "little") {
      throw this.throwErrorFormatters(new Error("byteOrder must be 'big' or 'little'"));
    }

    let temp = bigValue;
    let minBytes = 0;

    if (temp === 0n) {
      minBytes = 1;
    } else {
      while (temp > 0n) {
        minBytes++;
        temp >>= 8n;
      }
    }

    const actualLength = length !== undefined ? length : minBytes;

    if (length !== undefined && actualLength < minBytes) {
      throw this.throwErrorFormatters(new Error("value too large for specified byte length"));
    }

    const bytes = new Array(actualLength).fill(0);
    temp = bigValue;

    if (order === "big") {
      for (let i = actualLength - 1; i >= 0; i--) {
        bytes[i] = Number(temp & 0xffn);
        temp >>= 8n;
      }
    } else {
      for (let i = 0; i < actualLength; i++) {
        bytes[i] = Number(temp & 0xffn);
        temp >>= 8n;
      }
    }

    return bytes;
  }
}

class FromBytes extends BigIntMethodBuilder {
  override call() {
    const [bytes, byteOrder] = this.args;
    const byteArray = this.validateArray(bytes, "bytes");
    const order = byteOrder || "big";

    if (order !== "big" && order !== "little") {
      throw this.throwErrorFormatters(new Error("byteOrder must be 'big' or 'little'"));
    }

    let result = 0n;

    if (order === "big") {
      for (const byte of byteArray) {
        const b = this.validateNumber(byte, "byte");
        if (b < 0 || b > 255) {
          throw this.throwErrorFormatters(new Error("byte values must be 0-255"));
        }
        result = (result << 8n) | BigInt(b);
      }
    } else {
      for (let i = byteArray.length - 1; i >= 0; i--) {
        const b = this.validateNumber(byteArray[i], "byte");
        if (b < 0 || b > 255) {
          throw this.throwErrorFormatters(new Error("byte values must be 0-255"));
        }
        result = (result << 8n) | BigInt(b);
      }
    }

    return result;
  }
}

class Random extends BigIntMethodBuilder {
  override call() {
    const [bits] = this.args;
    const numBits = this.validateNumber(bits, "bits");

    if (numBits <= 0) {
      throw this.throwErrorFormatters(new Error("bits must be positive"));
    }

    if (numBits > 1000000) {
      throw this.throwErrorFormatters(new Error("bits too large"));
    }

    let result = 0n;
    const fullBytes = Math.floor(numBits / 8);
    const remainingBits = numBits % 8;

    for (let i = 0; i < fullBytes; i++) {
      const randomByte = Math.floor(Math.random() * 256);
      result = (result << 8n) | BigInt(randomByte);
    }

    if (remainingBits > 0) {
      const mask = (1 << remainingBits) - 1;
      const randomBits = Math.floor(Math.random() * (mask + 1));
      result = (result << BigInt(remainingBits)) | BigInt(randomBits);
    }

    return result;
  }
}

class RandomRange extends BigIntMethodBuilder {
  override call() {
    const [min, max] = this.args;
    const bigMin = this.validateBigInt(min, "min");
    const bigMax = this.validateBigInt(max, "max");

    if (bigMin >= bigMax) {
      throw this.throwErrorFormatters(new Error("min must be less than max"));
    }

    const range = bigMax - bigMin;
    const bitLength = new (require("./BigIntBitwise").BitLength)(
      [range],
      [],
      this.environment,
    ).call();

    let result: bigint;
    do {
      result = new Random([bitLength + 1], [], this.environment).call();
    } while (result >= range);

    return bigMin + result;
  }
}

class Range extends BigIntMethodBuilder {
  override call() {
    const [start, stop, step] = this.args;

    let actualStart: bigint, actualStop: bigint, actualStep: bigint;

    if (stop === undefined) {
      actualStart = 0n;
      actualStop = this.validateBigInt(start, "stop");
      actualStep = 1n;
    } else {
      actualStart = this.validateBigInt(start, "start");
      actualStop = this.validateBigInt(stop, "stop");
      actualStep = step !== undefined ? this.validateBigInt(step, "step") : 1n;
    }

    if (actualStep === 0n) {
      throw this.throwErrorFormatters(new Error("step cannot be zero"));
    }

    const result: bigint[] = [];

    if (actualStep > 0n) {
      for (let i = actualStart; i < actualStop; i += actualStep) {
        result.push(i);
      }
    } else {
      for (let i = actualStart; i > actualStop; i += actualStep) {
        result.push(i);
      }
    }

    return result;
  }
}

class Sum extends BigIntMethodBuilder {
  override call() {
    const [values] = this.args;
    const array = this.validateArray(values, "values");

    let sum = 0n;
    for (const value of array) {
      sum += this.validateBigInt(value, "array element");
    }

    return sum;
  }
}

class Product extends BigIntMethodBuilder {
  override call() {
    const [values] = this.args;
    const array = this.validateArray(values, "values");

    if (array.length === 0) {
      return 1n;
    }

    let product = 1n;
    for (const value of array) {
      product *= this.validateBigInt(value, "array element");
    }

    return product;
  }
}

class IsEven extends BigIntMethodBuilder {
  override call() {
    const [value] = this.args;
    const bigValue = this.validateBigInt(value, "value");
    return bigValue % 2n === 0n;
  }
}

class IsOdd extends BigIntMethodBuilder {
  override call() {
    const [value] = this.args;
    const bigValue = this.validateBigInt(value, "value");
    return bigValue % 2n !== 0n;
  }
}

class Clamp extends BigIntMethodBuilder {
  override call() {
    const [value, min, max] = this.args;
    const bigValue = this.validateBigInt(value, "value");
    const bigMin = this.validateBigInt(min, "min");
    const bigMax = this.validateBigInt(max, "max");

    if (bigMin > bigMax) {
      throw this.throwErrorFormatters(new Error("min cannot be greater than max"));
    }

    if (bigValue < bigMin) return bigMin;
    if (bigValue > bigMax) return bigMax;
    return bigValue;
  }
}

class Format extends BigIntMethodBuilder {
  override call() {
    const [value, options] = this.args;
    const bigValue = this.validateBigInt(value, "value");
    const opts = options || {};

    const { groupSeparator = ",", groupSize = 3, prefix = "", suffix = "" } = opts;

    let str = bigValue.toString();
    let isNegative = false;

    if (str.startsWith("-")) {
      isNegative = true;
      str = str.slice(1);
    }

    if (groupSeparator && groupSize > 0) {
      const parts = [];
      for (let i = str.length; i > 0; i -= groupSize) {
        const start = Math.max(0, i - groupSize);
        parts.unshift(str.slice(start, i));
      }
      str = parts.join(groupSeparator);
    }

    return `${isNegative ? "-" : ""}${prefix}${str}${suffix}`;
  }
}

export {
  ToString,
  FromString,
  ToHex,
  ToBinary,
  ToOctal,
  ToBytes,
  FromBytes,
  Random,
  RandomRange,
  Range,
  Sum,
  Product,
  IsEven,
  IsOdd,
  Clamp,
  Format,
};
