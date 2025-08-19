import { FunctionBuilder, FunctionBuilderCodeError } from "../FunctionBuilder";
import { Environment } from "../../src/Environment";
import { type StmtType } from "../../src/ast/StmtType";
import { isTypeArgs } from "../utils/utils";

class LCGRandom {
  private seed: number;
  private readonly a = 1664525;
  private readonly c = 1013904223;
  private readonly m = 2 ** 32;

  constructor(seed?: number) {
    this.seed = seed !== undefined ? seed : Date.now() % this.m;
  }

  random(): number {
    this.seed = (this.a * this.seed + this.c) % this.m;
    return this.seed / this.m;
  }

  setSeed(seed: number): void {
    this.seed = seed % this.m;
  }

  getSeed(): number {
    return this.seed;
  }
}

const globalRNG = new LCGRandom();

abstract class RandomMethodBuilder extends FunctionBuilder {
  constructor(args: any[], astArgs: StmtType[], environment: Environment) {
    super(args, astArgs, environment);
  }

  get pkgInfo() {
    return {
      name: "random",
      path: __dirname,
    };
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

  protected validateArray(arr: any, argName: string = "array"): void {
    if (isTypeArgs(arr) !== "array") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "array",
        received: isTypeArgs(arr),
      });
    }
  }

  protected validateFunction(func: any, argName: string = "function"): void {
    if (isTypeArgs(func) !== "function") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "function",
        received: isTypeArgs(func),
      });
    }
  }

  protected executeCallback(callbackFunc: any, args: any[]): any {
    if (this.isBuildModuleFunction(callbackFunc)) {
      return new callbackFunc(args, [], this.environment).call();
    }
    return callbackFunc.call(args.map((v) => ({ value: v })));
  }

  call() {
    new Error("Call is not implemented");
  }
}

class Random extends RandomMethodBuilder {
  override call() {
    return globalRNG.random();
  }
}

class Seed extends RandomMethodBuilder {
  override call() {
    const [seedValue] = this.args;
    if (seedValue !== undefined) {
      this.validateNumber(seedValue, "seed");
    }

    const newSeed = seedValue !== undefined ? seedValue : Date.now();
    globalRNG.setSeed(newSeed);
    return null;
  }
}

class GetState extends RandomMethodBuilder {
  override call() {
    return globalRNG.getSeed();
  }
}

class SetState extends RandomMethodBuilder {
  override call() {
    const [state] = this.args;
    this.validateNumber(state, "state");
    globalRNG.setSeed(state);
    return null;
  }
}

class Randrange extends RandomMethodBuilder {
  override call() {
    const [start, stop, step] = this.args;

    let actualStart: number, actualStop: number, actualStep: number;

    if (stop === undefined) {
      actualStart = 0;
      actualStop = start;
      actualStep = 1;
    } else {
      actualStart = start;
      actualStop = stop;
      actualStep = step !== undefined ? step : 1;
    }

    this.validateNumber(actualStart, "start");
    this.validateNumber(actualStop, "stop");
    this.validateNumber(actualStep, "step");

    if (actualStep === 0) {
      throw this.throwErrorFormatters(new Error("step argument must not be zero"));
    }

    if (actualStep > 0 && actualStart >= actualStop) {
      throw this.throwErrorFormatters(new Error("empty range for randrange()"));
    }

    if (actualStep < 0 && actualStart <= actualStop) {
      throw this.throwErrorFormatters(new Error("empty range for randrange()"));
    }

    const width = Math.abs(actualStop - actualStart);
    const n = Math.floor(width / Math.abs(actualStep));

    const choice = Math.floor(globalRNG.random() * n);
    return actualStart + choice * actualStep;
  }
}

class Randint extends RandomMethodBuilder {
  override call() {
    const [a, b] = this.args;
    this.validateNumber(a, "a");
    this.validateNumber(b, "b");

    const min = Math.min(a, b);
    const max = Math.max(a, b);

    return Math.floor(globalRNG.random() * (max - min + 1)) + min;
  }
}

class Choice extends RandomMethodBuilder {
  override call() {
    const [seq] = this.args;
    this.validateArray(seq, "sequence");

    if (seq.length === 0) {
      throw this.throwErrorFormatters(new Error("cannot choose from an empty sequence"));
    }

    const index = Math.floor(globalRNG.random() * seq.length);
    return seq[index];
  }
}

