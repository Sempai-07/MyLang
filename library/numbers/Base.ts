import { NumbersMethodBuilder } from "./NumbersBuilder";

class Add extends NumbersMethodBuilder {
  override call() {
    const [a, b] = this.args;
    this.validateNumber(a, "a");
    this.validateNumber(b, "b");
    return Number(a) + Number(b);
  }
}

class Subtract extends NumbersMethodBuilder {
  override call() {
    const [a, b] = this.args;
    this.validateNumber(a, "a");
    this.validateNumber(b, "b");
    return Number(a) - Number(b);
  }
}

class Multiply extends NumbersMethodBuilder {
  override call() {
    const [a, b] = this.args;
    this.validateNumber(a, "a");
    this.validateNumber(b, "b");
    return Number(a) * Number(b);
  }
}

class Divide extends NumbersMethodBuilder {
  override call() {
    const [a, b] = this.args;
    this.validateNumber(a, "dividend");
    this.validateNumber(b, "divisor");

    if (Number(b) === 0) {
      throw this.throwErrorFormatters(new Error("Division by zero"));
    }

    return Number(a) / Number(b);
  }
}

class Power extends NumbersMethodBuilder {
  override call() {
    const [base, exponent] = this.args;
    this.validateNumber(base, "base");
    this.validateNumber(exponent, "exponent");

    return Math.pow(Number(base), Number(exponent));
  }
}

class Sqrt extends NumbersMethodBuilder {
  override call() {
    const [n] = this.args;
    this.validateNumber(n, "number");

    const num = Number(n);
    if (num < 0) {
      throw this.throwErrorFormatters(new Error("Cannot calculate square root of negative number"));
    }

    return Math.sqrt(num);
  }
}

class Cbrt extends NumbersMethodBuilder {
  override call() {
    const [n] = this.args;
    this.validateNumber(n, "number");

    return Math.cbrt(Number(n));
  }
}

class Abs extends NumbersMethodBuilder {
  override call() {
    const [n] = this.args;
    this.validateNumber(n, "number");

    return Math.abs(Number(n));
  }
}

class Sign extends NumbersMethodBuilder {
  override call() {
    const [n] = this.args;
    this.validateNumber(n, "number");

    return Math.sign(Number(n));
  }
}

class Floor extends NumbersMethodBuilder {
  override call() {
    const [n] = this.args;
    this.validateNumber(n, "number");

    return Math.floor(Number(n));
  }
}

class Ceil extends NumbersMethodBuilder {
  override call() {
    const [n] = this.args;
    this.validateNumber(n, "number");

    return Math.ceil(Number(n));
  }
}

class Round extends NumbersMethodBuilder {
  override call() {
    const [n, precision] = this.args;
    this.validateNumber(n, "number");

    const num = Number(n);

    if (precision !== undefined) {
      this.validateInteger(precision, "precision");
      const p = Number(precision);
      const multiplier = Math.pow(10, p);
      return Math.round(num * multiplier) / multiplier;
    }

    return Math.round(num);
  }
}

class Trunc extends NumbersMethodBuilder {
  override call() {
    const [n] = this.args;
    this.validateNumber(n, "number");

    return Math.trunc(Number(n));
  }
}

class Mod extends NumbersMethodBuilder {
  override call() {
    const [a, b] = this.args;
    this.validateNumber(a, "dividend");
    this.validateNumber(b, "divisor");

    const divisor = Number(b);
    if (divisor === 0) {
      throw this.throwErrorFormatters(new Error("Modulo by zero"));
    }

    return Number(a) % divisor;
  }
}

class DivMod extends NumbersMethodBuilder {
  override call() {
    const [a, b] = this.args;
    this.validateNumber(a, "dividend");
    this.validateNumber(b, "divisor");

    const dividend = Number(a);
    const divisor = Number(b);

    if (divisor === 0) {
      throw this.throwErrorFormatters(new Error("Division by zero"));
    }

    const quotient = Math.floor(dividend / divisor);
    const remainder = dividend % divisor;

    return [quotient, remainder];
  }
}

class Max extends NumbersMethodBuilder {
  override call() {
    if (this.args.length === 0) {
      throw this.throwErrorFormatters(new Error("max() requires at least one argument"));
    }

    if (this.args.length === 1 && Array.isArray(this.args[0])) {
      const arr = this.validateNumericArray(this.args[0], "array");
      return Math.max(...arr);
    }

    const numbers: number[] = [];
    for (let i = 0; i < this.args.length; i++) {
      this.validateNumber(this.args[i], `argument ${i}`);
      numbers.push(Number(this.args[i]));
    }

    return Math.max(...numbers);
  }
}

class Min extends NumbersMethodBuilder {
  override call() {
    if (this.args.length === 0) {
      throw this.throwErrorFormatters(new Error("min() requires at least one argument"));
    }

    if (this.args.length === 1 && Array.isArray(this.args[0])) {
      const arr = this.validateNumericArray(this.args[0], "array");
      return Math.min(...arr);
    }

    const numbers: number[] = [];
    for (let i = 0; i < this.args.length; i++) {
      this.validateNumber(this.args[i], `argument ${i}`);
      numbers.push(Number(this.args[i]));
    }

    return Math.min(...numbers);
  }
}

class Sum extends NumbersMethodBuilder {
  override call() {
    const [arr] = this.args;
    const numbers = this.validateNumericArray(arr, "array");

    return numbers.reduce((sum, num) => sum + num, 0);
  }
}

class Product extends NumbersMethodBuilder {
  override call() {
    const [arr] = this.args;
    const numbers = this.validateNumericArray(arr, "array");

    return numbers.reduce((product, num) => product * num, 1);
  }
}

export {
  Add,
  Subtract,
  Multiply,
  Divide,
  Power,
  Sqrt,
  Cbrt,
  Abs,
  Sign,
  Floor,
  Ceil,
  Round,
  Trunc,
  Mod,
  DivMod,
  Max,
  Min,
  Sum,
  Product,
};
