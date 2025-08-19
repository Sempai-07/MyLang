import { NumbersMethodBuilder } from "./NumbersBuilder";

class LinSpace extends NumbersMethodBuilder {
  override call() {
    const [start, stop, num] = this.args;
    this.validateNumber(start, "start");
    this.validateNumber(stop, "stop");

    const numPoints = num !== undefined ? Number(num) : 50;
    this.validateInteger(numPoints, "num");
    this.validatePositiveNumber(numPoints, "num");

    const startNum = Number(start);
    const stopNum = Number(stop);

    if (numPoints === 1) {
      return [startNum];
    }

    const step = (stopNum - startNum) / (numPoints - 1);
    const result: number[] = [];

    for (let i = 0; i < numPoints; i++) {
      result.push(startNum + i * step);
    }

    return result;
  }
}

class ARange extends NumbersMethodBuilder {
  override call() {
    const [start, stop, step] = this.args;

    let actualStart: number, actualStop: number, actualStep: number;

    if (stop === undefined) {
      actualStart = 0;
      actualStop = Number(start);
      actualStep = 1;
    } else if (step === undefined) {
      actualStart = Number(start);
      actualStop = Number(stop);
      actualStep = 1;
    } else {
      actualStart = Number(start);
      actualStop = Number(stop);
      actualStep = Number(step);
    }

    this.validateNumber(actualStart, "start");
    this.validateNumber(actualStop, "stop");
    this.validateNumber(actualStep, "step");

    if (actualStep === 0) {
      throw this.throwErrorFormatters(new Error("Step cannot be zero"));
    }

    const result: number[] = [];

    if (actualStep > 0) {
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

class Zeros extends NumbersMethodBuilder {
  override call() {
    const [size] = this.args;
    this.validateInteger(size, "size");

    const sizeNum = Number(size);
    this.validateNonNegativeNumber(sizeNum, "size");

    return new Array(sizeNum).fill(0);
  }
}

class Ones extends NumbersMethodBuilder {
  override call() {
    const [size] = this.args;
    this.validateInteger(size, "size");

    const sizeNum = Number(size);
    this.validateNonNegativeNumber(sizeNum, "size");

    return new Array(sizeNum).fill(1);
  }
}

class Full extends NumbersMethodBuilder {
  override call() {
    const [size, fillValue] = this.args;
    this.validateInteger(size, "size");
    this.validateNumber(fillValue, "fillValue");

    const sizeNum = Number(size);
    this.validateNonNegativeNumber(sizeNum, "size");

    return new Array(sizeNum).fill(Number(fillValue));
  }
}

class Cumsum extends NumbersMethodBuilder {
  override call() {
    const [arr] = this.args;
    const numbers = this.validateNumericArray(arr, "array");

    const result: number[] = [];
    let sum = 0;

    for (const num of numbers) {
      sum += num;
      result.push(sum);
    }

    return result;
  }
}

class Cumprod extends NumbersMethodBuilder {
  override call() {
    const [arr] = this.args;
    const numbers = this.validateNumericArray(arr, "array");

    const result: number[] = [];
    let product = 1;

    for (const num of numbers) {
      product *= num;
      result.push(product);
    }

    return result;
  }
}

class Diff extends NumbersMethodBuilder {
  override call() {
    const [arr, n] = this.args;
    const numbers = this.validateNumericArray(arr, "array");

    const order = n !== undefined ? Number(n) : 1;
    this.validateInteger(order, "n");
    this.validatePositiveNumber(order, "n");

    let result = [...numbers];

    for (let i = 0; i < order; i++) {
      if (result.length === 0) break;

      const newResult: number[] = [];
      for (let j = 1; j < result.length; j++) {
        newResult.push(result[j]! - result[j - 1]!);
      }
      result = newResult;
    }

    return result;
  }
}

class Gradient extends NumbersMethodBuilder {
  override call() {
    const [arr, spacing] = this.args;
    const numbers = this.validateNumericArray(arr, "array");

    const dx = spacing !== undefined ? Number(spacing) : 1;
    this.validateNumber(dx, "spacing");
    this.validatePositiveNumber(dx, "spacing");

    if (numbers.length < 2) {
      throw this.throwErrorFormatters(new Error("Gradient requires at least 2 points"));
    }

    const result: number[] = [];

    result.push((numbers[1]! - numbers[0]!) / dx);

    for (let i = 1; i < numbers.length - 1; i++) {
      result.push((numbers[i + 1]! - numbers[i - 1]!) / (2 * dx));
    }

    const n = numbers.length;
    result.push((numbers[n - 1]! - numbers[n - 2]!) / dx);

    return result;
  }
}

class Unique extends NumbersMethodBuilder {
  override call() {
    const [arr] = this.args;
    const numbers = this.validateNumericArray(arr, "array");

    return [...new Set(numbers)].sort((a, b) => a - b);
  }
}

class ArgMax extends NumbersMethodBuilder {
  override call() {
    const [arr] = this.args;
    const numbers = this.validateNumericArray(arr, "array");

    let maxIndex = 0;
    let maxValue = numbers[0]!;

    for (let i = 1; i < numbers.length; i++) {
      if (numbers[i]! > maxValue) {
        maxValue = numbers[i]!;
        maxIndex = i;
      }
    }

    return maxIndex;
  }
}

class ArgMin extends NumbersMethodBuilder {
  override call() {
    const [arr] = this.args;
    const numbers = this.validateNumericArray(arr, "array");

    let minIndex = 0;
    let minValue = numbers[0]!;

    for (let i = 1; i < numbers.length; i++) {
      if (numbers[i]! < minValue) {
        minValue = numbers[i]!;
        minIndex = i;
      }
    }

    return minIndex;
  }
}

class Sort extends NumbersMethodBuilder {
  override call() {
    const [arr, reverse] = this.args;
    const numbers = this.validateNumericArray(arr, "array");

    const isReverse = reverse === true;

    return [...numbers].sort((a, b) => (isReverse ? b - a : a - b));
  }
}

class ArgSort extends NumbersMethodBuilder {
  override call() {
    const [arr, reverse] = this.args;
    const numbers = this.validateNumericArray(arr, "array");

    const isReverse = reverse === true;
    const indexed = numbers.map((value, index) => ({ value, index }));

    indexed.sort((a, b) => (isReverse ? b.value - a.value : a.value - b.value));

    return indexed.map((item) => item.index);
  }
}

class Reshape extends NumbersMethodBuilder {
  override call() {
    const [arr, rows, cols] = this.args;
    const numbers = this.validateNumericArray(arr, "array");
    this.validateInteger(rows, "rows");
    this.validateInteger(cols, "cols");

    const rowsNum = Number(rows);
    const colsNum = Number(cols);

    this.validatePositiveNumber(rowsNum, "rows");
    this.validatePositiveNumber(colsNum, "cols");

    if (rowsNum * colsNum !== numbers.length) {
      throw this.throwErrorFormatters(
        new Error(`Cannot reshape array of size ${numbers.length} into ${rowsNum}x${colsNum}`),
      );
    }

    const result: number[][] = [];

    for (let i = 0; i < rowsNum; i++) {
      const row: number[] = [];
      for (let j = 0; j < colsNum; j++) {
        row.push(numbers[i * colsNum + j]!);
      }
      result.push(row);
    }

    return result;
  }
}

class Flatten extends NumbersMethodBuilder {
  override call() {
    const [arr] = this.args;
    this.validateArray(arr, "array");

    const flatten = (input: any[]): number[] => {
      const result: number[] = [];

      for (const item of input) {
        if (Array.isArray(item)) {
          result.push(...flatten(item));
        } else {
          const type = typeof item;
          if (type === "number") {
            result.push(item);
          } else {
            throw this.throwErrorFormatters(
              new Error(`All elements must be numbers, found ${type}`),
            );
          }
        }
      }

      return result;
    };

    return flatten(arr);
  }
}

class Clip extends NumbersMethodBuilder {
  override call() {
    const [arr, minVal, maxVal] = this.args;
    const numbers = this.validateNumericArray(arr, "array");

    let min = -Infinity;
    let max = Infinity;

    if (minVal !== undefined) {
      this.validateNumber(minVal, "min");
      min = Number(minVal);
    }

    if (maxVal !== undefined) {
      this.validateNumber(maxVal, "max");
      max = Number(maxVal);
    }

    if (min > max) {
      throw this.throwErrorFormatters(new Error("Min value cannot be greater than max value"));
    }

    return numbers.map((num) => Math.max(min, Math.min(max, num)));
  }
}

export {
  LinSpace,
  ARange,
  Zeros,
  Ones,
  Full,
  Cumsum,
  Cumprod,
  Diff,
  Gradient,
  Unique,
  ArgMax,
  ArgMin,
  Sort,
  ArgSort,
  Reshape,
  Flatten,
  Clip,
};
