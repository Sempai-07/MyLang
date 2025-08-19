import { NumbersMethodBuilder } from "./NumbersBuilder";

class Mean extends NumbersMethodBuilder {
  override call() {
    const [arr] = this.args;
    const numbers = this.validateNumericArray(arr, "array");

    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }
}

class Median extends NumbersMethodBuilder {
  override call() {
    const [arr] = this.args;
    const numbers = this.validateNumericArray(arr, "array");

    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1]! + sorted[mid]!) / 2;
    } else {
      return sorted[mid];
    }
  }
}

class Mode extends NumbersMethodBuilder {
  override call() {
    const [arr] = this.args;
    const numbers = this.validateNumericArray(arr, "array");

    const frequency = new Map<number, number>();

    for (const num of numbers) {
      frequency.set(num, (frequency.get(num) || 0) + 1);
    }

    let maxFreq = 0;
    const modes: number[] = [];

    for (const [num, freq] of frequency) {
      if (freq > maxFreq) {
        maxFreq = freq;
        modes.length = 0;
        modes.push(num);
      } else if (freq === maxFreq) {
        modes.push(num);
      }
    }

    return modes.length === 1 ? modes[0] : modes.sort((a, b) => a - b);
  }
}

class Range extends NumbersMethodBuilder {
  override call() {
    const [arr] = this.args;
    const numbers = this.validateNumericArray(arr, "array");

    return Math.max(...numbers) - Math.min(...numbers);
  }
}

class Variance extends NumbersMethodBuilder {
  override call() {
    const [arr, ddof] = this.args;
    const numbers = this.validateNumericArray(arr, "array");

    const degreesOfFreedom = ddof !== undefined ? Number(ddof) : 0;
    this.validateInteger(degreesOfFreedom, "ddof");

    if (numbers.length <= degreesOfFreedom) {
      throw this.throwErrorFormatters(
        new Error("Array length must be greater than degrees of freedom"),
      );
    }

    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    const squaredDiffs = numbers.map((num) => Math.pow(num - mean, 2));

    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / (numbers.length - degreesOfFreedom);
  }
}

class Std extends NumbersMethodBuilder {
  override call() {
    const [arr, ddof] = this.args;
    const variance = new Variance([arr, ddof], [], this.environment).call();
    return Math.sqrt(variance);
  }
}

class PopVariance extends NumbersMethodBuilder {
  override call() {
    const [arr] = this.args;
    return new Variance([arr, 0], [], this.environment).call();
  }
}

class PopStd extends NumbersMethodBuilder {
  override call() {
    const [arr] = this.args;
    const variance = new PopVariance([arr], [], this.environment).call();
    return Math.sqrt(variance);
  }
}

class Quantile extends NumbersMethodBuilder {
  override call() {
    const [arr, q, method] = this.args;
    const numbers = this.validateNumericArray(arr, "array");
    this.validateNumber(q, "quantile");

    const quantile = Number(q);
    this.validateRange(quantile, 0, 1, "quantile");

    const sorted = [...numbers].sort((a, b) => a - b);
    const index = quantile * (sorted.length - 1);

    if (method === "linear" || method === undefined) {
      const lower = Math.floor(index);
      const upper = Math.ceil(index);
      const weight = index - lower;

      return sorted[lower]! * (1 - weight) + sorted[upper]! * weight;
    } else if (method === "nearest") {
      return sorted[Math.round(index)];
    } else {
      throw this.throwErrorFormatters(new Error(`Unsupported method: ${method}`));
    }
  }
}

class Percentile extends NumbersMethodBuilder {
  override call() {
    const [arr, p] = this.args;
    const numbers = this.validateNumericArray(arr, "array");
    this.validateNumber(p, "percentile");

    const percentile = Number(p);
    this.validateRange(percentile, 0, 100, "percentile");

    return new Quantile([numbers, percentile / 100], [], this.environment).call();
  }
}

class IQR extends NumbersMethodBuilder {
  override call() {
    const [arr] = this.args;
    const numbers = this.validateNumericArray(arr, "array");

    const q1 = new Quantile([numbers, 0.25], [], this.environment).call()!;
    const q3 = new Quantile([numbers, 0.75], [], this.environment).call()!;

    return q3 - q1;
  }
}

class Covariance extends NumbersMethodBuilder {
  override call() {
    const [x, y, ddof] = this.args;
    const xNumbers = this.validateNumericArray(x, "x");
    const yNumbers = this.validateNumericArray(y, "y");

    if (xNumbers.length !== yNumbers.length) {
      throw this.throwErrorFormatters(new Error("Arrays must have the same length"));
    }

    const degreesOfFreedom = ddof !== undefined ? Number(ddof) : 1;
    this.validateInteger(degreesOfFreedom, "ddof");

    const n = xNumbers.length;
    if (n <= degreesOfFreedom) {
      throw this.throwErrorFormatters(
        new Error("Array length must be greater than degrees of freedom"),
      );
    }

    const xMean = xNumbers.reduce((sum, num) => sum + num, 0) / n;
    const yMean = yNumbers.reduce((sum, num) => sum + num, 0) / n;

    let covariance = 0;
    for (let i = 0; i < n; i++) {
      covariance += (xNumbers[i]! - xMean) * (yNumbers[i]! - yMean);
    }

    return covariance / (n - degreesOfFreedom);
  }
}

