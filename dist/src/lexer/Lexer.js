"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lexer = void 0;
const Token_1 = require("./Token");
const Position_1 = require("./Position");
const TokenType_1 = require("./TokenType");
const SyntaxError_1 = require("../errors/SyntaxError");
class Lexer {
    offset = 0;
    line = 1;
    column = 1;
    code;
    tokenList = [];
    errors = [];
    constructor(code) {
        this.code = code;
    }
    analyze() {
        while (!this.eof()) {
            const char = this.current();
            if (/\s/.test(char)) {
                this.next();
                continue;
            }
            if (char === "/") {
                if (this.current(1) === "/") {
                    this.next();
                    this.skipSingleLineComment();
                    continue;
                }
            }
            if (char === TokenType_1.TokenList.QuoteDouble || char === TokenType_1.TokenList.QuoteSingle) {
                this.processStringLiteral(char);
                continue;
            }
            if (/[0-9]/.test(char)) {
                this.processNumberLiteral();
                continue;
            }
            if (/[a-zA-Z_]/.test(char)) {
                this.processIdentifierLiteral();
                continue;
            }
            if (this.isOperatorStart(char)) {
                this.processOperator(char);
                continue;
            }
            if (Object.values(TokenType_1.TokenList).includes(char)) {
                this.processSymbol(char);
                continue;
            }
            this.addError(SyntaxError_1.SyntaxCodeError.InvalidUnexpectedToken, {
                line: this.line,
                column: this.column,
            });
        }
        const position = new Position_1.Position(this.line, this.column);
        this.tokenList.push(new Token_1.Token("", TokenType_1.TokenType.EndOf, position));
        return { tokens: this.tokenList, errors: this.errors };
    }
    processStringLiteral(quote) {
        this.next();
        const startPosition = new Position_1.Position(this.line, this.column);
        let token = "";
        while (!this.eof()) {
            const char = this.current();
            if (char === quote) {
                if (this.current(1) === TokenType_1.TokenList.QuoteDouble ||
                    this.current(1) === TokenType_1.TokenList.QuoteSingle) {
                    this.addError(SyntaxError_1.SyntaxCodeError.MultipleConsecutiveQuotes, {
                        line: this.line,
                        column: this.column,
                    });
                    return;
                }
                this.next();
                const position = new Position_1.Position(this.line, this.column);
                this.tokenList.push(new Token_1.Token(token, TokenType_1.TokenType.String, position));
                return;
            }
            token += char;
            this.next();
        }
        this.addError(SyntaxError_1.SyntaxCodeError.UnterminatedStringLiteral, {
            line: startPosition.line,
            column: startPosition.column,
        });
    }
    processNumberLiteral() {
        let isFloat = false;
        const token = this.searchToken((char) => {
            if (char === ".") {
                if (isFloat)
                    return false;
                isFloat = true;
                return true;
            }
            return /[0-9]/.test(char);
        });
        const position = new Position_1.Position(this.line, this.column);
        this.tokenList.push(new Token_1.Token(token, isFloat ? TokenType_1.TokenType.Float : TokenType_1.TokenType.Int, position));
    }
    processIdentifierLiteral() {
        const token = this.searchToken((char) => /^[a-zA-Z0-9_]$/.test(char));
        const position = new Position_1.Position(this.line, this.column);
        if (token === "nil") {
            this.tokenList.push(new Token_1.Token(token, TokenType_1.TokenType.Nil, position));
            return;
        }
        if (token === "false" || token === "true") {
            this.tokenList.push(new Token_1.Token(token, TokenType_1.TokenType.Bool, position));
            return;
        }
        if (this.isKeyword(token)) {
            this.tokenList.push(new Token_1.Token(token, TokenType_1.TokenType.Keyword, position));
            return;
        }
        this.tokenList.push(new Token_1.Token(token, TokenType_1.TokenType.Identifier, position));
    }
    processSymbol(char) {
        const position = new Position_1.Position(this.line, this.column);
        const [tokenType] = Object.entries(TokenType_1.TokenList)
            .filter(([_, valueToken]) => valueToken === char)
            .shift();
        this.tokenList.push(new Token_1.Token(char, tokenType, position));
        this.next();
    }
    processOperator(operator) {
        const position = new Position_1.Position(this.line, this.column);
        switch (operator) {
            case TokenType_1.OperatorType.Add:
                if (this.current(1) === TokenType_1.OperatorType.Assign) {
                    this.tokenList.push(new Token_1.Token(TokenType_1.OperatorType.AssignPlus, TokenType_1.TokenType.OperatorAssignPlus, position));
                    this.next();
                }
                else if (this.current(1) === TokenType_1.OperatorType.Add) {
                    this.tokenList.push(new Token_1.Token(TokenType_1.OperatorType.PlusPlus, TokenType_1.TokenType.OperatorPlusPlus, position));
                    this.next();
                }
                else {
                    this.tokenList.push(new Token_1.Token(TokenType_1.OperatorType.Add, TokenType_1.TokenType.OperatorAdd, position));
                }
                this.next();
                break;
            case TokenType_1.OperatorType.Subtract:
                if (this.current(1) === TokenType_1.OperatorType.Assign) {
                    this.tokenList.push(new Token_1.Token(TokenType_1.OperatorType.AssignMinus, TokenType_1.TokenType.OperatorAssignMinus, position));
                    this.next();
                }
                else if (this.current(1) === TokenType_1.OperatorType.Subtract) {
                    this.tokenList.push(new Token_1.Token(TokenType_1.OperatorType.MinusMinus, TokenType_1.TokenType.OperatorMinusMinus, position));
                    this.next();
                }
                else {
                    this.tokenList.push(new Token_1.Token(TokenType_1.OperatorType.Subtract, TokenType_1.TokenType.OperatorSubtract, position));
                }
                this.next();
                break;
            case TokenType_1.OperatorType.Multiply:
                this.tokenList.push(new Token_1.Token(TokenType_1.OperatorType.Multiply, TokenType_1.TokenType.OperatorMultiply, position));
                this.next();
                break;
            case TokenType_1.OperatorType.Divide:
                this.tokenList.push(new Token_1.Token(TokenType_1.OperatorType.Divide, TokenType_1.TokenType.OperatorDivide, position));
                this.next();
                break;
            case TokenType_1.OperatorType.Modulo:
                this.tokenList.push(new Token_1.Token(TokenType_1.OperatorType.Modulo, TokenType_1.TokenType.OperatorModulo, position));
                this.next();
                break;
            case TokenType_1.OperatorType.Assign:
                if (TokenType_1.OperatorType.Assign === this.current(1)) {
                    this.tokenList.push(new Token_1.Token(TokenType_1.OperatorType.Equal, TokenType_1.TokenType.OperatorEqual, position));
                    this.next();
                }
                else {
                    this.tokenList.push(new Token_1.Token(TokenType_1.OperatorType.Assign, TokenType_1.TokenType.OperatorAssign, position));
                }
                this.next();
                break;
            case TokenType_1.OperatorType.Not:
                if (TokenType_1.OperatorType.Assign === this.current(1)) {
                    this.tokenList.push(new Token_1.Token(TokenType_1.OperatorType.NotEqual, TokenType_1.TokenType.OperatorNotEqual, position));
                    this.next();
                }
                else {
                    this.tokenList.push(new Token_1.Token(TokenType_1.OperatorType.Not, TokenType_1.TokenType.OperatorNot, position));
                }
                this.next();
                break;
            case TokenType_1.OperatorType.GreaterThan:
                if (TokenType_1.OperatorType.Assign === this.current(1)) {
                    this.tokenList.push(new Token_1.Token(TokenType_1.OperatorType.GreaterThanOrEqual, TokenType_1.TokenType.OperatorGreaterThanOrEqual, position));
                    this.next();
                }
                else {
                    this.tokenList.push(new Token_1.Token(TokenType_1.OperatorType.GreaterThan, TokenType_1.TokenType.OperatorGreaterThan, position));
                }
                this.next();
                break;
            case TokenType_1.OperatorType.LessThan:
                if (TokenType_1.OperatorType.Assign === this.current(1)) {
                    this.tokenList.push(new Token_1.Token(TokenType_1.OperatorType.LessThanOrEqual, TokenType_1.TokenType.OperatorLessThanOrEqual, position));
                    this.next();
                }
                else {
                    this.tokenList.push(new Token_1.Token(TokenType_1.OperatorType.LessThan, TokenType_1.TokenType.OperatorLessThan, position));
                }
                this.next();
                break;
            case TokenType_1.OperatorType.LogicalAnd:
                if (TokenType_1.OperatorType.LogicalAnd === this.current(1)) {
                    this.tokenList.push(new Token_1.Token(TokenType_1.OperatorType.And, TokenType_1.TokenType.OperatorAnd, position));
                    this.next();
                }
                else {
                    this.tokenList.push(new Token_1.Token(TokenType_1.OperatorType.LogicalAnd, TokenType_1.TokenType.OperatorLogicalAnd, position));
                }
                this.next();
                break;
            case TokenType_1.OperatorType.QuestionMark: {
                this.tokenList.push(new Token_1.Token(TokenType_1.OperatorType.QuestionMark, TokenType_1.TokenType.QuestionMark, position));
                this.next();
                break;
            }
            case TokenType_1.OperatorType.LogicalOr:
                if (TokenType_1.OperatorType.LogicalOr === this.current(1)) {
                    this.tokenList.push(new Token_1.Token(TokenType_1.OperatorType.Or, TokenType_1.TokenType.OperatorOr, position));
                    this.next();
                }
                else {
                    this.tokenList.push(new Token_1.Token(TokenType_1.OperatorType.LogicalOr, TokenType_1.TokenType.OperatorLogicalOr, position));
                }
                this.next();
                break;
            default:
                this.addError(SyntaxError_1.SyntaxCodeError.UnexpectedOperator, {
                    operator,
                    line: this.line,
                    column: this.column,
                });
        }
    }
    addError(code, format) {
        this.errors.push(new SyntaxError_1.SyntaxError(code, format));
        this.next();
    }
    isKeyword(char) {
        return Object.values(TokenType_1.KeywordType).includes(char);
    }
    isOperatorStart(char) {
        return Object.values(TokenType_1.OperatorType).some((op) => op.startsWith(char));
    }
    searchToken(predicate) {
        let buffer = "";
        while (!this.eof()) {
            const char = this.current();
            if (!predicate(char))
                break;
            buffer += char;
            this.next();
        }
        return buffer;
    }
    skipSingleLineComment() {
        while (!this.eof()) {
            const char = this.current();
            if (char === "\n")
                break;
            this.next();
        }
    }
    current(offset = 0) {
        return this.code[this.offset + offset];
    }
    next() {
        const char = this.code[this.offset];
        if (char === "\n") {
            this.line++;
            this.column = 0;
        }
        else {
            this.column++;
        }
        this.offset++;
    }
    eof() {
        return this.offset >= this.code.length;
    }
}
exports.Lexer = Lexer;
