import { NumbersMethodBuilder, NumbersUtils } from "./NumbersBuilder";

class Factorial extends NumbersMethodBuilder {
  override call() {
    const [n] = this.args;
    this.validateInteger(n, "n");

    const num = Number(n);
    this.validateNonNegativeNumber(num, "n");

    return NumbersUtils.factorial(num);
  }
}

class Gcd extends NumbersMethodBuilder {
  override call() {
    if (this.args.length < 2) {
      throw this.throwErrorFormatters(new Error("gcd() requires at least 2 arguments"));
    }

    let result = Number(this.args[0]);
    this.validateInteger(this.args[0], "first argument");

    for (let i = 1; i < this.args.length; i++) {
      this.validateInteger(this.args[i], `argument ${i}`);
      result = NumbersUtils.gcd(result, Number(this.args[i]));
    }

    return result;
  }
}

class Lcm extends NumbersMethodBuilder {
  override call() {
    if (this.args.length < 2) {
      throw this.throwErrorFormatters(new Error("lcm() requires at least 2 arguments"));
    }

    let result = Number(this.args[0]);
    this.validateInteger(this.args[0], "first argument");

    for (let i = 1; i < this.args.length; i++) {
      this.validateInteger(this.args[i], `argument ${i}`);
      result = NumbersUtils.lcm(result, Number(this.args[i]));
    }

    return result;
  }
}

class IsPrime extends NumbersMethodBuilder {
  override call() {
    const [n] = this.args;
    this.validateInteger(n, "n");

    return NumbersUtils.isPrime(Number(n));
  }
}

class PrimeFactors extends NumbersMethodBuilder {
  override call() {
    const [n] = this.args;
    this.validateInteger(n, "n");

    const num = Number(n);
    if (num < 2) {
      throw this.throwErrorFormatters(new Error("Prime factorization requires n >= 2"));
    }

    return NumbersUtils.primeFactors(num);
  }
}

class Fibonacci extends NumbersMethodBuilder {
  override call() {
    const [n] = this.args;
    this.validateInteger(n, "n");

    const num = Number(n);
    this.validateNonNegativeNumber(num, "n");

    return NumbersUtils.fibonacci(num);
  }
}

class Combinations extends NumbersMethodBuilder {
  override call() {
    const [n, k] = this.args;
    this.validateInteger(n, "n");
    this.validateInteger(k, "k");

    const nNum = Number(n);
    const kNum = Number(k);

    this.validateNonNegativeNumber(nNum, "n");
    this.validateNonNegativeNumber(kNum, "k");

    return NumbersUtils.combinations(nNum, kNum);
  }
}

class Permutations extends NumbersMethodBuilder {
  override call() {
    const [n, k] = this.args;
    this.validateInteger(n, "n");
    this.validateInteger(k, "k");

    const nNum = Number(n);
    const kNum = Number(k);

    this.validateNonNegativeNumber(nNum, "n");
    this.validateNonNegativeNumber(kNum, "k");

    return NumbersUtils.permutations(nNum, kNum);
  }
}

class Log extends NumbersMethodBuilder {
  override call() {
    const [n, base] = this.args;
    this.validateNumber(n, "n");

    const num = Number(n);
    this.validatePositiveNumber(num, "n");

    if (base !== undefined) {
      this.validateNumber(base, "base");
      const baseNum = Number(base);
      this.validatePositiveNumber(baseNum, "base");

      if (baseNum === 1) {
        throw this.throwErrorFormatters(new Error("Logarithm base cannot be 1"));
      }

      return Math.log(num) / Math.log(baseNum);
    }

    return Math.log(num);
  }
}

class Log10 extends NumbersMethodBuilder {
  override call() {
    const [n] = this.args;
    this.validateNumber(n, "n");

    const num = Number(n);
    this.validatePositiveNumber(num, "n");

    return Math.log10(num);
  }
}

class Log2 extends NumbersMethodBuilder {
  override call() {
    const [n] = this.args;
    this.validateNumber(n, "n");

    const num = Number(n);
    this.validatePositiveNumber(num, "n");

    return Math.log2(num);
  }
}

