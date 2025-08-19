import { NumbersMethodBuilder } from "./NumbersBuilder";

class LinearInterp extends NumbersMethodBuilder {
  override call() {
    const [x, y, xi] = this.args;
    const xNumbers = this.validateNumericArray(x, "x");
    const yNumbers = this.validateNumericArray(y, "y");
    const xiNumbers = this.validateNumericArray(xi, "xi");

    if (xNumbers.length !== yNumbers.length) {
      throw this.throwErrorFormatters(new Error("x and y arrays must have the same length"));
    }

    if (xNumbers.length < 2) {
      throw this.throwErrorFormatters(new Error("Need at least 2 points for interpolation"));
    }

    const points = xNumbers.map((x, i) => ({ x, y: yNumbers[i]! })).sort((a, b) => a.x - b.x);

    const result: number[] = [];

    for (const xi_val of xiNumbers) {
      let i = 0;
      while (i < points.length - 1 && points[i + 1]!.x < xi_val) {
        i++;
      }

      if (xi_val <= points[0]!.x) {
        result.push(points[0]!.y);
      } else if (xi_val >= points[points.length - 1]!.x) {
        result.push(points[points.length - 1]!.y);
      } else {
        const x0 = points[i]!.x;
        const x1 = points[i + 1]!.x;
        const y0 = points[i]!.y;
        const y1 = points[i + 1]!.y;

        const t = (xi_val - x0) / (x1 - x0);
        result.push(y0 + t * (y1 - y0));
      }
    }

    return result;
  }
}

class SplineInterp extends NumbersMethodBuilder {
  override call() {
    const [x, y, xi] = this.args;
    const xNumbers = this.validateNumericArray(x, "x");
    const yNumbers = this.validateNumericArray(y, "y");
    const xiNumbers = this.validateNumericArray(xi, "xi");

    if (xNumbers.length !== yNumbers.length) {
      throw this.throwErrorFormatters(new Error("x and y arrays must have the same length"));
    }

    if (xNumbers.length < 3) {
      throw this.throwErrorFormatters(new Error("Need at least 3 points for spline interpolation"));
    }

    const points = xNumbers.map((x, i) => ({ x, y: yNumbers[i]! })).sort((a, b) => a.x - b.x);

    const n = points.length;

    const h: number[] = [];
    for (let i = 0; i < n - 1; i++) {
      h[i] = points[i + 1]!.x - points[i]!.x;
    }

    const alpha: number[] = [];
    for (let i = 1; i < n - 1; i++) {
      alpha[i] =
        (3 / h[i]!) * (points[i + 1]!.y - points[i]!.y) -
        (3 / h[i - 1]!) * (points[i]!.y - points[i - 1]!.y);
    }

    const l: number[] = new Array(n);
    const mu: number[] = new Array(n);
    const z: number[] = new Array(n);

    l[0] = 1;
    mu[0] = 0;
    z[0] = 0;

    for (let i = 1; i < n - 1; i++) {
      l[i] = 2 * (points[i + 1]!.x - points[i - 1]!.x) - h[i - 1]! * mu[i - 1]!;
      mu[i] = h[i]! / l[i]!;
      z[i] = (alpha[i]! - h[i - 1]! * z[i - 1]!) / l[i]!;
    }

    l[n - 1] = 1;
    z[n - 1] = 0;

    const c: number[] = new Array(n);
    c[n - 1] = 0;

    for (let j = n - 2; j >= 0; j--) {
      c[j] = z[j]! - mu[j]! * c[j + 1]!;
    }

    const b: number[] = new Array(n - 1);
    const d: number[] = new Array(n - 1);

    for (let j = 0; j < n - 1; j++) {
      b[j] = (points[j + 1]!.y - points[j]!.y) / h[j]! - (h[j]! * (c[j + 1]! + 2 * c[j]!)) / 3;
      d[j] = (c[j + 1]! - c[j]!) / (3 * h[j]!);
    }

    const result: number[] = [];

    for (const xi_val of xiNumbers) {
      let j = 0;
      while (j < n - 1 && points[j + 1]!.x < xi_val) {
        j++;
      }

      if (j >= n - 1) j = n - 2;

      const dx = xi_val - points[j]!.x;
      const yi = points[j]!.y + b[j]! * dx + c[j]! * dx * dx + d[j]! * dx * dx * dx;
      result.push(yi);
    }

    return result;
  }
}

