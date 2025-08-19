import { FunctionBuilder } from "../FunctionBuilder";
import { Environment } from "../../src/Environment";
import { type StmtType } from "../../src/ast/StmtType";
import { isTypeArgs } from "./utils";

class typeOf extends FunctionBuilder {
  constructor(args: any[], astArgs: StmtType[], environment: Environment) {
    super(args, astArgs, environment);
  }

  get pkgInfo() {
    return {
      name: "utils",
      path: __dirname,
    };
  }

  call() {
    return isTypeArgs(this.args[0]);
  }
}

export { typeOf };
