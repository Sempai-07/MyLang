"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunctionExpression = void 0;
const node_crypto_1 = require("node:crypto");
const StmtType_1 = require("../StmtType");
const FunctionDeclaration_1 = require("../declaration/FunctionDeclaration");
const Environment_1 = require("../../Environment");
const Runtime_1 = require("../../runtime/Runtime");
const Task_1 = require("../../runtime/task/Task");
const symbol_1 = require("../../native/lib/promises/symbol");
class FunctionExpression extends StmtType_1.StmtType {
    name;
    id = (0, node_crypto_1.randomUUID)();
    params;
    isAsync;
    body;
    parentEnv = new Environment_1.Environment();
    position;
    constructor(name, params, isAsync, body, position) {
        super();
        this.name = name;
        this.params = params;
        this.isAsync = isAsync;
        this.body = body;
        this.position = position;
    }
    call(args, callerInstance) {
        const callEnvironment = new Environment_1.Environment(this.parentEnv);
        for (let i = 0; i < this.params.length; i++) {
            const argument = args[i];
            const [param, defaultValue, rest] = this.params[i];
            if (!rest) {
                callEnvironment.create(param, argument?.value || defaultValue.evaluate(callEnvironment), argument?.options);
            }
            else {
                callEnvironment.create(param, args.slice(i).map(({ value }) => value));
                break;
            }
        }
        callEnvironment.create("arguments", args.map(({ value }) => value));
        for (const key of Object.keys(callEnvironment)) {
            if (!this.parentEnv.has(key) ||
                this.parentEnv.get(key) instanceof FunctionDeclaration_1.FunctionDeclaration)
                continue;
            this.parentEnv.update(key, callEnvironment.get(key));
        }
        if (callerInstance) {
            callEnvironment.create("this", callerInstance);
        }
        else {
            callEnvironment.create("this", this.parentEnv.getRootEnv().get("process"));
        }
        if (this.isAsync) {
            return Runtime_1.runtime.taskQueue.addTask(new Task_1.Task(() => {
                Runtime_1.runtime.markFunctionCallPosition();
                this.body.evaluate(callEnvironment);
                const result = Runtime_1.runtime.getLastFunctionExecutionResult();
                Runtime_1.runtime.resetLastFunctionExecutionResult();
                if (result instanceof Task_1.Task) {
                    Runtime_1.runtime.taskQueue.addTask(result);
                    result[symbol_1.PromiseCustom].start();
                    return result[symbol_1.PromiseCustom].getResult();
                }
                return result;
            }));
        }
        else {
            Runtime_1.runtime.markFunctionCallPosition();
            this.body.evaluate(callEnvironment);
            const result = Runtime_1.runtime.getLastFunctionExecutionResult();
            Runtime_1.runtime.resetLastFunctionExecutionResult();
            return result;
        }
    }
    evaluate(score) {
        const func = new FunctionExpression(this.name, this.params, this.isAsync, this.body, this.position);
        func.parentEnv = score;
        return func;
    }
}
exports.FunctionExpression = FunctionExpression;