class Choices extends RandomMethodBuilder {
  override call() {
    const [population, weights, cumWeights, k] = this.args;
    this.validateArray(population, "population");

    const actualK = k !== undefined ? k : 1;
    this.validateNumber(actualK, "k");

    if (population.length === 0) {
      throw this.throwErrorFormatters(new Error("population must be non-empty"));
    }

    let cumulativeWeights: number[] = [];

    if (cumWeights !== undefined) {
      this.validateArray(cumWeights, "cumWeights");
      cumulativeWeights = [...cumWeights];
    } else if (weights !== undefined) {
      this.validateArray(weights, "weights");
      if (weights.length !== population.length) {
        throw this.throwErrorFormatters(new Error("weights length must match population length"));
      }

      let sum = 0;
      for (const weight of weights) {
        sum += weight;
        cumulativeWeights.push(sum);
      }
    } else {
      for (let i = 1; i <= population.length; i++) {
        cumulativeWeights.push(i);
      }
    }

    const total = cumulativeWeights[cumulativeWeights.length - 1]!;
    const result = [];

    for (let i = 0; i < actualK; i++) {
      const r = globalRNG.random() * total;
      const index = cumulativeWeights.findIndex((cum) => cum > r);
      result.push(population[index]);
    }

    return actualK === 1 ? result[0] : result;
  }
}

class Sample extends RandomMethodBuilder {
  override call() {
    const [population, k, counts] = this.args;
    this.validateArray(population, "population");
    this.validateNumber(k, "k");

    if (k < 0) {
      throw this.throwErrorFormatters(new Error("sample size must be non-negative"));
    }

    let expandedPopulation: any[] = [];

    if (counts !== undefined) {
      this.validateArray(counts, "counts");

      if (counts.length !== population.length) {
        throw this.throwErrorFormatters(new Error("counts length must match population length"));
      }

      for (let i = 0; i < population.length; i++) {
        const count = counts[i];
        this.validateNumber(count, `counts[${i}]`);

        if (count < 0) {
          throw this.throwErrorFormatters(new Error("counts must be non-negative"));
        }

        for (let j = 0; j < count; j++) {
          expandedPopulation.push(population[i]);
        }
      }
    } else {
      expandedPopulation = [...population];
    }

    if (k > expandedPopulation.length) {
      throw this.throwErrorFormatters(new Error("sample larger than population"));
    }

    const pool = [...expandedPopulation];
    const result = [];

    for (let i = 0; i < k; i++) {
      const j = Math.floor(globalRNG.random() * (pool.length - i)) + i;
      [pool[i], pool[j]] = [pool[j], pool[i]];
      result.push(pool[i]);
    }

    return result;
  }
}

class Shuffle extends RandomMethodBuilder {
  override call() {
    const [x] = this.args;
    this.validateArray(x, "x");

    for (let i = x.length - 1; i > 0; i--) {
      const j = Math.floor(globalRNG.random() * (i + 1));
      [x[i], x[j]] = [x[j], x[i]];
    }

    return null;
  }
}

class Uniform extends RandomMethodBuilder {
  override call() {
    const [a, b] = this.args;
    this.validateNumber(a, "a");
    this.validateNumber(b, "b");

    return a + (b - a) * globalRNG.random();
  }
}

class Triangular extends RandomMethodBuilder {
  override call() {
    const [low, high, mode] = this.args;
    this.validateNumber(low, "low");
    this.validateNumber(high, "high");

    const actualMode = mode !== undefined ? mode : (low + high) / 2;
    this.validateNumber(actualMode, "mode");

    const u = globalRNG.random();
    const c = (actualMode - low) / (high - low);

    if (u < c) {
      return low + Math.sqrt(u * (high - low) * (actualMode - low));
    } else {
      return high - Math.sqrt((1 - u) * (high - low) * (high - actualMode));
    }
  }
}

class Gauss extends RandomMethodBuilder {
  private static spare: number | null = null;
  private static hasSpare: boolean = false;

  override call() {
    const [mu, sigma] = this.args;
    this.validateNumber(mu, "mu");
    this.validateNumber(sigma, "sigma");

    if (Gauss.hasSpare) {
      Gauss.hasSpare = false;
      return Gauss.spare! * sigma + mu;
    }

    Gauss.hasSpare = true;

    const u = globalRNG.random();
    const v = globalRNG.random();

    const mag = sigma * Math.sqrt(-2.0 * Math.log(u));
    Gauss.spare = mag * Math.cos(2.0 * Math.PI * v);

    return mag * Math.sin(2.0 * Math.PI * v) + mu;
  }
}

class NormalVariate extends RandomMethodBuilder {
  override call() {
    const [mu, sigma] = this.args;
    return new Gauss([mu, sigma], [], this.environment).call();
  }
}

class LogNormVariate extends RandomMethodBuilder {
  override call() {
    const [mu, sigma] = this.args;
    this.validateNumber(mu, "mu");
    this.validateNumber(sigma, "sigma");

    const normal = new Gauss([mu, sigma], [], this.environment).call();
    return Math.exp(normal);
  }
}

class ExpoVariate extends RandomMethodBuilder {
  override call() {
    const [lambd] = this.args;
    this.validateNumber(lambd, "lambd");

    if (lambd <= 0) {
      throw this.throwErrorFormatters(new Error("lambd must be positive"));
    }

    return -Math.log(1 - globalRNG.random()) / lambd;
  }
}

