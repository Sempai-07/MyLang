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
      throw `${key} has been initialized`;
    }
    if (options) {
      this.optionsVar[key] = options;
    }
    this.values[key] = value;
  }

  update(key: string, value: any): void {
    const matchedEnvironment = this.getEnvironmentWithKey(key);

    if (!matchedEnvironment) {
      throw `${key} hasn't been defined`;
    }

    matchedEnvironment.values = {
      ...matchedEnvironment.values,
      [key]: value,
    };
  }

  get(key: string): any {
    const matchedEnvironment = this.getEnvironmentWithKey(key);

    if (!matchedEnvironment) {
      throw `${key} is not defined`;
    }

    return matchedEnvironment.values[key];
  }

  has(key: string): boolean {
    if (this.values.hasOwnProperty(key)) {
      return true;
    }
    return false;
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
