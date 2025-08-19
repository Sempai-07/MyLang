import { StmtType } from "../StmtType";
import { Environment, type IOptionsVar } from "../../Environment";
import { VariableDeclaration } from "./VariableDeclaration";
import { FunctionDeclaration } from "./FunctionDeclaration";
import { type Position } from "../../lexer/token/Position";

class StructDeclaration extends StmtType {
  public name: string;
  public fields: VariableDeclaration[];
  public methods: FunctionDeclaration[];
  public parentEnv: Environment = new Environment();
  public position: Position;

  constructor(
    name: string,
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

    for (let i = 0; i < this.fields.length; i++) {
      const argument = args[i];
      const field = this.fields[i]!;

      fieldsData[field.name] = field.options;

      callEnvironment.update("this", {
        [field.name]: i in args ? argument : await field.value.evaluate(callEnvironment),
        ...callEnvironment.get("this"),
      });
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
    const struct = new StructDeclaration(this.name, this.fields, this.methods, this.position);

    struct.parentEnv = score;

    score.create(struct.name, struct);

    return struct;
  }
}

export { StructDeclaration };