class PolynomialFit extends NumbersMethodBuilder {
  override call() {
    const [x, y, degree] = this.args;
    const xNumbers = this.validateNumericArray(x, "x");
    const yNumbers = this.validateNumericArray(y, "y");
    this.validateInteger(degree, "degree");

    if (xNumbers.length !== yNumbers.length) {
      throw this.throwErrorFormatters(new Error("x and y arrays must have the same length"));
    }

    const deg = Number(degree);
    this.validateNonNegativeNumber(deg, "degree");

    if (deg >= xNumbers.length) {
      throw this.throwErrorFormatters(new Error("Degree must be less than number of data points"));
    }

    const n = xNumbers.length;
    const m = deg + 1;

    const A: number[][] = [];
    for (let i = 0; i < n; i++) {
      const row: number[] = [];
      for (let j = 0; j < m; j++) {
        row.push(Math.pow(xNumbers[i]!, j));
      }
      A.push(row);
    }

    const AT: number[][] = [];
    for (let j = 0; j < m; j++) {
      const row: number[] = [];
      for (let i = 0; i < n; i++) {
        row.push(A[i]![j]!);
      }
      AT.push(row);
    }

    const ATA: number[][] = [];
    for (let i = 0; i < m; i++) {
      const row: number[] = [];
      for (let j = 0; j < m; j++) {
        let sum = 0;
        for (let k = 0; k < n; k++) {
          sum += AT[i]![k]! * A[k]![j]!;
        }
        row.push(sum);
      }
      ATA.push(row);
    }

    const ATb: number[] = [];
    for (let i = 0; i < m; i++) {
      let sum = 0;
      for (let j = 0; j < n; j++) {
        sum += AT[i]![j]! * yNumbers[j]!;
      }
      ATb.push(sum);
    }

    const augmented: number[][] = [];
    for (let i = 0; i < m; i++) {
      augmented.push([...ATA[i]!, ATb[i]!]);
    }

    for (let i = 0; i < m; i++) {
      let maxRow = i;
      for (let k = i + 1; k < m; k++) {
        if (Math.abs(augmented[k]![i]!) > Math.abs(augmented[maxRow]![i]!)) {
          maxRow = k;
        }
      }

      [augmented[i], augmented[maxRow]] = [augmented[maxRow]!, augmented[i]!];

      for (let k = i + 1; k < m; k++) {
        const factor = augmented[k]![i]! / augmented[i]![i]!;
        for (let j = i; j <= m; j++) {
          augmented[k]![j]! -= factor * augmented[i]![j]!;
        }
      }
    }

    const coefficients: number[] = new Array(m);
    for (let i = m - 1; i >= 0; i--) {
      coefficients[i] = augmented[i]![m]!;
      for (let j = i + 1; j < m; j++) {
        coefficients[i]! -= augmented[i]![j]! * coefficients[j]!;
      }
      coefficients[i]! /= augmented[i]![i]!;
    }

    return coefficients;
  }
}

class PolynomialEval extends NumbersMethodBuilder {
  override call() {
    const [coefficients, x] = this.args;
    const coeffs = this.validateNumericArray(coefficients, "coefficients");
    const xNumbers = this.validateNumericArray(x, "x");

    const result: number[] = [];

    for (const xi of xNumbers) {
      let value = 0;
      for (let i = 0; i < coeffs.length; i++) {
        value += coeffs[i]! * Math.pow(xi, i);
      }
      result.push(value);
    }

    return result;
  }
}

class Derivative extends NumbersMethodBuilder {
  override call() {
    const [coefficients] = this.args;
    const coeffs = this.validateNumericArray(coefficients, "coefficients");

    if (coeffs.length <= 1) {
      return [0];
    }

    const result: number[] = [];
    for (let i = 1; i < coeffs.length; i++) {
      result.push(i * coeffs[i]!);
    }

    return result;
  }
}

class Integral extends NumbersMethodBuilder {
  override call() {
    const [coefficients, constant] = this.args;
    const coeffs = this.validateNumericArray(coefficients, "coefficients");

    const c = constant !== undefined ? Number(constant) : 0;
    this.validateNumber(c, "constant");

    const result: number[] = [c];
    for (let i = 0; i < coeffs.length; i++) {
      result.push(coeffs[i]! / (i + 1));
    }

    return result;
  }
}

