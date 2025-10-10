import { StmtType, type ITextOptions } from "../StmtType";
import { type Position } from "../../lexer/token/Position";
import { MemberExpression } from "./MemberExpression";
import { IdentifierLiteral } from "../types/IdentifierLiteral";
import { Environment } from "../../Environment";
import { FunctionCallError, FunctionCallCodeError } from "../../errors/runtime/FunctionCallError";

class CallExpression extends StmtType {
  public readonly identifier: string;
  public readonly method: string | StmtType;
  public readonly callee: MemberExpression | IdentifierLiteral | null;
  public readonly argument: StmtType[];
  public readonly position: Position;

  constructor(
    identifier: string,
    method: string | StmtType,
    callee: MemberExpression | IdentifierLiteral | null,
    argument: StmtType[],
    position: Position,
  ) {
    super();

    this.identifier = identifier;

    this.method = method;

    this.callee = callee;

    this.argument = argument;

    this.position = position;
  }

  async evaluate(score: Environment) {
    try {
      if (!this.callee) {
        if (super.isNodeFunction(score.get(this.identifier))) {
          const func = score.get(this.identifier);
          const combineScore = score.combine(func.parentEnv);

          const evaluatedArgs = [];
          for (const arg of this.argument) {
            evaluatedArgs.push(await arg.evaluate(combineScore));
          }

          return func.call(evaluatedArgs);
        }

        const method =
          this.method instanceof StmtType ? await this.method.evaluate(score) : this.method;

        if (!(method in score.get(this.identifier))) {
          throw new FunctionCallError(FunctionCallCodeError.FunctionIsNotMethod, {
            method,
            identifier: this.identifier,
            files: score.get("import").paths,
          });
        }

        const methodVar = score.get(this.identifier)[method];

        if (super.isNodeFunction(methodVar)) {
          const combineScore = score.combine(methodVar.parentEnv);
          const argument = [];
          for (const arg of this.argument) {
            const result = await arg.evaluate(combineScore);

            if (arg instanceof IdentifierLiteral) {
              const variableOpts = combineScore.optionsVar[arg.value];

              argument.push({
                ...(variableOpts && { options: variableOpts }),
                value: result,
              });
            } else {
              argument.push({ value: result });
            }
          }

          return methodVar.call(argument);
        }

        if (super.isBuildModuleFunction(methodVar)) {
          const argument = [];
          for (const arg of this.argument) {
            argument.push(await arg.evaluate(score));
          }

          return new methodVar(argument, this.argument, score).call();
        }

        if (super.isStructData(methodVar)) {
          const argument = [];
          for (const arg of this.argument) {
            argument.push(await arg.evaluate(score));
          }

          return methodVar.call(argument);
        }

        throw new FunctionCallError(FunctionCallCodeError.FunctionCallUnknown, {
          name: `${this.identifier}.${method}`,
          files: score.get("import").paths,
        });
      }

      const obj = await this.callee.evaluate(score);

      const method =
        this.method instanceof StmtType ? await this.method.evaluate(score) : this.method;

      const methodRef = obj?.[method] || obj;

      if (super.isNodeFunction(methodRef)) {
        const combineScore = methodRef.parentEnv.combine(score);
        const argument = [];
        
        for (const arg of this.argument) {
          const result = await arg.evaluate(combineScore);

          if (arg instanceof IdentifierLiteral) {
            const variableOpts = combineScore.optionsVar[arg.value];

            argument.push({
              ...(variableOpts && { options: variableOpts }),
              value: result,
            });
          } else {
            argument.push({ value: result });
          }
        }

        let target: any;

        if (this.callee instanceof MemberExpression) {
          const object = await this.callee.obj.evaluate(combineScore);
          const property = await this.callee.property.evaluate(methodRef.parentEnv);
          target = object?.[property];
        } else {
          target = await this.callee.evaluate(score);
        }

        return methodRef.call(argument, target);
      }

      if (super.isBuildModuleFunction(methodRef)) {
        const argument = [];
        for (const arg of this.argument) {
          argument.push(await arg.evaluate(score));
        }

        return new methodRef(argument, this.argument, score).call();
      }

      if (super.isStructData(methodRef)) {
        const argument = [];
        for (const arg of this.argument) {
          argument.push(await arg.evaluate(score));
        }

        return methodRef.call(argument);
      }

      const unknownFunction =
        this.callee && "value" in this.callee ? this.callee.value : this.identifier;

      throw new FunctionCallError(FunctionCallCodeError.FunctionCallUnknown, {
        name: unknownFunction === method ? unknownFunction : `${unknownFunction}.${method}`,
        files: score.get("import").paths,
      });
    } catch (err) {
      throw super.throwErrorFormatters(err, score, ({ file, position }: ITextOptions) => {
        if (this.callee && "value" in this.callee) {
          return `${this.callee.value}.${this.method} (${file}:${position.line}:${position.column})`;
        } else if (this.callee && "method" in this.callee) {
          return `${this.callee.method}.${this.method} (${file}:${position.line}:${position.column})`;
        }
        return `${this.identifier}.${this.method} (${file}:${position.line}:${position.column})`;
      });
    }
  }
}

export { CallExpression };