class Correlation extends NumbersMethodBuilder {
  override call() {
    const [x, y] = this.args;
    this.validateNumericArray(x, "x");
    this.validateNumericArray(y, "y");

    const cov = new Covariance([x, y, 1], [], this.environment).call();
    const xStd = new Std([x, 1], [], this.environment).call();
    const yStd = new Std([y, 1], [], this.environment).call();

    if (xStd === 0 || yStd === 0) {
      throw this.throwErrorFormatters(
        new Error("Cannot calculate correlation with zero standard deviation"),
      );
    }

    return cov / (xStd * yStd);
  }
}

class ZScore extends NumbersMethodBuilder {
  override call() {
    const [value, arr] = this.args;
    this.validateNumber(value, "value");
    const numbers = this.validateNumericArray(arr, "array");

    const mean = new Mean([numbers], [], this.environment).call();
    const std = new Std([numbers], [], this.environment).call();

    if (std === 0) {
      throw this.throwErrorFormatters(
        new Error("Cannot calculate z-score with zero standard deviation"),
      );
    }

    return (Number(value) - mean) / std;
  }
}

class Skewness extends NumbersMethodBuilder {
  override call() {
    const [arr] = this.args;
    const numbers = this.validateNumericArray(arr, "array");

    const n = numbers.length;
    if (n < 3) {
      throw this.throwErrorFormatters(new Error("Skewness requires at least 3 data points"));
    }

    const mean = numbers.reduce((sum, num) => sum + num, 0) / n;
    const std = new Std([numbers], [], this.environment).call();

    if (std === 0) {
      throw this.throwErrorFormatters(
        new Error("Cannot calculate skewness with zero standard deviation"),
      );
    }

    let sum = 0;
    for (const num of numbers) {
      sum += Math.pow((num - mean) / std, 3);
    }

    return (n / ((n - 1) * (n - 2))) * sum;
  }
}

class Kurtosis extends NumbersMethodBuilder {
  override call() {
    const [arr] = this.args;
    const numbers = this.validateNumericArray(arr, "array");

    const n = numbers.length;
    if (n < 4) {
      throw this.throwErrorFormatters(new Error("Kurtosis requires at least 4 data points"));
    }

    const mean = numbers.reduce((sum, num) => sum + num, 0) / n;
    const std = new Std([numbers], [], this.environment).call();

    if (std === 0) {
      throw this.throwErrorFormatters(
        new Error("Cannot calculate kurtosis with zero standard deviation"),
      );
    }

    let sum = 0;
    for (const num of numbers) {
      sum += Math.pow((num - mean) / std, 4);
    }

    const kurtosis = ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * sum;
    const correction = (3 * (n - 1) ** 2) / ((n - 2) * (n - 3));

    return kurtosis - correction;
  }
}

class HarmonicMean extends NumbersMethodBuilder {
  override call() {
    const [arr] = this.args;
    const numbers = this.validateNumericArray(arr, "array");

    for (const num of numbers) {
      if (num <= 0) {
        throw this.throwErrorFormatters(new Error("Harmonic mean requires all positive values"));
      }
    }

    const sum = numbers.reduce((acc, num) => acc + 1 / num, 0);
    return numbers.length / sum;
  }
}

class GeometricMean extends NumbersMethodBuilder {
  override call() {
    const [arr] = this.args;
    const numbers = this.validateNumericArray(arr, "array");

    for (const num of numbers) {
      if (num <= 0) {
        throw this.throwErrorFormatters(new Error("Geometric mean requires all positive values"));
      }
    }

    const product = numbers.reduce((acc, num) => acc * num, 1);
    return Math.pow(product, 1 / numbers.length);
  }
}

class TrimmedMean extends NumbersMethodBuilder {
  override call() {
    const [arr, trim] = this.args;
    const numbers = this.validateNumericArray(arr, "array");
    this.validateNumber(trim, "trim");

    const trimProportion = Number(trim);
    this.validateRange(trimProportion, 0, 0.5, "trim");

    const sorted = [...numbers].sort((a, b) => a - b);
    const n = sorted.length;
    const trimCount = Math.floor(n * trimProportion);

    const trimmed = sorted.slice(trimCount, n - trimCount);

    if (trimmed.length === 0) {
      throw this.throwErrorFormatters(new Error("Trim proportion too large for array size"));
    }

    return trimmed.reduce((sum, num) => sum + num, 0) / trimmed.length;
  }
}

export {
  Mean,
  Median,
  Mode,
  Range,
  Variance,
  Std,
  PopVariance,
  PopStd,
  Quantile,
  Percentile,
  IQR,
  Covariance,
  Correlation,
  ZScore,
  Skewness,
  Kurtosis,
  HarmonicMean,
  GeometricMean,
  TrimmedMean,
};
