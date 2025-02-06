"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunctionDeclaration = void 0;
const node_crypto_1 = require("node:crypto");
const StmtType_1 = require("../StmtType");
const Environment_1 = require("../../Environment");
const Runtime_1 = require("../../runtime/Runtime");
class FunctionDeclaration extends StmtType_1.StmtType {
    id = (0, node_crypto_1.randomUUID)();
    name;
    params;
    body;
    parentEnv = new Environment_1.Environment();
    position;
    constructor(name, params, body, position) {
        super();
        this.name = name;
        this.params = params;
        this.body = body;
        this.position = position;
    }
    call(args, callerInstance) {
        const callEnvironment = new Environment_1.Environment(this.parentEnv);
        for (let i = 0; i < this.params.length; i++) {
            const argument = args[i];
            const [param, defaultValue] = this.params[i];
            callEnvironment.create(param, argument || defaultValue.evaluate(callEnvironment));
        }
        callEnvironment.create("arguments", args);
        for (const key of Object.keys(callEnvironment)) {
            if (!this.parentEnv.has(key) ||
                this.parentEnv.get(key) instanceof FunctionDeclaration)
                continue;
            this.parentEnv.update(key, callEnvironment.get(key));
        }
        if (callerInstance) {
            callEnvironment.create("this", Object.assign(callerInstance, this.parentEnv.values));
        }
        else {
            callEnvironment.create("this", this.parentEnv.getRootEnv().get("process"));
        }
        Runtime_1.runtime.markFunctionCallPosition();
        this.body.evaluate(callEnvironment);
        const result = Runtime_1.runtime.getLastFunctionExecutionResult();
        Runtime_1.runtime.resetLastFunctionExecutionResult();
        return result;
    }
    evaluate(score) {
        const func = new FunctionDeclaration(this.name, this.params, this.body, this.position);
        func.parentEnv = score;
        if (!score.has(func.name)) {
            score.create(func.name, func);
        }
        else
            score.update(func.name, func);
        return func;
    }
}
exports.FunctionDeclaration = FunctionDeclaration;
