"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeywordType = exports.OperatorType = exports.TokenType = exports.TokenList = void 0;
var TokenType;
(function (TokenType) {
    TokenType["EndOf"] = "EndOf";
    TokenType["String"] = "String";
    TokenType["Int"] = "Int";
    TokenType["Float"] = "Float";
    TokenType["Bool"] = "Bool";
    TokenType["Nil"] = "Nil";
    TokenType["Keyword"] = "Keyword";
    TokenType["Identifier"] = "Identifier";
    TokenType["OperatorAdd"] = "OperatorAdd";
    TokenType["OperatorPlusPlus"] = "OperatorPlusPlus";
    TokenType["OperatorSubtract"] = "OperatorSubtract";
    TokenType["OperatorMinusMinus"] = "OperatorMinusMinus";
    TokenType["OperatorMultiply"] = "OperatorMultiply";
    TokenType["OperatorDivide"] = "OperatorDivide";
    TokenType["OperatorModulo"] = "OperatorModulo";
    TokenType["OperatorAssign"] = "OperatorAssign";
    TokenType["OperatorAssignMinus"] = "OperatorAssignMinus";
    TokenType["OperatorAssignPlus"] = "OperatorAssignPlus";
    TokenType["OperatorEqual"] = "OperatorEqual";
    TokenType["OperatorNotEqual"] = "OperatorNotEqual";
    TokenType["OperatorGreaterThan"] = "OperatorGreaterThan";
    TokenType["OperatorLessThan"] = "OperatorLessThan";
    TokenType["OperatorGreaterThanOrEqual"] = "OperatorGreaterThanOrEqual";
    TokenType["OperatorLessThanOrEqual"] = "OperatorLessThanOrEqual";
    TokenType["OperatorLogicalAnd"] = "LogicalAnd";
    TokenType["OperatorAnd"] = "OperatorAnd";
    TokenType["OperatorLogicalOr"] = "LogicalOr";
    TokenType["OperatorOr"] = "OperatorOr";
    TokenType["QuestionMark"] = "QuestionMark";
    TokenType["OperatorNot"] = "OperatorNot";
    TokenType["BraceOpen"] = "BraceOpen";
    TokenType["BraceClose"] = "BraceClose";
    TokenType["BracketOpen"] = "BracketOpen";
    TokenType["BracketClose"] = "BracketClose";
    TokenType["ParenthesisOpen"] = "ParenthesisOpen";
    TokenType["ParenthesisClose"] = "ParenthesisClose";
    TokenType["Comma"] = "Comma";
    TokenType["Period"] = "Period";
    TokenType["QuoteDouble"] = "QuoteDouble";
    TokenType["QuoteSingle"] = "QuoteSingle";
    TokenType["Semicolon"] = "Semicolon";
    TokenType["Colon"] = "Colon";
})(TokenType || (exports.TokenType = TokenType = {}));
var TokenList;
(function (TokenList) {
    TokenList["BraceOpen"] = "{";
    TokenList["BraceClose"] = "}";
    TokenList["BracketOpen"] = "[";
    TokenList["BracketClose"] = "]";
    TokenList["ParenthesisOpen"] = "(";
    TokenList["ParenthesisClose"] = ")";
    TokenList["Comma"] = ",";
    TokenList["Period"] = ".";
    TokenList["QuoteDouble"] = "\"";
    TokenList["QuoteSingle"] = "'";
    TokenList["Semicolon"] = ";";
    TokenList["Colon"] = ":";
})(TokenList || (exports.TokenList = TokenList = {}));
var OperatorType;
(function (OperatorType) {
    OperatorType["Add"] = "+";
    OperatorType["PlusPlus"] = "++";
    OperatorType["Subtract"] = "-";
    OperatorType["MinusMinus"] = "--";
    OperatorType["Multiply"] = "*";
    OperatorType["Divide"] = "/";
    OperatorType["Modulo"] = "%";
    OperatorType["Assign"] = "=";
    OperatorType["AssignMinus"] = "-=";
    OperatorType["AssignPlus"] = "+=";
    OperatorType["Equal"] = "==";
    OperatorType["NotEqual"] = "!=";
    OperatorType["GreaterThan"] = ">";
    OperatorType["LessThan"] = "<";
    OperatorType["GreaterThanOrEqual"] = ">=";
    OperatorType["LessThanOrEqual"] = "<=";
    OperatorType["LogicalAnd"] = "&";
    OperatorType["And"] = "&&";
    OperatorType["LogicalOr"] = "|";
    OperatorType["QuestionMark"] = "?";
    OperatorType["Or"] = "||";
    OperatorType["Not"] = "!";
})(OperatorType || (exports.OperatorType = OperatorType = {}));
var KeywordType;
(function (KeywordType) {
    KeywordType["Var"] = "var";
    KeywordType["As"] = "as";
    KeywordType["Const"] = "const";
    KeywordType["Readonly"] = "readonly";
    KeywordType["Func"] = "func";
    KeywordType["Return"] = "return";
    KeywordType["Import"] = "import";
    KeywordType["Export"] = "export";
    KeywordType["If"] = "if";
    KeywordType["Else"] = "else";
    KeywordType["For"] = "for";
    KeywordType["While"] = "while";
    KeywordType["Break"] = "break";
    KeywordType["Continue"] = "continue";
    KeywordType["Try"] = "try";
    KeywordType["Catch"] = "catch";
    KeywordType["Finally"] = "finally";
    KeywordType["Await"] = "await";
    KeywordType["Async"] = "async";
    KeywordType["Enum"] = "enum";
    KeywordType["Throw"] = "throw";
    KeywordType["Match"] = "match";
    KeywordType["Case"] = "case";
    KeywordType["Default"] = "default";
    KeywordType["Defer"] = "defer";
})(KeywordType || (exports.KeywordType = KeywordType = {}));
