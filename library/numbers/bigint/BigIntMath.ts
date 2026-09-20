import { BigIntMethodBuilder } from "./BigIntBuilder";

class Factorial extends BigIntMethodBuilder {
  override call() {
    const [n] = this.args;
    const bigN = this.validateBigInt(n, "n");

    this.validateNonNegative(bigN, "n");

    if (bigN === 0n || bigN === 1n) {
      return 1n;
    }

    let result = 1n;
    for (let i = 2n; i <= bigN; i++) {
      result *= i;
    }

    return result;
  }
}

class GCD extends BigIntMethodBuilder {
  override call() {
    const [a, b] = this.args;
    let bigA = this.validateBigInt(a, "a");
    let bigB = this.validateBigInt(b, "b");

    bigA = bigA < 0n ? -bigA : bigA;
    bigB = bigB < 0n ? -bigB : bigB;

    while (bigB !== 0n) {
      const temp = bigB;
      bigB = bigA % bigB;
      bigA = temp;
    }

    return bigA;
  }
}

class LCM extends BigIntMethodBuilder {
  override call() {
    const [a, b] = this.args;
    const bigA = this.validateBigInt(a, "a");
    const bigB = this.validateBigInt(b, "b");

    if (bigA === 0n || bigB === 0n) {
      return 0n;
    }

    const gcd = new GCD([bigA, bigB], [], this.environment).call();
    return (bigA * bigB) / gcd;
  }
}

class ModPow extends BigIntMethodBuilder {
  override call() {
    const [base, exponent, modulus] = this.args;
    const bigBase = this.validateBigInt(base, "base");
    const bigExp = this.validateBigInt(exponent, "exponent");
    const bigMod = this.validateBigInt(modulus, "modulus");

    if (bigMod <= 0n) {
      throw this.throwErrorFormatters(new Error("modulus must be positive"));
    }

    if (bigExp < 0n) {
      throw this.throwErrorFormatters(new Error("exponent must be non-negative"));
    }

    if (bigExp === 0n) {
      return 1n % bigMod;
    }

    let result = 1n;
    let base_mod = bigBase % bigMod;
    let exp = bigExp;

    while (exp > 0n) {
      if (exp % 2n === 1n) {
        result = (result * base_mod) % bigMod;
      }
      exp = exp >> 1n;
      base_mod = (base_mod * base_mod) % bigMod;
    }

    return result;
  }
}

class ModInverse extends BigIntMethodBuilder {
  private extendedGCD(a: bigint, b: bigint): [bigint, bigint, bigint] {
    if (a === 0n) {
      return [b, 0n, 1n];
    }

    const [gcd, x1, y1] = this.extendedGCD(b % a, a);
    const x = y1 - (b / a) * x1;
    const y = x1;

    return [gcd, x, y];
  }

  override call() {
    const [a, m] = this.args;
    const bigA = this.validateBigInt(a, "a");
    const bigM = this.validateBigInt(m, "m");

    this.validatePositive(bigM, "modulus");

    const [gcd, x] = this.extendedGCD(bigA % bigM, bigM);

    if (gcd !== 1n) {
      throw this.throwErrorFormatters(new Error("modular inverse does not exist"));
    }

    return ((x % bigM) + bigM) % bigM;
  }
}

class IsPrime extends BigIntMethodBuilder {
  private millerRabinTest(n: bigint, k: number = 10): boolean {
    if (n === 2n || n === 3n) return true;
    if (n < 2n || n % 2n === 0n) return false;

    let r = 0;
    let d = n - 1n;
    while (d % 2n === 0n) {
      d /= 2n;
      r++;
    }

    for (let i = 0; i < k; i++) {
      const a = 2n + BigInt(Math.floor(Math.random() * Number(n - 4n)));
      let x = new ModPow([a, d, n], [], this.environment).call();

      if (x === 1n || x === n - 1n) continue;

      let composite = true;
      for (let j = 0; j < r - 1; j++) {
        x = (x * x) % n;
        if (x === n - 1n) {
          composite = false;
          break;
        }
      }

      if (composite) return false;
    }

    return true;
  }

  override call() {
    const [n] = this.args;
    const bigN = this.validateBigInt(n, "n");

    if (bigN < 2n) return false;

    const smallPrimes = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n];
    for (const prime of smallPrimes) {
      if (bigN === prime) return true;
      if (bigN % prime === 0n) return false;
    }

    return this.millerRabinTest(bigN);
  }
}

class NextPrime extends BigIntMethodBuilder {
  override call() {
    const [n] = this.args;
    let candidate = this.validateBigInt(n, "n");

    if (candidate < 2n) {
      return 2n;
    }

    if (candidate % 2n === 0n) {
      candidate++;
    }

    while (!new IsPrime([candidate], [], this.environment).call()) {
      candidate += 2n;
    }

    return candidate;
  }
}

class Fibonacci extends BigIntMethodBuilder {
  override call() {
    const [n] = this.args;
    const bigN = this.validateBigInt(n, "n");

    this.validateNonNegative(bigN, "n");

    if (bigN === 0n) return 0n;
    if (bigN === 1n) return 1n;

    let a = 0n;
    let b = 1n;

    for (let i = 2n; i <= bigN; i++) {
      const temp = a + b;
      a = b;
      b = temp;
    }

    return b;
  }
}

class Lucas extends BigIntMethodBuilder {
  override call() {
    const [n] = this.args;
    const bigN = this.validateBigInt(n, "n");

    this.validateNonNegative(bigN, "n");

    if (bigN === 0n) return 2n;
    if (bigN === 1n) return 1n;

    let a = 2n;
    let b = 1n;

    for (let i = 2n; i <= bigN; i++) {
      const temp = a + b;
      a = b;
      b = temp;
    }

    return b;
  }
}

class Sqrt extends BigIntMethodBuilder {
  override call() {
    const [n] = this.args;
    const bigN = this.validateBigInt(n, "n");

    this.validateNonNegative(bigN, "n");

    if (bigN === 0n) return 0n;
    if (bigN === 1n) return 1n;

    let x = bigN;
    let y = (x + 1n) / 2n;

    while (y < x) {
      x = y;
      y = (x + bigN / x) / 2n;
    }

    return x;
  }
}

class IsSquare extends BigIntMethodBuilder {
  override call() {
    const [n] = this.args;
    const bigN = this.validateBigInt(n, "n");

    this.validateNonNegative(bigN, "n");

    const sqrt = new Sqrt([bigN], [], this.environment).call();
    return sqrt * sqrt === bigN;
  }
}

class Binomial extends BigIntMethodBuilder {
  override call() {
    const [n, k] = this.args;
    const bigN = this.validateBigInt(n, "n");
    const bigK = this.validateBigInt(k, "k");

    this.validateNonNegative(bigN, "n");
    this.validateNonNegative(bigK, "k");

    if (bigK > bigN) return 0n;
    if (bigK === 0n || bigK === bigN) return 1n;

    const actualK = bigK > bigN - bigK ? bigN - bigK : bigK;

    let result = 1n;
    for (let i = 0n; i < actualK; i++) {
      result = (result * (bigN - i)) / (i + 1n);
    }

    return result;
  }
}

export {
  Factorial,
  GCD,
  LCM,
  ModPow,
  ModInverse,
  IsPrime,
  NextPrime,
  Fibonacci,
  Lucas,
  Sqrt,
  IsSquare,
  Binomial,
};