class TrapezoidalRule extends NumbersMethodBuilder {
  override call() {
    const [y, dx] = this.args;
    const yNumbers = this.validateNumericArray(y, "y");

    const spacing = dx !== undefined ? Number(dx) : 1;
    this.validateNumber(spacing, "dx");
    this.validatePositiveNumber(spacing, "dx");

    if (yNumbers.length < 2) {
      throw this.throwErrorFormatters(new Error("Need at least 2 points for integration"));
    }

    let integral = 0;
    for (let i = 0; i < yNumbers.length - 1; i++) {
      integral += ((yNumbers[i]! + yNumbers[i + 1]!) * spacing) / 2;
    }

    return integral;
  }
}

class SimpsonsRule extends NumbersMethodBuilder {
  override call() {
    const [y, dx] = this.args;
    const yNumbers = this.validateNumericArray(y, "y");

    const spacing = dx !== undefined ? Number(dx) : 1;
    this.validateNumber(spacing, "dx");
    this.validatePositiveNumber(spacing, "dx");

    if (yNumbers.length < 3) {
      throw this.throwErrorFormatters(new Error("Need at least 3 points for Simpson's rule"));
    }

    if (yNumbers.length % 2 === 0) {
      throw this.throwErrorFormatters(new Error("Simpson's rule requires odd number of points"));
    }

    let integral = yNumbers[0]! + yNumbers[yNumbers.length - 1]!;

    for (let i = 1; i < yNumbers.length - 1; i++) {
      const multiplier = i % 2 === 1 ? 4 : 2;
      integral += multiplier * yNumbers[i]!;
    }

    return (integral * spacing) / 3;
  }
}

class AdaptiveQuadrature extends NumbersMethodBuilder {
  override call() {
    const [func, a, b, tolerance, maxDepth] = this.args;
    this.validateFunction(func, "function");
    this.validateNumber(a, "a");
    this.validateNumber(b, "b");

    const tol = tolerance !== undefined ? Number(tolerance) : 1e-6;
    const maxD = maxDepth !== undefined ? Number(maxDepth) : 10;

    this.validateNumber(tol, "tolerance");
    this.validateInteger(maxD, "maxDepth");
    this.validatePositiveNumber(tol, "tolerance");
    this.validatePositiveNumber(maxD, "maxDepth");

    const simpson = (x1: number, x2: number): number => {
      const h = (x2 - x1) / 2;
      const mid = (x1 + x2) / 2;

      const fx1 = this.executeCallback(func, [x1]);
      const fmid = this.executeCallback(func, [mid]);
      const fx2 = this.executeCallback(func, [x2]);

      return (h / 3) * (fx1 + 4 * fmid + fx2);
    };

    const adaptiveIntegral = (x1: number, x2: number, depth: number): number => {
      const mid = (x1 + x2) / 2;

      const s1 = simpson(x1, x2);
      const s2 = simpson(x1, mid) + simpson(mid, x2);

      if (Math.abs(s1 - s2) < tol || depth >= maxD) {
        return s2;
      }

      return adaptiveIntegral(x1, mid, depth + 1) + adaptiveIntegral(mid, x2, depth + 1);
    };

    return adaptiveIntegral(Number(a), Number(b), 0);
  }
}

class Bisection extends NumbersMethodBuilder {
  override call() {
    const [func, a, b, tolerance, maxIterations] = this.args;
    this.validateFunction(func, "function");
    this.validateNumber(a, "a");
    this.validateNumber(b, "b");

    const tol = tolerance !== undefined ? Number(tolerance) : 1e-6;
    const maxIter = maxIterations !== undefined ? Number(maxIterations) : 100;

    this.validateNumber(tol, "tolerance");
    this.validateInteger(maxIter, "maxIterations");
    this.validatePositiveNumber(tol, "tolerance");
    this.validatePositiveNumber(maxIter, "maxIterations");

    let left = Number(a);
    let right = Number(b);

    const fa = this.executeCallback(func, [left]);
    const fb = this.executeCallback(func, [right]);

    if (fa * fb > 0) {
      throw this.throwErrorFormatters(new Error("Function must have opposite signs at endpoints"));
    }

    for (let i = 0; i < maxIter; i++) {
      const mid = (left + right) / 2;
      const fmid = this.executeCallback(func, [mid]);

      if (Math.abs(fmid) < tol || (right - left) / 2 < tol) {
        return mid;
      }

      if (fa * fmid < 0) {
        right = mid;
      } else {
        left = mid;
      }
    }

    throw this.throwErrorFormatters(new Error("Maximum iterations reached without convergence"));
  }
}

