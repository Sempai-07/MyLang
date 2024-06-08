const { Token } = require("./Token");

const TokenList = {
  Var: new Token("var"),
  Func: new Token("func"),
  Import: new Token("import"),
  Lparen: new Token("("),
  Lbrack: new Token("{"),
  Period: new Token("."),
  Praren: new Token(")"),
  Rbracke: new Token("}"),
  Assign: new Token("="),
};

module.exports = { TokenList };
