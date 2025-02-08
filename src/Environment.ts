import { BaseError } from "./errors/BaseError";

interface IOptionsVar {
  constant: boolean;
  readonly?: boolean;
}

class Environment {
  private parent?: Environment;
  protected values: Record<string, any> = {};
  public optionsVar: Record<string, IOptionsVar> = {};
  static SymbolEnum = Symbol("SymbolEnum");

  constructor(env?: Environment) {
    if (env) {
      this.parent = env;
    }
  }

  create(key: string, value: any, options?: IOptionsVar): void {
    if (this.values.hasOwnProperty(key)) {
      throw new BaseError(`${key} has been initialized`, {
        files:
          this.values["import"]?.paths ??
          this.parent?.values["import"]?.paths ??
          [],
      });
    }
    if (options) {
      this.optionsVar[key] = options;
    }
    this.values[key] = value;
  }

  update(key: string, value: any, ensure?: boolean): void {
    const matchedEnvironment = this.getEnvironmentWithKey(key);

    if (!matchedEnvironment && !ensure) {
      throw new BaseError(`${key} hasn't been defined`, {
        files:
          this.values["import"]?.paths ??
          this.parent?.values["import"]?.paths ??
          [],
      });
    }

    matchedEnvironment!.values = {
      ...matchedEnvironment!.values,
      [key]: value,
    };
  }

  get(key: string): any {
    const matchedEnvironment = this.getEnvironmentWithKey(key);

    if (!matchedEnvironment) {
      throw new BaseError(`${key} is not defined`, {
        files:
          this.values["import"]?.paths ??
          this.parent?.values["import"]?.paths ??
          [],
      });
    }

    return matchedEnvironment.values[key];
  }

  has(key: string): boolean {
    if (this.values.hasOwnProperty(key)) {
      return true;
    }
    return false;
  }

  clone(): Environment {
    const newEnv = new Environment();
    newEnv.values = { ...this.values };
    newEnv.optionsVar = { ...this.optionsVar };

    if (this.parent) {
      newEnv.parent = this.parent.clone();
    }

    return newEnv;
  }

  combine(env: Environment): Environment {
    let parent = this.parent
      ? this.parent.combine(env.parent ?? new Environment())
      : env.parent;

    const newEnv = new Environment(parent);

    newEnv.values = { ...this.values, ...env.values };
    newEnv.optionsVar = { ...this.optionsVar, ...env.optionsVar };

    return newEnv;
  }

  getRootEnv(): Environment {
    let currentEnvironment: Environment = this;

    while (currentEnvironment.parent) {
      currentEnvironment = currentEnvironment.parent;
    }

    return currentEnvironment;
  }

  private getEnvironmentWithKey(key: string): Environment | null {
    if (this.values.hasOwnProperty(key)) {
      return this;
    }

    let currentEnvironment = this.parent;

    while (currentEnvironment) {
      if (currentEnvironment.values.hasOwnProperty(key)) {
        return currentEnvironment;
      }
      currentEnvironment = currentEnvironment.parent;
    }

    return null;
  }
}

export { Environment, type IOptionsVar };
