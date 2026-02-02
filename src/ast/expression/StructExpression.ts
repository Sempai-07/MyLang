import { StmtType } from "../StmtType";
import { Environment, type IOptionsVar } from "../../Environment";
import { VariableDeclaration } from "../declaration/VariableDeclaration";
import { FunctionDeclaration } from "../declaration/FunctionDeclaration";
import { type Position } from "../../lexer/token/Position";

class StructExpression extends StmtType {
  public name: string | null;
  public fields: VariableDeclaration[];
  public methods: FunctionDeclaration[];
  public parentEnv: Environment = new Environment();
  public position: Position;

  constructor(
    name: string | null,
    fields: VariableDeclaration[],
    methods: FunctionDeclaration[],
    position: Position,
  ) {
    super();

    this.name = name;

    this.fields = fields;

    this.methods = methods;

    this.position = position;
  }

  async call(args: any[]) {
    const fieldsData: Record<string, IOptionsVar | null> = {};
    const callEnvironment = new Environment(this.parentEnv);

    callEnvironment.create("this", {
      [Environment.SymbolStruct]: true,
    });

    const initStructMethod = this.methods.find(({ name }) => {
      return name === "init";
    });

    if (initStructMethod) {
      this.methods = this.methods.filter(({ name }) => {
        return name !== "init";
      });

      for (let i = 0; i < this.fields.length; i++) {
        const field = this.fields[i]!;

        fieldsData[field.name] = field.options;

        callEnvironment.update("this", {
          [field.name]: null,
          ...callEnvironment.get("this"),
        });
      }

      await initStructMethod.evaluate(callEnvironment).call(
        args.map((arg) => ({
          value: arg,
        })),
      );
    } else {
      for (let i = 0; i < this.fields.length; i++) {
        const argument = args[i];
        const field = this.fields[i]!;

        fieldsData[field.name] = field.options;

        callEnvironment.update("this", {
          [field.name]: i in args ? argument : await field.value.evaluate(callEnvironment),
          ...callEnvironment.get("this"),
        });
      }
    }

    for (let i = 0; i < this.methods.length; i++) {
      const method = this.methods[i]!;

      callEnvironment.update("this", {
        [method.name]: await method.evaluate(callEnvironment),
        ...callEnvironment.get("this"),
      });

      method.parentEnv.ensure("this", callEnvironment.get("this"));
    }

    callEnvironment.update("this", {
      ...callEnvironment.get("this"),
      [Environment.SymbolStructData]: fieldsData,
    });

    return callEnvironment.get("this");
  }

  async evaluate(score: Environment) {
    const struct = new StructExpression(this.name, this.fields, this.methods, this.position);

    struct.parentEnv = score;

    return struct;
  }
}

export { StructExpression };