class NewtonRaphson extends NumbersMethodBuilder {
  override call() {
    const [func, derivative, x0, tolerance, maxIterations] = this.args;
    this.validateFunction(func, "function");
    this.validateFunction(derivative, "derivative");
    this.validateNumber(x0, "x0");

    const tol = tolerance !== undefined ? Number(tolerance) : 1e-6;
    const maxIter = maxIterations !== undefined ? Number(maxIterations) : 100;

    this.validateNumber(tol, "tolerance");
    this.validateInteger(maxIter, "maxIterations");
    this.validatePositiveNumber(tol, "tolerance");
    this.validatePositiveNumber(maxIter, "maxIterations");

    let x = Number(x0);

    for (let i = 0; i < maxIter; i++) {
      const fx = this.executeCallback(func, [x]);
      const fpx = this.executeCallback(derivative, [x]);

      if (Math.abs(fpx) < 1e-14) {
        throw this.throwErrorFormatters(new Error("Derivative too close to zero"));
      }

      const xNew = x - fx / fpx;

      if (Math.abs(xNew - x) < tol) {
        return xNew;
      }

      x = xNew;
    }

    throw this.throwErrorFormatters(new Error("Maximum iterations reached without convergence"));
  }
}

class Secant extends NumbersMethodBuilder {
  override call() {
    const [func, x0, x1, tolerance, maxIterations] = this.args;
    this.validateFunction(func, "function");
    this.validateNumber(x0, "x0");
    this.validateNumber(x1, "x1");

    const tol = tolerance !== undefined ? Number(tolerance) : 1e-6;
    const maxIter = maxIterations !== undefined ? Number(maxIterations) : 100;

    this.validateNumber(tol, "tolerance");
    this.validateInteger(maxIter, "maxIterations");
    this.validatePositiveNumber(tol, "tolerance");
    this.validatePositiveNumber(maxIter, "maxIterations");

    let xPrev = Number(x0);
    let xCurr = Number(x1);

    for (let i = 0; i < maxIter; i++) {
      const fPrev = this.executeCallback(func, [xPrev]);
      const fCurr = this.executeCallback(func, [xCurr]);

      if (Math.abs(fCurr - fPrev) < 1e-14) {
        throw this.throwErrorFormatters(new Error("Function values too close together"));
      }

      const xNext = xCurr - (fCurr * (xCurr - xPrev)) / (fCurr - fPrev);

      if (Math.abs(xNext - xCurr) < tol) {
        return xNext;
      }

      xPrev = xCurr;
      xCurr = xNext;
    }

    throw this.throwErrorFormatters(new Error("Maximum iterations reached without convergence"));
  }
}

class BrentMethod extends NumbersMethodBuilder {
  override call() {
    const [func, a, b, tolerance, maxIterations] = this.args;
    this.validateFunction(func, "function");
    this.validateNumber(a, "a");
    this.validateNumber(b, "b");

    const tol = tolerance !== undefined ? Number(tolerance) : 1e-6;
    const maxIter = maxIterations !== undefined ? Number(maxIterations) : 100;

    this.validateNumber(tol, "tolerance");
    this.validateInteger(maxIter, "maxIterations");
    this.validatePositiveNumber(tol, "tolerance");
    this.validatePositiveNumber(maxIter, "maxIterations");

    let aVal = Number(a);
    let bVal = Number(b);

    let fa = this.executeCallback(func, [aVal]);
    let fb = this.executeCallback(func, [bVal]);

    if (fa * fb > 0) {
      throw this.throwErrorFormatters(new Error("Function must have opposite signs at endpoints"));
    }

    if (Math.abs(fa) < Math.abs(fb)) {
      [aVal, bVal] = [bVal, aVal];
      [fa, fb] = [fb, fa];
    }

    let c = aVal;
    let fc = fa;
    let mflag = true;
    let d = 0;

    for (let i = 0; i < maxIter; i++) {
      let s: number;

      if (fa !== fc && fb !== fc) {
        s =
          (aVal * fb * fc) / ((fa - fb) * (fa - fc)) +
          (bVal * fa * fc) / ((fb - fa) * (fb - fc)) +
          (c * fa * fb) / ((fc - fa) * (fc - fb));
      } else {
        s = bVal - (fb * (bVal - aVal)) / (fb - fa);
      }

      const tmp2 = (3 * aVal + bVal) / 4;
      const condition1 = !((s > tmp2 && s < bVal) || (s < tmp2 && s > bVal));
      const condition2 = mflag && Math.abs(s - bVal) >= Math.abs(bVal - c) / 2;
      const condition3 = !mflag && Math.abs(s - bVal) >= Math.abs(c - d) / 2;
      const condition4 = mflag && Math.abs(bVal - c) < tol;
      const condition5 = !mflag && Math.abs(c - d) < tol;

      if (condition1 || condition2 || condition3 || condition4 || condition5) {
        s = (aVal + bVal) / 2;
        mflag = true;
      } else {
        mflag = false;
      }

      const fs = this.executeCallback(func, [s]);
      d = c;
      c = bVal;
      fc = fb;

      if (fa * fs < 0) {
        bVal = s;
        fb = fs;
      } else {
        aVal = s;
        fa = fs;
      }

      if (Math.abs(fa) < Math.abs(fb)) {
        [aVal, bVal] = [bVal, aVal];
        [fa, fb] = [fb, fa];
      }

      if (Math.abs(fb) < tol || Math.abs(bVal - aVal) < tol) {
        return bVal;
      }
    }

    throw this.throwErrorFormatters(new Error("Maximum iterations reached without convergence"));
  }
}

