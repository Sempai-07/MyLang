"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const TokenType_1 = require("../lexer/TokenType");
const SyntaxError_1 = require("../errors/SyntaxError");
const StringLiteral_1 = require("./types/StringLiteral");
const IntLiteral_1 = require("./types/IntLiteral");
const FloatLiteral_1 = require("./types/FloatLiteral");
const BoolLiteral_1 = require("./types/BoolLiteral");
const NilLiteral_1 = require("./types/NilLiteral");
const IdentifierLiteral_1 = require("./types/IdentifierLiteral");
const BinaryExpression_1 = require("./expression/BinaryExpression");
const CallExpression_1 = require("./expression/CallExpression");
const VisitUnaryExpression_1 = require("./expression/VisitUnaryExpression");
const FunctionCall_1 = require("./expression/FunctionCall");
const FunctionExpression_1 = require("./expression/FunctionExpression");
const MemberExpression_1 = require("./expression/MemberExpression");
const AssignmentExpression_1 = require("./expression/AssignmentExpression");
const UpdateExpression_1 = require("./expression/UpdateExpression");
const ArrayExpression_1 = require("./expression/ArrayExpression");
const ObjectExpression_1 = require("./expression/ObjectExpression");
const TernaryExpression_1 = require("./expression/TernaryExpression");
const DeferDeclaration_1 = require("./declaration/DeferDeclaration");
const ImportDeclaration_1 = require("./declaration/ImportDeclaration");
const ExportsDeclaration_1 = require("./declaration/ExportsDeclaration");
const VariableDeclaration_1 = require("./declaration/VariableDeclaration");
const FunctionDeclaration_1 = require("./declaration/FunctionDeclaration");
const EnumDeclaration_1 = require("./declaration/EnumDeclaration");
const ThrowDeclaration_1 = require("./declaration/ThrowDeclaration");
const BlockStatement_1 = require("./statement/BlockStatement");
const ReturnStatement_1 = require("./statement/ReturnStatement");
const ForStatement_1 = require("./statement/ForStatement");
const ForInStatement_1 = require("./statement/ForInStatement");
const BreakStatement_1 = require("./statement/BreakStatement");
const ContinueStatement_1 = require("./statement/ContinueStatement");
const IfStatement_1 = require("./statement/IfStatement");
const WhileStatement_1 = require("./statement/WhileStatement");
const TryCatchStatement_1 = require("./statement/TryCatchStatement");
const MatchStatement_1 = require("./statement/MatchStatement");
class Parser {
    offset = 0;
    ast = [];
    tokens;
    constructor(tokens) {
        this.tokens = tokens;
    }
    parse() {
        while (!this.eof()) {
            const statement = this.parseStatement();
            if (statement) {
                this.ast.push(statement);
            }
        }
        return this.ast;
    }
    parseStatement() {
        const token = this.peek();
        switch (token.type) {
            case TokenType_1.TokenType.String:
            case TokenType_1.TokenType.Int:
            case TokenType_1.TokenType.Float:
            case TokenType_1.TokenType.Bool:
            case TokenType_1.TokenType.Nil:
            case TokenType_1.TokenType.Identifier: {
                return this.parsePrimary();
            }
            case TokenType_1.TokenType.Keyword: {
                return this.parseKeyword();
            }
            case TokenType_1.TokenType.BracketOpen: {
                return this.parseArrayExpression(token);
            }
            case TokenType_1.TokenType.OperatorAdd:
            case TokenType_1.TokenType.OperatorSubtract:
            case TokenType_1.TokenType.OperatorNot: {
                return this.parseUnaryExpression(token);
            }
            case TokenType_1.TokenType.ParenthesisOpen: {
                this.next();
                const expr = this.parseExpression();
                this.expect(TokenType_1.TokenType.ParenthesisClose);
                this.next();
                if (this.peek().type === TokenType_1.TokenType.QuestionMark) {
                    return this.parseTernaryExpression(expr);
                }
                return expr;
            }
            case TokenType_1.TokenType.BraceOpen: {
                this.next();
                const expr = this.parseBlockStatement(token);
                this.expect(TokenType_1.TokenType.BraceClose);
                this.next();
                return expr;
            }
            default:
                this.throwError(SyntaxError_1.SyntaxCodeError.InvalidUnexpectedToken, token);
        }
    }
    parseArrayExpression(identifier) {
        this.next();
        const elements = [];
        while (this.peek().type !== TokenType_1.TokenType.BracketClose) {
            elements.push(this.parsePrimary());
            if (this.peek().type === TokenType_1.TokenType.Comma) {
                this.next();
            }
            else if (this.peek().type === TokenType_1.TokenType.BracketClose) {
                break;
            }
            else {
                this.expect(TokenType_1.TokenType.BracketClose);
            }
        }
        this.next();
        this.expectSemicolonOrEnd();
        const arrayExpression = new ArrayExpression_1.ArrayExpression(elements, identifier.position);
        if (this.peek(-1).type !== TokenType_1.TokenType.Semicolon &&
            (this.peek().type === TokenType_1.TokenType.BracketOpen ||
                this.peek().type === TokenType_1.TokenType.Period)) {
            return this.parseMemberExpressions(arrayExpression);
        }
        else if (this.isOperator(this.peek().type)) {
            return this.parseExpression(arrayExpression);
        }
        else if (this.peek().type === TokenType_1.TokenType.QuestionMark) {
            return this.parseTernaryExpression(arrayExpression);
        }
        return arrayExpression;
    }
    parseObjectExpression(identifier) {
        this.next();
        const obj = [];
        while (this.peek().type !== TokenType_1.TokenType.BraceClose) {
            if (this.peek().type === TokenType_1.TokenType.Identifier) {
                const propertyName = this.parsePrimary();
                if (this.peek().type === TokenType_1.TokenType.Colon) {
                    this.next();
                    obj.push({ key: propertyName, value: this.parsePrimary() });
                }
                else
                    obj.push({
                        key: propertyName.value,
                        value: propertyName,
                    });
            }
            else if (this.peek().type === TokenType_1.TokenType.String) {
                const propertyName = this.parsePrimary();
                if (this.peek().type === TokenType_1.TokenType.Colon) {
                    this.next();
                    obj.push({ key: propertyName, value: this.parsePrimary() });
                }
            }
            else if (this.peek().type === TokenType_1.TokenType.BracketOpen) {
                this.next();
                const propertyName = this.parsePrimary();
                this.expect(TokenType_1.TokenType.BracketClose);
                this.next();
                this.expect(TokenType_1.TokenType.Colon);
                this.next();
                const propertyValue = this.parsePrimary();
                obj.push({ key: propertyName, value: propertyValue, computed: true });
            }
            if (this.peek().type === TokenType_1.TokenType.Comma) {
                this.next();
            }
            else
                this.expect(TokenType_1.TokenType.BraceClose);
        }
        this.expect(TokenType_1.TokenType.BraceClose);
        this.next();
        this.expectSemicolonOrEnd();
        const objExpression = new ObjectExpression_1.ObjectExpression(obj, identifier.position);
        if (this.peek(-1).type !== TokenType_1.TokenType.Semicolon &&
            (this.peek().type === TokenType_1.TokenType.BracketOpen ||
                this.peek().type === TokenType_1.TokenType.Period)) {
            return this.parseMemberExpressions(objExpression);
        }
        else if (this.isOperator(this.peek().type)) {
            return this.parseExpression(objExpression);
        }
        else if (this.peek().type === TokenType_1.TokenType.QuestionMark) {
            return this.parseTernaryExpression(objExpression);
        }
        return objExpression;
    }
    parseKeyword() {
        const token = this.peek();
        switch (token.value) {
            case TokenType_1.KeywordType.Var:
                this.next();
                return this.parseVariableDeclaration(this.peek());
            case TokenType_1.KeywordType.Func:
                this.next();
                return this.parseFunctionDeclaration(this.peek());
            case TokenType_1.KeywordType.Return:
                this.next();
                return this.parseReturnStatement(this.peek());
            case TokenType_1.KeywordType.If:
                this.next();
                return this.parseIfStatement(this.peek());
            case TokenType_1.KeywordType.For:
                this.next();
                return this.parseForStatement(this.peek());
            case TokenType_1.KeywordType.While:
                this.next();
                return this.parseWhileStatement(this.peek());
            case TokenType_1.KeywordType.Break:
                return this.parseBreakStatement(this.peek());
            case TokenType_1.KeywordType.Continue:
                return this.parseContinueStatement(this.peek());
            case TokenType_1.KeywordType.Try:
                this.next();
                return this.parseTryCatchStatement(this.peek());
            case TokenType_1.KeywordType.Throw:
                this.next();
                return this.parseThrowDeclaration(this.peek(-1));
            case TokenType_1.KeywordType.Match:
                this.next();
                return this.parseMatchStatement(this.peek());
            case TokenType_1.KeywordType.Defer:
                this.next();
                return this.parseDeferDeclaration(this.peek(-1));
            case TokenType_1.KeywordType.Import:
                if (this.peek(1).type === TokenType_1.TokenType.BracketOpen ||
                    this.peek(1).type === TokenType_1.TokenType.Period) {
                    this.next();
                    return this.parseMemberExpressions(new IdentifierLiteral_1.IdentifierLiteral(token.value, token.position));
                }
                this.next();
                return this.parseImportDeclaration(this.peek());
            case TokenType_1.KeywordType.Export:
                this.next();
                return this.parseExportDeclaration(this.peek());
            case TokenType_1.KeywordType.Enum:
                this.next();
                return this.parseEnumDeclaration(this.peek());
            default:
                this.throwError(SyntaxError_1.SyntaxCodeError.InvalidUnexpectedToken, token.position);
        }
    }
    parseVariableDeclaration(identifier) {
        this.next();
        if (this.peek().type !== TokenType_1.TokenType.OperatorAssign) {
            this.expectSemicolonOrEnd();
            return new VariableDeclaration_1.VariableDeclaration(identifier.value, new NilLiteral_1.NilLiteral(identifier.position), { constant: false }, identifier.position);
        }
        this.expect(TokenType_1.TokenType.OperatorAssign);
        this.next();
        const expression = this.parseExpression();
        if (this.peek().value === TokenType_1.KeywordType.As) {
            this.next();
            if (this.peek().value === TokenType_1.KeywordType.Const) {
                this.next();
                this.expectSemicolonOrEnd();
                return new VariableDeclaration_1.VariableDeclaration(identifier.value, expression, { constant: true }, identifier.position);
            }
            else if (this.peek().value === TokenType_1.KeywordType.Readonly) {
                this.next();
                this.expectSemicolonOrEnd();
                return new VariableDeclaration_1.VariableDeclaration(identifier.value, expression, { constant: true, readonly: true }, identifier.position);
            }
        }
        this.expectSemicolonOrEnd();
        return new VariableDeclaration_1.VariableDeclaration(identifier.value, expression, { constant: false }, identifier.position);
    }
    parseFunctionDeclaration(identifier) {
        this.next();
        this.expect(TokenType_1.TokenType.ParenthesisOpen);
        this.next();
        const args = this.parseArgumentsAndDefault();
        this.expect(TokenType_1.TokenType.ParenthesisClose);
        this.next();
        this.expect(TokenType_1.TokenType.BraceOpen);
        this.next();
        const statement = this.parseBlockStatement(identifier);
        this.next();
        return new FunctionDeclaration_1.FunctionDeclaration(identifier.value, args, statement, identifier.position);
    }
    parseReturnStatement(identifier) {
        if (this.peek().type === TokenType_1.TokenType.Semicolon) {
            this.next();
            return new ReturnStatement_1.ReturnStatement(new NilLiteral_1.NilLiteral(identifier.position), identifier.position);
        }
        if (this.peek().type === TokenType_1.TokenType.ParenthesisOpen) {
            this.next();
            const valueExpression = this.parsePrimary();
            if (this.peek().type === TokenType_1.TokenType.Comma) {
                this.next();
                const valuesExpression = [valueExpression];
                while (this.peek().type !== TokenType_1.TokenType.ParenthesisClose) {
                    valuesExpression.push(this.parsePrimary());
                    if (this.peek().type === TokenType_1.TokenType.Comma) {
                        this.next();
                    }
                }
                this.expect(TokenType_1.TokenType.ParenthesisClose);
                this.next();
                this.expectSemicolonOrEnd();
                return new ReturnStatement_1.ReturnStatement(valuesExpression, identifier.position);
            }
            const returns = new ReturnStatement_1.ReturnStatement(valueExpression, identifier.position);
            this.expect(TokenType_1.TokenType.ParenthesisClose);
            this.next();
            this.expectSemicolonOrEnd();
            return returns;
        }
        const valueExpression = this.parsePrimary();
        if (this.peek().type === TokenType_1.TokenType.Comma) {
            this.next();
            const valuesExpression = [valueExpression];
            while (this.peek().type !== TokenType_1.TokenType.Semicolon) {
                valuesExpression.push(this.parsePrimary());
                if (this.peek().type === TokenType_1.TokenType.Comma) {
                    this.next();
                }
            }
            this.expectSemicolonOrEnd();
            return new ReturnStatement_1.ReturnStatement(valuesExpression, identifier.position);
        }
        this.expectSemicolonOrEnd();
        return new ReturnStatement_1.ReturnStatement(valueExpression, identifier.position);
    }
    parseIfStatement(identifier) {
        this.expect(TokenType_1.TokenType.ParenthesisOpen);
        this.next();
        let test = this.parsePrimary();
        this.expect(TokenType_1.TokenType.ParenthesisClose);
        this.next();
        let consequent = null;
        if (this.peek().type === TokenType_1.TokenType.BraceOpen) {
            this.next();
            consequent = this.parseBlockStatement(identifier);
            this.expect(TokenType_1.TokenType.BraceClose);
            this.next();
        }
        else {
            consequent = this.parseStatement();
        }
        if (this.peek().type === TokenType_1.TokenType.Keyword &&
            this.peek().value === TokenType_1.KeywordType.Else) {
            this.next();
            if (this.peek().type === TokenType_1.TokenType.Keyword &&
                this.peek().value === TokenType_1.KeywordType.If) {
                this.next();
                const alternate = this.parseIfStatement(identifier);
                return new IfStatement_1.IfStatement(test, consequent, alternate, identifier.position);
            }
            let alternate = null;
            if (this.peek().type === TokenType_1.TokenType.BraceOpen) {
                this.next();
                alternate = this.parseBlockStatement(identifier);
                this.expect(TokenType_1.TokenType.BraceClose);
                this.next();
            }
            else {
                alternate = this.parseStatement();
            }
            this.expectSemicolonOrEnd();
            return new IfStatement_1.IfStatement(test, consequent, alternate, identifier.position);
        }
        this.expectSemicolonOrEnd();
        return new IfStatement_1.IfStatement(test, consequent, null, identifier.position);
    }
    parseForStatement(identifier) {
        this.expect(TokenType_1.TokenType.ParenthesisOpen);
        this.next();
        const init = this.parseStatement();
        if (this.peek().value === TokenType_1.KeywordType.In) {
            this.next();
            const iterable = this.parsePrimary();
            this.expect(TokenType_1.TokenType.ParenthesisClose);
            this.next();
            this.expect(TokenType_1.TokenType.BraceOpen);
            this.next();
            const statement = this.parseBlockStatement(identifier);
            this.next();
            this.expectSemicolonOrEnd();
            return new ForInStatement_1.ForInStatement(init, iterable, statement, identifier.position);
        }
        if (this.peek(-1).type !== TokenType_1.TokenType.Semicolon) {
            this.expect(TokenType_1.TokenType.Semicolon);
            this.next();
        }
        const test = this.parseExpression();
        if (this.peek(-1).type !== TokenType_1.TokenType.Semicolon) {
            this.expect(TokenType_1.TokenType.Semicolon);
            this.next();
        }
        const update = this.parseExpression();
        this.expect(TokenType_1.TokenType.ParenthesisClose);
        this.next();
        this.expect(TokenType_1.TokenType.BraceOpen);
        this.next();
        const statement = this.parseBlockStatement(identifier);
        this.next();
        this.expectSemicolonOrEnd();
        return new ForStatement_1.ForStatement(init, test, update, statement, identifier.position);
    }
    parseWhileStatement(identifier) {
        this.expect(TokenType_1.TokenType.ParenthesisOpen);
        this.next();
        const test = this.parsePrimary();
        this.expect(TokenType_1.TokenType.ParenthesisClose);
        this.next();
        this.expect(TokenType_1.TokenType.BraceOpen);
        this.next();
        const statement = this.parseBlockStatement(identifier);
        this.next();
        this.expectSemicolonOrEnd();
        return new WhileStatement_1.WhileStatement(test, statement, identifier.position);
    }
    parseBreakStatement(identifier) {
        this.next();
        this.expectSemicolonOrEnd();
        return new BreakStatement_1.BreakStatement(identifier.position);
    }
    parseContinueStatement(identifier) {
        this.next();
        this.expectSemicolonOrEnd();
        return new ContinueStatement_1.ContinueStatement(identifier.position);
    }
    parseTryCatchStatement(identifier) {
        this.expect(TokenType_1.TokenType.BraceOpen);
        this.next();
        const tryBlock = this.parseBlockStatement(identifier);
        this.next();
        if (this.peek().value !== TokenType_1.KeywordType.Catch &&
            this.peek().value !== TokenType_1.KeywordType.Finally) {
            this.throwError(SyntaxError_1.SyntaxCodeError.MissingCatchOrTry, {
                line: this.peek().position.line,
                column: this.peek().position.column,
            });
        }
        if (this.peek().value === TokenType_1.KeywordType.Finally) {
            this.next();
            this.expect(TokenType_1.TokenType.BraceOpen);
            this.next();
            const finallyBlock = this.parseBlockStatement(identifier);
            this.next();
            return new TryCatchStatement_1.TryCatchStatement(tryBlock, null, finallyBlock, identifier.position);
        }
        this.next();
        let catchVariables = null;
        if (this.peek().type === TokenType_1.TokenType.ParenthesisOpen) {
            this.next();
            this.expect(TokenType_1.TokenType.Identifier);
            catchVariables = this.peek().value;
            this.next();
            this.expect(TokenType_1.TokenType.ParenthesisClose);
            this.next();
        }
        this.expect(TokenType_1.TokenType.BraceOpen);
        this.next();
        const catchBlock = [
            catchVariables,
            this.parseBlockStatement(identifier),
        ];
        this.next();
        if (this.peek().value === TokenType_1.KeywordType.Finally) {
            this.next();
            this.expect(TokenType_1.TokenType.BraceOpen);
            this.next();
            const finallyBlock = this.parseBlockStatement(identifier);
            this.next();
            return new TryCatchStatement_1.TryCatchStatement(tryBlock, catchBlock, finallyBlock, identifier.position);
        }
        return new TryCatchStatement_1.TryCatchStatement(tryBlock, catchBlock, null, identifier.position);
    }
    parseThrowDeclaration(identifier) {
        const expression = this.parsePrimary();
        this.expectSemicolonOrEnd();
        return new ThrowDeclaration_1.ThrowDeclaration(expression, identifier.position);
    }
    parseMatchStatement(identifier) {
        this.expect(TokenType_1.TokenType.ParenthesisOpen);
        this.next();
        const test = this.parsePrimary();
        this.expect(TokenType_1.TokenType.ParenthesisClose);
        this.next();
        this.expect(TokenType_1.TokenType.BraceOpen);
        this.next();
        let defaultCase = null;
        const cases = [];
        while (this.peek().type !== TokenType_1.TokenType.BraceClose) {
            if (this.peek().value === TokenType_1.KeywordType.Case) {
                this.next();
                this.expect(TokenType_1.TokenType.ParenthesisOpen);
                this.next();
                const condition = this.parsePrimary();
                this.expect(TokenType_1.TokenType.ParenthesisClose);
                this.next();
                this.expect(TokenType_1.TokenType.Colon);
                this.next();
                const listCase = [];
                if (this.peek().value === TokenType_1.KeywordType.Case) {
                    while (this.peek().value === TokenType_1.KeywordType.Case) {
                        this.next();
                        this.expect(TokenType_1.TokenType.ParenthesisOpen);
                        this.next();
                        const condition = this.parsePrimary();
                        this.expect(TokenType_1.TokenType.ParenthesisClose);
                        this.next();
                        this.expect(TokenType_1.TokenType.Colon);
                        this.next();
                        listCase.push(condition);
                    }
                }
                if (this.peek().type === TokenType_1.TokenType.BraceOpen) {
                    this.next();
                    const blockStatement = this.parseBlockStatement(this.peek(-1));
                    cases.push({
                        condition,
                        block: blockStatement,
                    });
                    cases.push(...listCase.map((condition) => ({
                        condition,
                        block: blockStatement,
                    })));
                    this.next();
                }
                else if (this.peek().value === TokenType_1.KeywordType.Return) {
                    this.next();
                    const returnStatement = this.parseReturnStatement(this.peek(-1));
                    cases.push({
                        condition,
                        block: new BlockStatement_1.BlockStatement([returnStatement], returnStatement.position),
                    });
                    cases.push(...listCase.map((condition) => ({
                        condition,
                        block: new BlockStatement_1.BlockStatement([returnStatement], returnStatement.position),
                    })));
                }
                else {
                    const parsePrimary = this.parsePrimary();
                    cases.push({
                        condition,
                        block: parsePrimary,
                    });
                    cases.push(...listCase.map((condition) => ({
                        condition,
                        block: parsePrimary,
                    })));
                }
            }
            else if (this.peek().value === TokenType_1.KeywordType.Default) {
                this.next();
                this.expect(TokenType_1.TokenType.Colon);
                this.next();
                if (this.peek().type === TokenType_1.TokenType.BraceOpen) {
                    this.next();
                    defaultCase = this.parseBlockStatement(this.peek(-1));
                    this.next();
                }
                else if (this.peek().value === TokenType_1.KeywordType.Return) {
                    this.next();
                    const returnStatement = this.parseReturnStatement(this.peek(-1));
                    defaultCase = new BlockStatement_1.BlockStatement([returnStatement], returnStatement.position);
                }
                else {
                    defaultCase = this.parsePrimary();
                }
            }
            else {
                this.throwError(SyntaxError_1.SyntaxCodeError.Unexpected, this.peek());
            }
        }
        this.next();
        return new MatchStatement_1.MatchStatement(test, cases, defaultCase, identifier.position);
    }
    parseFunctionExpression(identifier) {
        let functionName = null;
        if (this.peek().type === TokenType_1.TokenType.Identifier) {
            functionName = this.peek().value;
            this.next();
        }
        this.expect(TokenType_1.TokenType.ParenthesisOpen);
        this.next();
        const args = this.parseArgumentsAndDefault();
        this.expect(TokenType_1.TokenType.ParenthesisClose);
        this.next();
        this.expect(TokenType_1.TokenType.BraceOpen);
        this.next();
        const statement = this.parseBlockStatement(identifier);
        this.next();
        this.expectSemicolonOrEnd();
        return new FunctionExpression_1.FunctionExpression(functionName, args, statement, identifier.position);
    }
    parseFunctionCall(identifier) {
        this.next();
        this.expect(TokenType_1.TokenType.ParenthesisOpen);
        this.next();
        const args = this.parseArguments();
        this.expect(TokenType_1.TokenType.ParenthesisClose);
        this.next();
        const functionCall = new FunctionCall_1.FunctionCall(identifier.value, args, identifier.position);
        if (this.peek().type === TokenType_1.TokenType.BracketOpen ||
            this.peek().type === TokenType_1.TokenType.Period) {
            return this.parseMemberExpressions(functionCall);
        }
        else if (this.isOperator(this.peek().type)) {
            return this.parseExpression(functionCall);
        }
        else if (this.peek().type === TokenType_1.TokenType.QuestionMark) {
            return this.parseTernaryExpression(functionCall);
        }
        this.expectSemicolonOrEnd();
        return functionCall;
    }
    parseDeferDeclaration(identifier) {
        if (this.peek().type === TokenType_1.TokenType.BraceOpen) {
            this.next();
            const value = this.parseBlockStatement(identifier);
            this.next();
            this.expectSemicolonOrEnd();
            return new DeferDeclaration_1.DeferDeclaration(value, identifier.position);
        }
        const value = this.parsePrimary();
        this.expectSemicolonOrEnd();
        return new DeferDeclaration_1.DeferDeclaration(value, identifier.position);
    }
    parseImportDeclaration(identifier, expression = false) {
        if (this.peek().type !== TokenType_1.TokenType.ParenthesisOpen && expression) {
            this.throwError(SyntaxError_1.SyntaxCodeError.InvalidDynamicImportUsage, identifier);
        }
        if (this.peek().type === TokenType_1.TokenType.ParenthesisOpen && !expression) {
            const packages = {};
            this.next();
            while (this.peek().type !== TokenType_1.TokenType.ParenthesisClose) {
                if (this.peek().type === TokenType_1.TokenType.String) {
                    const packageName = this.peek().value;
                    this.next();
                    packages[packageName] = packageName;
                    if ((this.peek().type !== TokenType_1.TokenType.Identifier ||
                        this.peek().type !== TokenType_1.TokenType.String) &&
                        this.peek().type !== TokenType_1.TokenType.ParenthesisClose) {
                        this.expect(TokenType_1.TokenType.Comma);
                    }
                }
                else if (this.peek().type === TokenType_1.TokenType.Identifier) {
                    const packageName = this.peek();
                    this.next();
                    this.expect(TokenType_1.TokenType.Colon);
                    this.next();
                    this.expect(TokenType_1.TokenType.String);
                    const importNamePackage = this.parsePrimary();
                    packages[packageName.value] = importNamePackage;
                    if ((this.peek().type !== TokenType_1.TokenType.Identifier ||
                        this.peek().type !== TokenType_1.TokenType.String) &&
                        this.peek().type !== TokenType_1.TokenType.ParenthesisClose) {
                        this.expect(TokenType_1.TokenType.Comma);
                    }
                }
                else if (this.peek().type === TokenType_1.TokenType.Comma) {
                    this.next();
                }
                else {
                    this.throwError(SyntaxError_1.SyntaxCodeError.Unexpected, identifier);
                }
            }
            this.expect(TokenType_1.TokenType.ParenthesisClose);
            this.next();
            this.expectSemicolonOrEnd();
            return new ImportDeclaration_1.ImportDeclaration(packages, expression, identifier.position);
        }
        if (this.peek().type === TokenType_1.TokenType.ParenthesisOpen && expression) {
            this.next();
            this.expect(TokenType_1.TokenType.String);
            const packageName = this.peek().value;
            this.next();
            this.expect(TokenType_1.TokenType.ParenthesisClose);
            this.next();
            this.expectSemicolonOrEnd();
            return new ImportDeclaration_1.ImportDeclaration(packageName, expression, identifier.position);
        }
        this.expect(TokenType_1.TokenType.String);
        const packageName = this.peek().value;
        this.next();
        this.expectSemicolonOrEnd();
        return new ImportDeclaration_1.ImportDeclaration(packageName, expression, identifier.position);
    }
    parseExportDeclaration(identifier) {
        this.expect(TokenType_1.TokenType.ParenthesisOpen);
        const exports = {};
        this.next();
        while (this.peek().type !== TokenType_1.TokenType.ParenthesisClose) {
            if (this.peek().type === TokenType_1.TokenType.Identifier) {
                const exportName = this.peek();
                this.next();
                if (this.peek().type === TokenType_1.TokenType.Colon) {
                    this.next();
                    const importValue = this.parsePrimary();
                    exports[exportName.value] = importValue;
                    if ((this.peek().type !== TokenType_1.TokenType.Identifier ||
                        this.peek().type !== TokenType_1.TokenType.String) &&
                        this.peek().type !== TokenType_1.TokenType.ParenthesisClose) {
                        this.expect(TokenType_1.TokenType.Comma);
                    }
                    else
                        continue;
                }
                exports[exportName.value] = new IdentifierLiteral_1.IdentifierLiteral(exportName.value, exportName.position);
                if ((this.peek().type !== TokenType_1.TokenType.Identifier ||
                    this.peek().type !== TokenType_1.TokenType.String) &&
                    this.peek().type !== TokenType_1.TokenType.ParenthesisClose) {
                    this.expect(TokenType_1.TokenType.Comma);
                }
            }
            else if (this.peek().type === TokenType_1.TokenType.String) {
                const exportName = this.peek();
                this.next();
                this.expect(TokenType_1.TokenType.Colon);
                this.next();
                const importValue = this.parsePrimary();
                exports[exportName.value] = importValue;
                if ((this.peek().type !== TokenType_1.TokenType.Identifier ||
                    this.peek().type !== TokenType_1.TokenType.String) &&
                    this.peek().type !== TokenType_1.TokenType.ParenthesisClose) {
                    this.expect(TokenType_1.TokenType.Comma);
                }
            }
            else if (this.peek().type === TokenType_1.TokenType.Comma) {
                this.next();
            }
            else {
                this.throwError(SyntaxError_1.SyntaxCodeError.Unexpected, identifier);
            }
        }
        this.expect(TokenType_1.TokenType.ParenthesisClose);
        this.next();
        this.expectSemicolonOrEnd();
        return new ExportsDeclaration_1.ExportsDeclaration(exports, identifier.position);
    }
    parseEnumDeclaration(identifier) {
        this.expect(TokenType_1.TokenType.Identifier);
        this.next();
        this.expect(TokenType_1.TokenType.BraceOpen);
        this.next();
        const identifierList = [];
        const functionsList = [];
        while (this.peek().type !== TokenType_1.TokenType.BraceClose) {
            if (this.peek().type === TokenType_1.TokenType.Identifier) {
                const name = new IdentifierLiteral_1.IdentifierLiteral(this.peek().value, this.peek().position);
                this.next();
                if (this.peek().type === TokenType_1.TokenType.Semicolon) {
                    this.next();
                    identifierList.push({
                        name,
                    });
                    continue;
                }
                this.expect(TokenType_1.TokenType.OperatorAssign);
                this.next();
                const value = this.parsePrimary();
                identifierList.push({
                    name,
                    value,
                });
                this.expectSemicolonOrEnd();
            }
            else if (this.peek().value === TokenType_1.KeywordType.Func) {
                this.next();
                functionsList.push(this.parseFunctionDeclaration(this.peek()));
                this.expectSemicolonOrEnd();
            }
            else
                this.expect(TokenType_1.TokenType.BraceClose);
        }
        this.next();
        this.expectSemicolonOrEnd();
        return new EnumDeclaration_1.EnumDeclaration(identifier.value, identifierList, functionsList, identifier.position);
    }
    parseExpression(left) {
        left ??= this.parsePrimary();
        while (this.isOperator(this.peek().type)) {
            const operator = this.peek();
            this.next();
            const right = this.parsePrimary();
            left = new BinaryExpression_1.BinaryExpression(operator.value, left, right, operator.position);
        }
        return left;
    }
    parseUpdateExpression(identifier) {
        const operator = this.peek();
        this.next();
        this.expectSemicolonOrEnd();
        return new UpdateExpression_1.UpdateExpression(identifier, operator.value, operator.position);
    }
    parseTernaryExpression(condition) {
        this.next();
        const expressionIfTrue = this.parsePrimary();
        if (this.peek().type === TokenType_1.TokenType.QuestionMark) {
            return this.parseTernaryExpression(expressionIfTrue);
        }
        this.expect(TokenType_1.TokenType.Colon);
        this.next();
        const expressionIfFalse = this.parsePrimary();
        if (this.peek().type === TokenType_1.TokenType.QuestionMark) {
            return this.parseTernaryExpression(expressionIfFalse);
        }
        this.expectSemicolonOrEnd();
        return new TernaryExpression_1.TernaryExpression(condition, expressionIfTrue, expressionIfFalse, condition.position);
    }
    parseUnaryExpression(operator) {
        this.next();
        const right = this.parsePrimary();
        this.expectSemicolonOrEnd();
        return new VisitUnaryExpression_1.VisitUnaryExpression(operator.value, right, operator.position);
    }
    parseArguments() {
        const args = [];
        while (this.peek().type !== TokenType_1.TokenType.ParenthesisClose) {
            args.push(this.parseExpression());
            if (this.peek().type === TokenType_1.TokenType.Comma) {
                this.next();
            }
        }
        return args;
    }
    parseArgumentsAndDefault() {
        const args = [];
        while (this.peek().type !== TokenType_1.TokenType.ParenthesisClose) {
            if (this.peek().type === TokenType_1.TokenType.OperatorRest) {
                this.next();
                this.expect(TokenType_1.TokenType.Identifier);
                const param = this.peek();
                this.next();
                args.push([param.value, new NilLiteral_1.NilLiteral(param.position), true]);
                if (this.peek().type !== TokenType_1.TokenType.ParenthesisClose) {
                    this.throwError(SyntaxError_1.SyntaxCodeError.RestInvalid, this.peek());
                }
                break;
            }
            this.expect(TokenType_1.TokenType.Identifier);
            const param = this.peek();
            this.next();
            if (this.peek().type === TokenType_1.TokenType.OperatorAssign) {
                this.next();
                const defaultParameters = this.parsePrimary();
                args.push([param.value, defaultParameters]);
                if (this.peek().type === TokenType_1.TokenType.Comma) {
                    this.next();
                }
            }
            else {
                args.push([param.value, new NilLiteral_1.NilLiteral(param.position)]);
                if (this.peek().type === TokenType_1.TokenType.Comma) {
                    this.next();
                }
            }
        }
        return args;
    }
    parseMethodCall(identifier) {
        this.next();
        const method = this.peek();
        this.next();
        this.expect(TokenType_1.TokenType.ParenthesisOpen);
        this.next();
        const args = this.parseArguments();
        this.expect(TokenType_1.TokenType.ParenthesisClose);
        this.next();
        const callExpression = new CallExpression_1.CallExpression(identifier.value, method.value, new IdentifierLiteral_1.IdentifierLiteral(identifier.value, identifier.position), args, identifier.position);
        if (this.peek().type === TokenType_1.TokenType.BracketOpen ||
            this.peek().type === TokenType_1.TokenType.Period) {
            return this.parseMemberExpressions(callExpression);
        }
        else if (this.isOperator(this.peek().type)) {
            return this.parseExpression(callExpression);
        }
        else if (this.peek().type === TokenType_1.TokenType.QuestionMark) {
            return this.parseTernaryExpression(callExpression);
        }
        this.expectSemicolonOrEnd();
        return callExpression;
    }
    parseMemberExpressions(identifier) {
        const isMemberExpression = (token) => token === TokenType_1.TokenType.BracketOpen || token === TokenType_1.TokenType.Period;
        let object = identifier;
        while (isMemberExpression(this.peek().type)) {
            const tokenType = this.peek().type;
            this.next();
            let property;
            if (tokenType === TokenType_1.TokenType.BracketOpen) {
                const token = this.peek();
                property = this.parsePrimary();
                this.expect(TokenType_1.TokenType.BracketClose);
                this.next();
                if (this.peek().type === TokenType_1.TokenType.ParenthesisOpen) {
                    const methodName = new StringLiteral_1.StringLiteral(token.value, token.position);
                    this.next();
                    const args = this.parseArguments();
                    this.expect(TokenType_1.TokenType.ParenthesisClose);
                    this.next();
                    this.expectSemicolonOrEnd();
                    return new CallExpression_1.CallExpression("value" in identifier ? identifier.value : methodName.value, property, object, args, methodName.position);
                }
            }
            else if (tokenType === TokenType_1.TokenType.Period) {
                if (this.peek(1).type === TokenType_1.TokenType.ParenthesisOpen) {
                    const methodName = new StringLiteral_1.StringLiteral(this.peek().value, this.peek().position);
                    this.next();
                    this.next();
                    const args = this.parseArguments();
                    this.expect(TokenType_1.TokenType.ParenthesisClose);
                    this.next();
                    this.expectSemicolonOrEnd();
                    return new CallExpression_1.CallExpression(methodName.value, methodName.value, object, args, methodName.position);
                }
                property = new StringLiteral_1.StringLiteral(this.peek().value, this.peek().position);
                this.next();
            }
            else {
                this.throwError(SyntaxError_1.SyntaxCodeError.Unexpected, this.peek());
            }
            object = new MemberExpression_1.MemberExpression(object, property, object.position);
        }
        if (this.peek().type === TokenType_1.TokenType.OperatorAssign ||
            this.peek().type === TokenType_1.TokenType.OperatorAssignPlus ||
            this.peek().type == TokenType_1.TokenType.OperatorAssignMinus) {
            const tokenType = this.peek();
            this.next();
            const expression = this.parsePrimary();
            this.expectSemicolonOrEnd();
            return new AssignmentExpression_1.AssignmentExpression(object, tokenType.type, expression, tokenType.position);
        }
        else if (this.isOperator(this.peek().type)) {
            return this.parseExpression(object);
        }
        else if (this.peek().type === TokenType_1.TokenType.QuestionMark) {
            return this.parseTernaryExpression(object);
        }
        return object;
    }
    parseAssignmentExpression(token) {
        if (this.peek().type !== TokenType_1.TokenType.OperatorAssign &&
            this.peek().type !== TokenType_1.TokenType.OperatorAssignPlus &&
            this.peek().type !== TokenType_1.TokenType.OperatorAssignMinus) {
            throw `Unexpected assignment ${this.peek().type}`;
        }
        const tokenType = this.peek();
        this.next();
        const expression = this.parsePrimary();
        this.expectSemicolonOrEnd();
        return new AssignmentExpression_1.AssignmentExpression(token, tokenType.type, expression, tokenType.position);
    }
    parsePrimary() {
        const token = this.peek();
        switch (token.type) {
            case TokenType_1.TokenType.String: {
                const strings = new StringLiteral_1.StringLiteral(token.value, token.position);
                if (this.isOperator(this.peek(1).type)) {
                    this.next();
                    return this.parseExpression(strings);
                }
                else if (this.peek(1).type === TokenType_1.TokenType.QuestionMark) {
                    this.next();
                    return this.parseTernaryExpression(strings);
                }
                this.next();
                return strings;
            }
            case TokenType_1.TokenType.Int: {
                const ints = new IntLiteral_1.IntLiteral(token.value, token.position);
                if (this.isOperator(this.peek(1).type)) {
                    this.next();
                    return this.parseExpression(ints);
                }
                else if (this.peek(1).type === TokenType_1.TokenType.QuestionMark) {
                    this.next();
                    return this.parseTernaryExpression(ints);
                }
                this.next();
                return ints;
            }
            case TokenType_1.TokenType.Float: {
                const floats = new FloatLiteral_1.FloatLiteral(token.value, token.position);
                if (this.isOperator(this.peek(1).type)) {
                    this.next();
                    return this.parseExpression(floats);
                }
                else if (this.peek(1).type === TokenType_1.TokenType.QuestionMark) {
                    this.next();
                    return this.parseTernaryExpression(floats);
                }
                this.next();
                return floats;
            }
            case TokenType_1.TokenType.Bool: {
                const bools = new BoolLiteral_1.BoolLiteral(token.value, token.position);
                if (this.isOperator(this.peek(1).type)) {
                    this.next();
                    return this.parseExpression(bools);
                }
                else if (this.peek(1).type === TokenType_1.TokenType.QuestionMark) {
                    this.next();
                    return this.parseTernaryExpression(bools);
                }
                this.next();
                return bools;
            }
            case TokenType_1.TokenType.Nil: {
                const nils = new NilLiteral_1.NilLiteral(token.position);
                if (this.isOperator(this.peek(1).type)) {
                    this.next();
                    return this.parseExpression(nils);
                }
                else if (this.peek(1).type === TokenType_1.TokenType.QuestionMark) {
                    this.next();
                    return this.parseTernaryExpression(nils);
                }
                this.next();
                return nils;
            }
            case TokenType_1.TokenType.Identifier: {
                const identifier = new IdentifierLiteral_1.IdentifierLiteral(token.value, token.position);
                if (this.isOperator(this.peek(1).type)) {
                    this.next();
                    return this.parseExpression(identifier);
                }
                else if ([TokenType_1.OperatorType.PlusPlus, TokenType_1.OperatorType.MinusMinus].includes(this.peek(1).value)) {
                    this.next();
                    return this.parseUpdateExpression(identifier);
                }
                if (this.peek(1).type === TokenType_1.TokenType.ParenthesisOpen) {
                    return this.parseFunctionCall(token);
                }
                else if (this.peek(1).type === TokenType_1.TokenType.Period &&
                    this.peek(2).type === TokenType_1.TokenType.Identifier &&
                    this.peek(3).type === TokenType_1.TokenType.ParenthesisOpen) {
                    this.next();
                    return this.parseMethodCall(token);
                }
                else if (this.peek(1).type === TokenType_1.TokenType.BracketOpen ||
                    this.peek(1).type === TokenType_1.TokenType.Period) {
                    this.next();
                    return this.parseMemberExpressions(identifier);
                }
                else if (this.peek(1).type === TokenType_1.TokenType.OperatorAssign ||
                    this.peek(1).type === TokenType_1.TokenType.OperatorAssignPlus ||
                    this.peek(1).type === TokenType_1.TokenType.OperatorAssignMinus) {
                    this.next();
                    return this.parseAssignmentExpression(identifier);
                }
                else if (this.peek(1).type === TokenType_1.TokenType.QuestionMark) {
                    this.next();
                    return this.parseTernaryExpression(identifier);
                }
                this.next();
                return identifier;
            }
            case TokenType_1.TokenType.Keyword: {
                if (token.value === TokenType_1.KeywordType.Import) {
                    if (this.peek(1).type === TokenType_1.TokenType.BracketOpen ||
                        this.peek(1).type === TokenType_1.TokenType.Period) {
                        this.next();
                        return this.parseMemberExpressions(new IdentifierLiteral_1.IdentifierLiteral(token.value, token.position));
                    }
                    this.next();
                    const importDeclaration = this.parseImportDeclaration(this.peek(), true);
                    if (this.peek().type === TokenType_1.TokenType.BracketOpen ||
                        this.peek().type === TokenType_1.TokenType.Period) {
                        return this.parseMemberExpressions(importDeclaration);
                    }
                    else if (this.peek().type === TokenType_1.TokenType.QuestionMark) {
                        return this.parseTernaryExpression(importDeclaration);
                    }
                    return importDeclaration;
                }
                else if (token.value === TokenType_1.KeywordType.Func) {
                    if ((this.peek(1).type === TokenType_1.TokenType.Identifier &&
                        this.peek(2).type === TokenType_1.TokenType.ParenthesisOpen) ||
                        this.peek(1).type === TokenType_1.TokenType.ParenthesisOpen) {
                        this.next();
                        return this.parseFunctionExpression(token);
                    }
                }
                else if (token.value === TokenType_1.KeywordType.Match) {
                    this.next();
                    return this.parseMatchStatement(this.peek());
                }
                this.throwError(SyntaxError_1.SyntaxCodeError.Unexpected, token);
            }
            case TokenType_1.TokenType.BracketOpen: {
                return this.parseArrayExpression(token);
            }
            case TokenType_1.TokenType.BraceOpen: {
                return this.parseObjectExpression(token);
            }
            case TokenType_1.TokenType.OperatorAdd:
            case TokenType_1.TokenType.OperatorSubtract:
            case TokenType_1.TokenType.OperatorNot: {
                const unary = this.parseUnaryExpression(token);
                if (this.peek().type === TokenType_1.TokenType.QuestionMark) {
                    return this.parseTernaryExpression(unary);
                }
                return unary;
            }
            case TokenType_1.TokenType.ParenthesisOpen: {
                const identifier = this.peek(-1);
                if (identifier.type === TokenType_1.TokenType.Identifier) {
                    this.next();
                    const args = this.parseArguments();
                    this.expect(TokenType_1.TokenType.ParenthesisClose);
                    this.next();
                    return new FunctionCall_1.FunctionCall(identifier.value, args, identifier.position);
                }
                this.next();
                const expr = this.parseExpression();
                this.expect(TokenType_1.TokenType.ParenthesisClose);
                this.next();
                if (this.peek().type === TokenType_1.TokenType.QuestionMark) {
                    return this.parseTernaryExpression(expr);
                }
                else if (this.isOperator(this.peek().type)) {
                    return this.parseExpression(expr);
                }
                return expr;
            }
            default:
                this.throwError(SyntaxError_1.SyntaxCodeError.Unexpected, token);
        }
    }
    parseBlockStatement(identifier) {
        const statement = [];
        while (this.peek().type !== TokenType_1.TokenType.BraceClose) {
            statement.push(this.parseStatement());
        }
        return new BlockStatement_1.BlockStatement(statement, identifier.position);
    }
    expectSemicolonOrEnd() {
        const token = this.peek();
        if (token.type === TokenType_1.TokenType.Semicolon) {
            this.next();
        }
    }
    isOperator(tokenType) {
        return [
            TokenType_1.TokenType.OperatorAdd,
            TokenType_1.TokenType.OperatorSubtract,
            TokenType_1.TokenType.OperatorMultiply,
            TokenType_1.TokenType.OperatorDivide,
            TokenType_1.TokenType.OperatorNotEqual,
            TokenType_1.TokenType.OperatorEqual,
            TokenType_1.TokenType.OperatorModulo,
            TokenType_1.TokenType.OperatorGreaterThanOrEqual,
            TokenType_1.TokenType.OperatorLessThan,
            TokenType_1.TokenType.OperatorGreaterThan,
            TokenType_1.TokenType.OperatorLessThanOrEqual,
            TokenType_1.TokenType.OperatorAnd,
            TokenType_1.TokenType.OperatorLogicalAnd,
            TokenType_1.TokenType.OperatorOr,
            TokenType_1.TokenType.OperatorLogicalOr,
        ].includes(tokenType);
    }
    peek(offset = 0) {
        return this.tokens[this.offset + offset];
    }
    next() {
        this.offset++;
    }
    expect(tokenType) {
        const token = this.peek();
        if (token.type !== tokenType) {
            this.throwError(SyntaxError_1.SyntaxCodeError.ExpectedToken, {
                ...token,
                expectedTokenType: tokenType,
                foundTokenType: token.type,
            });
        }
        return token;
    }
    eof() {
        return this.peek() ? this.peek().type === TokenType_1.TokenType.EndOf : true;
    }
    throwError(code, format) {
        format.position ? null : (format = { position: format });
        throw new SyntaxError_1.SyntaxError(code, {
            line: format.position.line,
            column: format.position.column,
            ...format,
        });
    }
}
exports.Parser = Parser;
