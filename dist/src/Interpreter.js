"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interpreter = void 0;
const tslib_1 = require("tslib");
const node_fs_1 = tslib_1.__importDefault(require("node:fs"));
const node_path_1 = tslib_1.__importDefault(require("node:path"));
const BaseError_1 = require("./errors/BaseError");
const StringLiteral_1 = require("./ast/types/StringLiteral");
const IntLiteral_1 = require("./ast/types/IntLiteral");
const FloatLiteral_1 = require("./ast/types/FloatLiteral");
const BoolLiteral_1 = require("./ast/types/BoolLiteral");
const NilLiteral_1 = require("./ast/types/NilLiteral");
const IdentifierLiteral_1 = require("./ast/types/IdentifierLiteral");
const AwaitExpression_1 = require("./ast/expression/AwaitExpression");
const BinaryExpression_1 = require("./ast/expression/BinaryExpression");
const CallExpression_1 = require("./ast/expression/CallExpression");
const VisitUnaryExpression_1 = require("./ast/expression/VisitUnaryExpression");
const FunctionCall_1 = require("./ast/expression/FunctionCall");
const MemberExpression_1 = require("./ast/expression/MemberExpression");
const AssignmentExpression_1 = require("./ast/expression/AssignmentExpression");
const UpdateExpression_1 = require("./ast/expression/UpdateExpression");
const ArrayExpression_1 = require("./ast/expression/ArrayExpression");
const ObjectExpression_1 = require("./ast/expression/ObjectExpression");
const TernaryExpression_1 = require("./ast/expression/TernaryExpression");
const DeferDeclaration_1 = require("./ast/declaration/DeferDeclaration");
const ImportDeclaration_1 = require("./ast/declaration/ImportDeclaration");
const ExportsDeclaration_1 = require("./ast/declaration/ExportsDeclaration");
const VariableDeclaration_1 = require("./ast/declaration/VariableDeclaration");
const CombinedVariableDeclaration_1 = require("./ast/declaration/CombinedVariableDeclaration");
const FunctionDeclaration_1 = require("./ast/declaration/FunctionDeclaration");
const EnumDeclaration_1 = require("./ast/declaration/EnumDeclaration");
const ThrowDeclaration_1 = require("./ast/declaration/ThrowDeclaration");
const BlockStatement_1 = require("./ast/statement/BlockStatement");
const ReturnStatement_1 = require("./ast/statement/ReturnStatement");
const IfStatement_1 = require("./ast/statement/IfStatement");
const ForStatement_1 = require("./ast/statement/ForStatement");
const ForInStatement_1 = require("./ast/statement/ForInStatement");
const WhileStatement_1 = require("./ast/statement/WhileStatement");
const TryCatchStatement_1 = require("./ast/statement/TryCatchStatement");
const MatchStatement_1 = require("./ast/statement/MatchStatement");
const Environment_1 = require("./Environment");
const Runtime_1 = require("./runtime/Runtime");
const symbol_1 = require("./native/lib/promises/symbol");
class Interpreter {
    ast;
    globalScore;
    constructor(ast, paths, options) {
        this.ast = ast;
        this.globalScore = new Environment_1.Environment();
        this.globalScore.create("import", {
            base: options.base,
            main: options.main,
            cache: options.cache || {},
            paths,
            resolve([moduleName]) {
                if (moduleName &&
                    (node_path_1.default.parse(moduleName).ext === ".ml" ||
                        node_path_1.default.parse(moduleName).ext === ".json")) {
                    const resolvedPath = node_path_1.default.resolve(options.base, moduleName);
                    if (node_fs_1.default.existsSync(resolvedPath)) {
                        return resolvedPath;
                    }
                }
                throw new BaseError_1.ImportFaildError(`Cannot find module: "${moduleName}"`, {
                    code: "IMPORT_MODULE_FAILD",
                    cause: {
                        packageName: moduleName,
                    },
                    files: paths,
                });
            },
        });
        this.globalScore.create("process", {
            env: process.env,
        });
        this.globalScore.create("#exports", {});
        this.globalScore.create("#options", options.options);
    }
    run() {
        let result = null;
        for (const body of this.ast) {
            result = this.parseAst(body);
        }
        for (const task of Runtime_1.runtime.taskQueue) {
            if (!task[symbol_1.PromiseCustom].isAlertRunning()) {
                task[symbol_1.PromiseCustom].start();
            }
        }
        return result;
    }
    parseAst(body) {
        switch (true) {
            case body instanceof StringLiteral_1.StringLiteral:
            case body instanceof IntLiteral_1.IntLiteral:
            case body instanceof FloatLiteral_1.FloatLiteral:
            case body instanceof BoolLiteral_1.BoolLiteral:
            case body instanceof NilLiteral_1.NilLiteral:
            case body instanceof IdentifierLiteral_1.IdentifierLiteral:
            case body instanceof AwaitExpression_1.AwaitExpression:
            case body instanceof BinaryExpression_1.BinaryExpression:
            case body instanceof CallExpression_1.CallExpression:
            case body instanceof MemberExpression_1.MemberExpression:
            case body instanceof ArrayExpression_1.ArrayExpression:
            case body instanceof ObjectExpression_1.ObjectExpression:
            case body instanceof AssignmentExpression_1.AssignmentExpression:
            case body instanceof UpdateExpression_1.UpdateExpression:
            case body instanceof TernaryExpression_1.TernaryExpression:
            case body instanceof DeferDeclaration_1.DeferDeclaration:
            case body instanceof ImportDeclaration_1.ImportDeclaration:
            case body instanceof ExportsDeclaration_1.ExportsDeclaration:
            case body instanceof VariableDeclaration_1.VariableDeclaration:
            case body instanceof CombinedVariableDeclaration_1.CombinedVariableDeclaration:
            case body instanceof FunctionDeclaration_1.FunctionDeclaration:
            case body instanceof EnumDeclaration_1.EnumDeclaration:
            case body instanceof ThrowDeclaration_1.ThrowDeclaration:
            case body instanceof FunctionCall_1.FunctionCall:
            case body instanceof VisitUnaryExpression_1.VisitUnaryExpression:
            case body instanceof BlockStatement_1.BlockStatement:
            case body instanceof ReturnStatement_1.ReturnStatement:
            case body instanceof IfStatement_1.IfStatement:
            case body instanceof ForStatement_1.ForStatement:
            case body instanceof ForInStatement_1.ForInStatement:
            case body instanceof WhileStatement_1.WhileStatement:
            case body instanceof TryCatchStatement_1.TryCatchStatement:
            case body instanceof MatchStatement_1.MatchStatement:
                return body.evaluate(this.globalScore);
            default:
                console.log(body);
                throw new Error("Unknown AST node type encountered");
        }
    }
}
exports.Interpreter = Interpreter;