class Exp extends NumbersMethodBuilder {
  override call() {
    const [n] = this.args;
    this.validateNumber(n, "n");

    return Math.exp(Number(n));
  }
}

class Exp2 extends NumbersMethodBuilder {
  override call() {
    const [n] = this.args;
    this.validateNumber(n, "n");

    return Math.pow(2, Number(n));
  }
}

class Sin extends NumbersMethodBuilder {
  override call() {
    const [n] = this.args;
    this.validateNumber(n, "angle");

    return Math.sin(Number(n));
  }
}

class Cos extends NumbersMethodBuilder {
  override call() {
    const [n] = this.args;
    this.validateNumber(n, "angle");

    return Math.cos(Number(n));
  }
}

class Tan extends NumbersMethodBuilder {
  override call() {
    const [n] = this.args;
    this.validateNumber(n, "angle");

    return Math.tan(Number(n));
  }
}

class Asin extends NumbersMethodBuilder {
  override call() {
    const [n] = this.args;
    this.validateNumber(n, "value");

    const num = Number(n);
    this.validateRange(num, -1, 1, "value");

    return Math.asin(num);
  }
}

class Acos extends NumbersMethodBuilder {
  override call() {
    const [n] = this.args;
    this.validateNumber(n, "value");

    const num = Number(n);
    this.validateRange(num, -1, 1, "value");

    return Math.acos(num);
  }
}

class Atan extends NumbersMethodBuilder {
  override call() {
    const [n] = this.args;
    this.validateNumber(n, "value");

    return Math.atan(Number(n));
  }
}

class Atan2 extends NumbersMethodBuilder {
  override call() {
    const [y, x] = this.args;
    this.validateNumber(y, "y");
    this.validateNumber(x, "x");

    return Math.atan2(Number(y), Number(x));
  }
}

class Sinh extends NumbersMethodBuilder {
  override call() {
    const [n] = this.args;
    this.validateNumber(n, "value");

    return Math.sinh(Number(n));
  }
}

class Cosh extends NumbersMethodBuilder {
  override call() {
    const [n] = this.args;
    this.validateNumber(n, "value");

    return Math.cosh(Number(n));
  }
}

class Tanh extends NumbersMethodBuilder {
  override call() {
    const [n] = this.args;
    this.validateNumber(n, "value");

    return Math.tanh(Number(n));
  }
}

class Asinh extends NumbersMethodBuilder {
  override call() {
    const [n] = this.args;
    this.validateNumber(n, "value");

    return Math.asinh(Number(n));
  }
}

class Acosh extends NumbersMethodBuilder {
  override call() {
    const [n] = this.args;
    this.validateNumber(n, "value");

    const num = Number(n);
    if (num < 1) {
      throw this.throwErrorFormatters(new Error("acosh requires value >= 1"));
    }

    return Math.acosh(num);
  }
}

class Atanh extends NumbersMethodBuilder {
  override call() {
    const [n] = this.args;
    this.validateNumber(n, "value");

    const num = Number(n);
    this.validateRange(num, -1, 1, "value");

    return Math.atanh(num);
  }
}

class Degrees extends NumbersMethodBuilder {
  override call() {
    const [radians] = this.args;
    this.validateNumber(radians, "radians");

    return Number(radians) * (180 / Math.PI);
  }
}

class Radians extends NumbersMethodBuilder {
  override call() {
    const [degrees] = this.args;
    this.validateNumber(degrees, "degrees");

    return Number(degrees) * (Math.PI / 180);
  }
}

export {
  Factorial,
  Gcd,
  Lcm,
  IsPrime,
  PrimeFactors,
  Fibonacci,
  Combinations,
  Permutations,
  Log,
  Log10,
  Log2,
  Exp,
  Exp2,
  Sin,
  Cos,
  Tan,
  Asin,
  Acos,
  Atan,
  Atan2,
  Sinh,
  Cosh,
  Tanh,
  Asinh,
  Acosh,
  Atanh,
  Degrees,
  Radians,
};
