import { BigIntMethodBuilder } from "./BigIntBuilder";

class BitwiseAnd extends BigIntMethodBuilder {
  override call() {
    const [a, b] = this.args;
    const bigA = this.validateBigInt(a, "a");
    const bigB = this.validateBigInt(b, "b");
    return bigA & bigB;
  }
}

class BitwiseOr extends BigIntMethodBuilder {
  override call() {
    const [a, b] = this.args;
    const bigA = this.validateBigInt(a, "a");
    const bigB = this.validateBigInt(b, "b");
    return bigA | bigB;
  }
}

class BitwiseXor extends BigIntMethodBuilder {
  override call() {
    const [a, b] = this.args;
    const bigA = this.validateBigInt(a, "a");
    const bigB = this.validateBigInt(b, "b");
    return bigA ^ bigB;
  }
}

class BitwiseNot extends BigIntMethodBuilder {
  override call() {
    const [value] = this.args;
    const bigValue = this.validateBigInt(value, "value");
    return ~bigValue;
  }
}

class LeftShift extends BigIntMethodBuilder {
  override call() {
    const [value, shift] = this.args;
    const bigValue = this.validateBigInt(value, "value");
    const bigShift = this.validateBigInt(shift, "shift");

    this.validateNonNegative(bigShift, "shift");

    return bigValue << bigShift;
  }
}

class RightShift extends BigIntMethodBuilder {
  override call() {
    const [value, shift] = this.args;
    const bigValue = this.validateBigInt(value, "value");
    const bigShift = this.validateBigInt(shift, "shift");

    this.validateNonNegative(bigShift, "shift");

    return bigValue >> bigShift;
  }
}

class PopCount extends BigIntMethodBuilder {
  override call() {
    const [value] = this.args;
    const bigValue = this.validateBigInt(value, "value");

    if (bigValue < 0n) {
      throw this.throwErrorFormatters(new Error("popcount requires non-negative value"));
    }

    let count = 0n;
    let temp = bigValue;

    while (temp > 0n) {
      count += temp & 1n;
      temp >>= 1n;
    }

    return count;
  }
}

class BitLength extends BigIntMethodBuilder {
  override call() {
    const [value] = this.args;
    const bigValue = this.validateBigInt(value, "value");

    if (bigValue === 0n) return 0;

    const absValue = bigValue < 0n ? -bigValue : bigValue;
    let length = 0;
    let temp = absValue;

    while (temp > 0n) {
      length++;
      temp >>= 1n;
    }

    return length;
  }
}

class TestBit extends BigIntMethodBuilder {
  override call() {
    const [value, position] = this.args;
    const bigValue = this.validateBigInt(value, "value");
    const pos = this.validateNumber(position, "position");

    if (pos < 0) {
      throw this.throwErrorFormatters(new Error("bit position must be non-negative"));
    }

    return (bigValue >> BigInt(pos)) & 1n;
  }
}

class SetBit extends BigIntMethodBuilder {
  override call() {
    const [value, position] = this.args;
    const bigValue = this.validateBigInt(value, "value");
    const pos = this.validateNumber(position, "position");

    if (pos < 0) {
      throw this.throwErrorFormatters(new Error("bit position must be non-negative"));
    }

    return bigValue | (1n << BigInt(pos));
  }
}

class ClearBit extends BigIntMethodBuilder {
  override call() {
    const [value, position] = this.args;
    const bigValue = this.validateBigInt(value, "value");
    const pos = this.validateNumber(position, "position");

    if (pos < 0) {
      throw this.throwErrorFormatters(new Error("bit position must be non-negative"));
    }

    return bigValue & ~(1n << BigInt(pos));
  }
}

class FlipBit extends BigIntMethodBuilder {
  override call() {
    const [value, position] = this.args;
    const bigValue = this.validateBigInt(value, "value");
    const pos = this.validateNumber(position, "position");

    if (pos < 0) {
      throw this.throwErrorFormatters(new Error("bit position must be non-negative"));
    }

    return bigValue ^ (1n << BigInt(pos));
  }
}

class NextPowerOfTwo extends BigIntMethodBuilder {
  override call() {
    const [value] = this.args;
    const bigValue = this.validateBigInt(value, "value");

    if (bigValue <= 0n) {
      return 1n;
    }

    if ((bigValue & (bigValue - 1n)) === 0n) {
      return bigValue;
    }

    let power = 1n;
    while (power < bigValue) {
      power <<= 1n;
    }

    return power;
  }
}

class IsPowerOfTwo extends BigIntMethodBuilder {
  override call() {
    const [value] = this.args;
    const bigValue = this.validateBigInt(value, "value");

    return bigValue > 0n && (bigValue & (bigValue - 1n)) === 0n;
  }
}

class TrailingZeros extends BigIntMethodBuilder {
  override call() {
    const [value] = this.args;
    const bigValue = this.validateBigInt(value, "value");

    if (bigValue === 0n) {
      throw this.throwErrorFormatters(new Error("trailing zeros undefined for zero"));
    }

    let count = 0;
    let temp = bigValue < 0n ? -bigValue : bigValue;

    while ((temp & 1n) === 0n) {
      count++;
      temp >>= 1n;
    }

    return count;
  }
}

class LeadingZeros extends BigIntMethodBuilder {
  override call() {
    const [value, width] = this.args;
    const bigValue = this.validateBigInt(value, "value");
    const bitWidth = this.validateNumber(width, "width");

    if (bitWidth <= 0) {
      throw this.throwErrorFormatters(new Error("width must be positive"));
    }

    if (bigValue < 0n) {
      throw this.throwErrorFormatters(new Error("leading zeros requires non-negative value"));
    }

    const actualBitLength = new BitLength([bigValue], [], this.environment).call();

    if (actualBitLength > bitWidth) {
      return 0;
    }

    return bitWidth - actualBitLength;
  }
}

export {
  BitwiseAnd,
  BitwiseOr,
  BitwiseXor,
  BitwiseNot,
  LeftShift,
  RightShift,
  PopCount,
  BitLength,
  TestBit,
  SetBit,
  ClearBit,
  FlipBit,
  NextPowerOfTwo,
  IsPowerOfTwo,
  TrailingZeros,
  LeadingZeros,
};