class GoldenSectionSearch extends NumbersMethodBuilder {
  override call() {
    const [func, a, b, tolerance, maxIterations] = this.args;
    this.validateFunction(func, "function");
    this.validateNumber(a, "a");
    this.validateNumber(b, "b");

    const tol = tolerance !== undefined ? Number(tolerance) : 1e-6;
    const maxIter = maxIterations !== undefined ? Number(maxIterations) : 100;

    this.validateNumber(tol, "tolerance");
    this.validateInteger(maxIter, "maxIterations");
    this.validatePositiveNumber(tol, "tolerance");
    this.validatePositiveNumber(maxIter, "maxIterations");

    const phi = (1 + Math.sqrt(5)) / 2;
    const resphi = 2 - phi;

    let left = Number(a);
    let right = Number(b);

    let x1 = left + resphi * (right - left);
    let x2 = right - resphi * (right - left);

    let f1 = this.executeCallback(func, [x1]);
    let f2 = this.executeCallback(func, [x2]);

    for (let i = 0; i < maxIter; i++) {
      if (Math.abs(right - left) < tol) {
        return (left + right) / 2;
      }

      if (f1 > f2) {
        left = x1;
        x1 = x2;
        f1 = f2;
        x2 = right - resphi * (right - left);
        f2 = this.executeCallback(func, [x2]);
      } else {
        right = x2;
        x2 = x1;
        f2 = f1;
        x1 = left + resphi * (right - left);
        f1 = this.executeCallback(func, [x1]);
      }
    }

    return (left + right) / 2;
  }
}

class TernarySearch extends NumbersMethodBuilder {
  override call() {
    const [func, a, b, tolerance, maxIterations] = this.args;
    this.validateFunction(func, "function");
    this.validateNumber(a, "a");
    this.validateNumber(b, "b");

    const tol = tolerance !== undefined ? Number(tolerance) : 1e-6;
    const maxIter = maxIterations !== undefined ? Number(maxIterations) : 100;

    this.validateNumber(tol, "tolerance");
    this.validateInteger(maxIter, "maxIterations");
    this.validatePositiveNumber(tol, "tolerance");
    this.validatePositiveNumber(maxIter, "maxIterations");

    let left = Number(a);
    let right = Number(b);

    for (let i = 0; i < maxIter; i++) {
      if (Math.abs(right - left) < tol) {
        return (left + right) / 2;
      }

      const m1 = left + (right - left) / 3;
      const m2 = right - (right - left) / 3;

      const f1 = this.executeCallback(func, [m1]);
      const f2 = this.executeCallback(func, [m2]);

      if (f1 > f2) {
        left = m1;
      } else {
        right = m2;
      }
    }

    return (left + right) / 2;
  }
}