class VonMisesVariate extends RandomMethodBuilder {
  override call() {
    const [mu, kappa] = this.args;
    this.validateNumber(mu, "mu");
    this.validateNumber(kappa, "kappa");

    if (kappa <= 1e-6) {
      return 2 * Math.PI * globalRNG.random();
    }

    const s = 0.5 / kappa;
    const r = s + Math.sqrt(1 + s * s);

    while (true) {
      const u1 = globalRNG.random();
      const z = Math.cos(Math.PI * u1);
      const d = z / (r + z);
      const u2 = globalRNG.random();

      if (u2 < 1 - d * d || u2 <= (1 - d) * Math.exp(d)) {
        const q = 1 / r;
        const f = (q + z) / (1 + q * z);
        const u3 = globalRNG.random();

        if (u3 > 0.5) {
          return (mu + Math.acos(f)) % (2 * Math.PI);
        } else {
          return (mu - Math.acos(f)) % (2 * Math.PI);
        }
      }
    }
  }
}

class GammaVariate extends RandomMethodBuilder {
  override call(): any {
    const [alpha, beta] = this.args;
    this.validateNumber(alpha, "alpha");
    this.validateNumber(beta, "beta");

    if (alpha <= 0 || beta <= 0) {
      throw this.throwErrorFormatters(new Error("alpha and beta must be positive"));
    }

    if (alpha >= 1) {
      const d = alpha - 1 / 3;
      const c = 1 / Math.sqrt(9 * d);

      while (true) {
        const x = new Gauss([0, 1], [], this.environment).call();
        const v = (1 + c * x) ** 3;

        if (v > 0) {
          const u = globalRNG.random();
          if (u < 1 - 0.0331 * x ** 4 || Math.log(u) < 0.5 * x ** 2 + d * (1 - v + Math.log(v))) {
            return (d * v) / beta;
          }
        }
      }
    } else {
      while (true) {
        const u = globalRNG.random();
        const v = globalRNG.random();
        const x = u ** (1 / alpha);
        const y = v ** (1 / (1 - alpha));

        if (x + y <= 1) {
          if (x + y > 0) {
            return (x / (x + y)) * new GammaVariate([1 + alpha, beta], [], this.environment).call();
          }
        }
      }
    }
  }
}

class BetaVariate extends RandomMethodBuilder {
  override call() {
    const [alpha, beta] = this.args;
    this.validateNumber(alpha, "alpha");
    this.validateNumber(beta, "beta");

    const y1 = new GammaVariate([alpha, 1], [], this.environment).call();
    const y2 = new GammaVariate([beta, 1], [], this.environment).call();

    return y1 / (y1 + y2);
  }
}

class ParetoVariate extends RandomMethodBuilder {
  override call() {
    const [alpha] = this.args;
    this.validateNumber(alpha, "alpha");

    if (alpha <= 0) {
      throw this.throwErrorFormatters(new Error("alpha must be positive"));
    }

    return 1 / (1 - globalRNG.random()) ** (1 / alpha);
  }
}

class WeibullVariate extends RandomMethodBuilder {
  override call() {
    const [alpha, beta] = this.args;
    this.validateNumber(alpha, "alpha");
    this.validateNumber(beta, "beta");

    if (alpha <= 0 || beta <= 0) {
      throw this.throwErrorFormatters(new Error("alpha and beta must be positive"));
    }

    return alpha * (-Math.log(1 - globalRNG.random())) ** (1 / beta);
  }
}

class SystemRandom extends RandomMethodBuilder {
  override call() {
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const array = new Uint32Array(1);
      crypto.getRandomValues(array);
      return array[0]! / 2 ** 32;
    } else {
      const now = performance.now();
      const seed = (now * 1000 + Date.now()) % 2 ** 32;
      const tempRNG = new LCGRandom(seed);
      return tempRNG.random();
    }
  }
}

class GetRandBits extends RandomMethodBuilder {
  override call() {
    const [k] = this.args;
    this.validateNumber(k, "k");

    if (k <= 0 || k > 32) {
      throw this.throwErrorFormatters(new Error("k must be between 1 and 32"));
    }

    return Math.floor(globalRNG.random() * 2 ** k);
  }
}

module.exports = {
  random: Random,
  seed: Seed,
  getState: GetState,
  setState: SetState,
  randrange: Randrange,
  randint: Randint,
  choice: Choice,
  choices: Choices,
  sample: Sample,
  shuffle: Shuffle,
  uniform: Uniform,
  triangular: Triangular,
  gauss: Gauss,
  normalVariate: NormalVariate,
  lognormVariate: LogNormVariate,
  expoVariate: ExpoVariate,
  vonMisesVariate: VonMisesVariate,
  gammaVariate: GammaVariate,
  betaVariate: BetaVariate,
  paretoVariate: ParetoVariate,
  weibullVariate: WeibullVariate,
  SystemRandom: SystemRandom,
  getrandbits: GetRandBits,
};
