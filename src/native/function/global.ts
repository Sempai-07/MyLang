import { FunctionBuilder } from "../../../library/FunctionBuilder";
import { Environment } from "../../Environment";
import { type StmtType } from "../../ast/StmtType";
import { isTypeArgs } from "../../../library/utils/utils";

class Length extends FunctionBuilder {
  constructor(args: any[], astArgs: StmtType[], environment: Environment) {
    super(args, astArgs, environment);
  }

  get pkgInfo() {
    return {
      name: "(anonymous)",
      path: __dirname,
    };
  }

  getLength(value: any): number {
    if (value == null) {
      return 0;
    }

    const valueType = isTypeArgs(value);

    switch (valueType) {
      case "string":
      case "array":
        return value.length;
      case "object":
        return Object.keys(value).length;
      case "int":
      case "float":
      case "bigint":
        return Math.abs(Number(value)).toString().replace(".", "").length;
      case "boolean":
        return 1;
      case "function":
        return value.params?.length || 0;
      case "struct":
        return (value.methods?.length || 0) + (value.fields?.length || 0);
      case "enum":
        return (value.functionsList?.length || 0) + (value.identifierList?.length || 0);
      default:
        return 0;
    }
  }

  async call() {
    if (this.args.length === 0) {
      return 0;
    }

    if (this.args.length > 1) {
      let totalLength = 0;

      for (const value of this.args) {
        totalLength += this.getLength(value);
      }

      return totalLength;
    }

    return this.getLength(this.args[0]);
  }
}

export { Length };