class FiniteDifference extends NumbersMethodBuilder {
  override call() {
    const [func, x, h, method] = this.args;
    this.validateFunction(func, "function");
    this.validateNumber(x, "x");

    const stepSize = h !== undefined ? Number(h) : 1e-5;
    const diffMethod = method !== undefined ? method : "central";

    this.validateNumber(stepSize, "h");
    this.validatePositiveNumber(stepSize, "h");

    const xVal = Number(x);

    if (diffMethod === "forward") {
      const fx = this.executeCallback(func, [xVal]);
      const fxh = this.executeCallback(func, [xVal + stepSize]);
      return (fxh - fx) / stepSize;
    } else if (diffMethod === "backward") {
      const fx = this.executeCallback(func, [xVal]);
      const fxh = this.executeCallback(func, [xVal - stepSize]);
      return (fx - fxh) / stepSize;
    } else if (diffMethod === "central") {
      const fxh = this.executeCallback(func, [xVal + stepSize]);
      const fx_h = this.executeCallback(func, [xVal - stepSize]);
      return (fxh - fx_h) / (2 * stepSize);
    } else {
      throw this.throwErrorFormatters(new Error(`Unknown differentiation method: ${diffMethod}`));
    }
  }
}

class SecondDerivative extends NumbersMethodBuilder {
  override call() {
    const [func, x, h] = this.args;
    this.validateFunction(func, "function");
    this.validateNumber(x, "x");

    const stepSize = h !== undefined ? Number(h) : 1e-5;
    this.validateNumber(stepSize, "h");
    this.validatePositiveNumber(stepSize, "h");

    const xVal = Number(x);

    const fxh = this.executeCallback(func, [xVal + stepSize]);
    const fx = this.executeCallback(func, [xVal]);
    const fx_h = this.executeCallback(func, [xVal - stepSize]);

    return (fxh - 2 * fx + fx_h) / (stepSize * stepSize);
  }
}

class EulerMethod extends NumbersMethodBuilder {
  override call() {
    const [func, x0, y0, h, steps] = this.args;
    this.validateFunction(func, "function");
    this.validateNumber(x0, "x0");
    this.validateNumber(y0, "y0");
    this.validateNumber(h, "h");
    this.validateInteger(steps, "steps");

    const stepSize = Number(h);
    const numSteps = Number(steps);

    this.validatePositiveNumber(stepSize, "h");
    this.validatePositiveNumber(numSteps, "steps");

    const x: number[] = [Number(x0)];
    const y: number[] = [Number(y0)];

    for (let i = 0; i < numSteps; i++) {
      const xi = x[i]!;
      const yi = y[i]!;

      const slope = this.executeCallback(func, [xi, yi]);
      const yNext = yi + stepSize * slope;
      const xNext = xi + stepSize;

      x.push(xNext);
      y.push(yNext);
    }

    return { x, y };
  }
}

class RungeKutta4 extends NumbersMethodBuilder {
  override call() {
    const [func, x0, y0, h, steps] = this.args;
    this.validateFunction(func, "function");
    this.validateNumber(x0, "x0");
    this.validateNumber(y0, "y0");
    this.validateNumber(h, "h");
    this.validateInteger(steps, "steps");

    const stepSize = Number(h);
    const numSteps = Number(steps);

    this.validatePositiveNumber(stepSize, "h");
    this.validatePositiveNumber(numSteps, "steps");

    const x: number[] = [Number(x0)];
    const y: number[] = [Number(y0)];

    for (let i = 0; i < numSteps; i++) {
      const xi = x[i]!;
      const yi = y[i]!;

      const k1 = this.executeCallback(func, [xi, yi]);
      const k2 = this.executeCallback(func, [xi + stepSize / 2, yi + (stepSize * k1) / 2]);
      const k3 = this.executeCallback(func, [xi + stepSize / 2, yi + (stepSize * k2) / 2]);
      const k4 = this.executeCallback(func, [xi + stepSize, yi + stepSize * k3]);

      const yNext = yi + (stepSize * (k1 + 2 * k2 + 2 * k3 + k4)) / 6;
      const xNext = xi + stepSize;

      x.push(xNext);
      y.push(yNext);
    }

    return { x, y };
  }
}

class AdamsBashforth extends NumbersMethodBuilder {
  override call() {
    const [func, x0, y0, h, steps] = this.args;
    this.validateFunction(func, "function");
    this.validateNumber(x0, "x0");
    this.validateNumber(y0, "y0");
    this.validateNumber(h, "h");
    this.validateInteger(steps, "steps");

    const stepSize = Number(h);
    const numSteps = Number(steps);

    this.validatePositiveNumber(stepSize, "h");
    this.validatePositiveNumber(numSteps, "steps");

    const rk4Result = new RungeKutta4(
      [func, x0, y0, h, Math.min(3, numSteps)],
      [],
      this.environment,
    ).call();
    const x: number[] = rk4Result.x;
    const y: number[] = rk4Result.y;

    if (numSteps <= 3) {
      return { x, y };
    }

    const f: number[] = [];
    for (let i = 0; i < x.length; i++) {
      f.push(this.executeCallback(func, [x[i], y[i]]));
    }

    for (let i = 3; i < numSteps; i++) {
      const xi = x[i]!;
      const yi = y[i]!;
      const fi = f[i]!;

      const yNext =
        yi + (stepSize * (55 * fi - 59 * f[i - 1]! + 37 * f[i - 2]! - 9 * f[i - 3]!)) / 24;
      const xNext = xi + stepSize;

      x.push(xNext);
      y.push(yNext);
      f.push(this.executeCallback(func, [xNext, yNext]));
    }

    return { x, y };
  }
}

