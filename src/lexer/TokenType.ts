enum TokenType {
  EndOf = "EndOf",
  String = "String",
  Number = "Number",
  Keyword = "Keyword",
  Identifier = "Identifier",
  OperatorAdd = "OperatorAdd",
  OperatorSubtract = "OperatorSubtract",
  OperatorMultiply = "OperatorMultiply",
  OperatorDivide = "OperatorDivide",
  OperatorModulo = "OperatorModulo",
  OperatorAssign = "OperatorAssign",
  OperatorEqual = "OperatorEqual",
  OperatorNotEqual = "OperatorNotEqual",
  OperatorGreaterThan = "OperatorGreaterThan",
  OperatorLessThan = "OperatorLessThan",
  OperatorGreaterThanOrEqual = "OperatorGreaterThanOrEqual",
  OperatorLessThanOrEqual = "OperatorLessThanOrEqual",
  OperatorLogicalAnd = "LogicalAnd",
  OperatorAnd = "OperatorAnd",
  OperatorLogicalOr = "LogicalOr",
  OperatorOr = "OperatorOr",
  OperatorNot = "OperatorNot",
  BraceOpen = "BraceOpen",
  BraceClose = "BraceClose",
  BracketOpen = "BracketOpen",
  BracketClose = "BracketClose",
  ParenthesisOpen = "ParenthesisOpen",
  ParenthesisClose = "ParenthesisClose",
  Comma = "Comma",
  Period = "Period",
  QuoteDouble = "QuoteDouble",
  QuoteSingle = "QuoteSingle",
  Semicolon = "Semicolon",
  Colon = "Colon",
}

enum TokenList {
  BraceOpen = "{",
  BraceClose = "}",
  BracketOpen = "[",
  BracketClose = "]",
  ParenthesisOpen = "(",
  ParenthesisClose = ")",
  Comma = ",",
  Period = ".",
  QuoteDouble = '"',
  QuoteSingle = "'",
  Semicolon = ";",
  Colon = ":",
}

enum OperatorType {
  Add = "+",
  Subtract = "-",
  Multiply = "*",
  Divide = "/",
  Modulo = "%",
  Assign = "=",
  Equal = "==",
  NotEqual = "!=",
  GreaterThan = ">",
  LessThan = "<",
  GreaterThanOrEqual = ">=",
  LessThanOrEqual = "<=",
  LogicalAnd = "&",
  And = "&&",
  LogicalOr = "|",
  Or = "||",
  Not = "!",
}

enum KeywordType {
  Var = "var",
  Func = "func",
  Import = "import",
  Return = "return",
  As = "as",
  Const = "const",
}

export { TokenList, TokenType, OperatorType, KeywordType };