class MonteCarloIntegration extends NumbersMethodBuilder {
  override call() {
    const [func, a, b, n] = this.args;
    this.validateFunction(func, "function");
    this.validateNumber(a, "a");
    this.validateNumber(b, "b");
    this.validateInteger(n, "n");

    const lowerBound = Number(a);
    const upperBound = Number(b);
    const numSamples = Number(n);

    this.validatePositiveNumber(numSamples, "n");

    if (lowerBound >= upperBound) {
      throw this.throwErrorFormatters(new Error("Lower bound must be less than upper bound"));
    }

    let sum = 0;
    const width = upperBound - lowerBound;

    for (let i = 0; i < numSamples; i++) {
      const x = lowerBound + Math.random() * width;
      const fx = this.executeCallback(func, [x]);
      sum += fx;
    }

    return (sum / numSamples) * width;
  }
}

class MonteCarloMultiDim extends NumbersMethodBuilder {
  override call() {
    const [func, bounds, n] = this.args;
    this.validateFunction(func, "function");
    this.validateArray(bounds, "bounds");
    this.validateInteger(n, "n");

    const numSamples = Number(n);
    this.validatePositiveNumber(numSamples, "n");

    const dimensions = bounds.length;
    const lowerBounds: number[] = [];
    const upperBounds: number[] = [];
    let volume = 1;

    for (let i = 0; i < dimensions; i++) {
      if (!Array.isArray(bounds[i]!) || bounds[i]!.length !== 2) {
        throw this.throwErrorFormatters(new Error(`bounds[${i}] must be [lower, upper]`));
      }

      const [lower, upper] = bounds[i];
      this.validateNumber(lower, `bounds[${i}][0]`);
      this.validateNumber(upper, `bounds[${i}][1]`);

      const lowerVal = Number(lower);
      const upperVal = Number(upper);

      if (lowerVal >= upperVal) {
        throw this.throwErrorFormatters(
          new Error(`Lower bound must be less than upper bound for dimension ${i}`),
        );
      }

      lowerBounds.push(lowerVal);
      upperBounds.push(upperVal);
      volume *= upperVal - lowerVal;
    }

    let sum = 0;

    for (let i = 0; i < numSamples; i++) {
      const point: number[] = [];

      for (let d = 0; d < dimensions; d++) {
        const x = lowerBounds[d]! + Math.random() * (upperBounds[d]! - lowerBounds[d]!);
        point.push(x);
      }

      const fx = this.executeCallback(func, point);
      sum += fx;
    }

    return (sum / numSamples) * volume;
  }
}

class Gamma extends NumbersMethodBuilder {
  override call(): any {
    const [x] = this.args;
    this.validateNumber(x, "x");

    const xVal = Number(x);

    if (xVal <= 0 && Number.isInteger(xVal)) {
      throw this.throwErrorFormatters(
        new Error("Gamma function is undefined for non-positive integers"),
      );
    }

    const g = 7;
    const p = [
      0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
      -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6,
      1.5056327351493116e-7,
    ];

    if (xVal < 0.5) {
      return (
        Math.PI / (Math.sin(Math.PI * xVal) * new Gamma([1 - xVal], [], this.environment).call())
      );
    }

    const z = xVal - 1;
    let x_gamma = p[0]!;

    for (let i = 1; i < g + 2; i++) {
      x_gamma += p[i]! / (z + i);
    }

    const t = z + g + 0.5;
    const sqrt2pi = Math.sqrt(2 * Math.PI);

    return sqrt2pi * Math.pow(t, z + 0.5) * Math.exp(-t) * x_gamma;
  }
}

class Beta extends NumbersMethodBuilder {
  override call() {
    const [a, b] = this.args;
    this.validateNumber(a, "a");
    this.validateNumber(b, "b");

    const aVal = Number(a);
    const bVal = Number(b);

    this.validatePositiveNumber(aVal, "a");
    this.validatePositiveNumber(bVal, "b");

    const gammaA = new Gamma([aVal], [], this.environment).call();
    const gammaB = new Gamma([bVal], [], this.environment).call();
    const gammaAB = new Gamma([aVal + bVal], [], this.environment).call();

    return (gammaA * gammaB) / gammaAB;
  }
}

class Erf extends NumbersMethodBuilder {
  override call() {
    const [x] = this.args;
    this.validateNumber(x, "x");

    const xVal = Number(x);

    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = xVal >= 0 ? 1 : -1;
    const absX = Math.abs(xVal);

    const t = 1.0 / (1.0 + p * absX);
    const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);

    return sign * y;
  }
}

class Erfc extends NumbersMethodBuilder {
  override call() {
    const [x] = this.args;
    const erfValue = new Erf([x], [], this.environment).call();
    return 1 - erfValue;
  }
}

class FFT extends NumbersMethodBuilder {
  override call() {
    const [realPart, imagPart] = this.args;
    const real = this.validateNumericArray(realPart, "real");

    let imag: number[];
    if (imagPart !== undefined) {
      imag = this.validateNumericArray(imagPart, "imaginary");
      if (real.length !== imag.length) {
        throw this.throwErrorFormatters(
          new Error("Real and imaginary parts must have the same length"),
        );
      }
    } else {
      imag = new Array(real.length).fill(0);
    }

    const n = real.length;

    if ((n & (n - 1)) !== 0) {
      throw this.throwErrorFormatters(new Error("Array length must be a power of 2"));
    }

    const fftRecursive = (real: number[], imag: number[]): { real: number[]; imag: number[] } => {
      const n = real.length;

      if (n <= 1) {
        return { real: [...real], imag: [...imag] };
      }

      const evenReal = real.filter((_, i) => i % 2 === 0);
      const evenImag = imag.filter((_, i) => i % 2 === 0);
      const oddReal = real.filter((_, i) => i % 2 === 1);
      const oddImag = imag.filter((_, i) => i % 2 === 1);

      const evenResult = fftRecursive(evenReal, evenImag);
      const oddResult = fftRecursive(oddReal, oddImag);

      const resultReal = new Array(n);
      const resultImag = new Array(n);

      for (let k = 0; k < n / 2; k++) {
        const angle = (-2 * Math.PI * k) / n;
        const cosAngle = Math.cos(angle);
        const sinAngle = Math.sin(angle);

        const tReal = cosAngle * oddResult.real[k]! - sinAngle * oddResult.imag[k]!;
        const tImag = sinAngle * oddResult.real[k]! + cosAngle * oddResult.imag[k]!;

        resultReal[k] = evenResult.real[k]! + tReal;
        resultImag[k] = evenResult.imag[k]! + tImag;
        resultReal[k + n / 2] = evenResult.real[k]! - tReal;
        resultImag[k + n / 2] = evenResult.imag[k]! - tImag;
      }

      return { real: resultReal, imag: resultImag };
    };

    return fftRecursive(real, imag);
  }
}

class IFFT extends NumbersMethodBuilder {
  override call() {
    const [realPart, imagPart] = this.args;
    const real = this.validateNumericArray(realPart, "real");

    let imag: number[];
    if (imagPart !== undefined) {
      imag = this.validateNumericArray(imagPart, "imaginary");
    } else {
      imag = new Array(real.length).fill(0);
    }

    const conjugateImag = imag.map((x) => -x);

    const fftResult = new FFT([real, conjugateImag], [], this.environment).call();

    const n = real.length;
    const resultReal = fftResult.real.map((x) => x / n);
    const resultImag = fftResult.imag.map((x) => -x / n);

    return { real: resultReal, imag: resultImag };
  }
}

export {
  LinearInterp,
  SplineInterp,
  PolynomialFit,
  PolynomialEval,
  Derivative,
  Integral,
  TrapezoidalRule,
  SimpsonsRule,
  AdaptiveQuadrature,
  Bisection,
  NewtonRaphson,
  Secant,
  BrentMethod,
  GoldenSectionSearch,
  TernarySearch,
  FiniteDifference,
  SecondDerivative,
  EulerMethod,
  RungeKutta4,
  AdamsBashforth,
  MonteCarloIntegration,
  MonteCarloMultiDim,
  Gamma,
  Beta,
  Erf,
  Erfc,
  FFT,
  IFFT,
};
