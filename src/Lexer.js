const { Token } = require("./Token/Token");

class Position {
  constructor(offset, line, column) {
    this.offset = offset;
    this.line = line;
    this.column = column;
  }
}

class Lexer {
  constructor(code) {
    this.code = code;
    this.line = 0;
    this.column = 0;
    this.offset = 0;
    this.tokenList = [];
  }

  lexAnalysis() {
    while (!this.eof()) {
      const char = this.code.charAt(this.offset);
      if (/\s/.test(char)) {
        this.next();
        continue;
      }

      if (char === "/") {
        if (this.code.charAt(this.offset + 1) === "/") {
          this.skipSingleLineComment();
          continue;
        }
      }

      const position = new Position(this.offset, this.line, this.column);
      switch (true) {
        case char === '"' || char === "'": {
          const token = this.readString(char);
          this.tokenList.push(new Token("String", token, position));
          break;
        }
        case /[0-9]/.test(char): {
          const token = this.readNumber(char);
          this.tokenList.push(new Token("Number", token, position));
          break;
        }
        case /[a-z_]/i.test(char): {
          const token = this.readIdentifier(char);
          if (this.readKeyword(token)) {
            this.tokenList.push(new Token("Keyword", token, position));
            break;
          }
          if (this.readUndefined(token)) {
            this.tokenList.push(new Token("Undefined", token, position));
            break;
          }
          if (this.readBoolean(token)) {
            this.tokenList.push(new Token("Boolean", token, position));
            break;
          }
          this.tokenList.push(new Token("Identifier", token, position));
          break;
        }
        default: {
          const token = this.readKeywords(char);
          this.tokenList.push(token);
          break;
        }
      }
    }
    return this.tokenList;
  }

  readKeyword(beginChar) {
    switch (beginChar) {
      case "import":
      case "var":
      case "func":
      case "class":
      case "return":
        return true;
      default:
        return false;
    }
  }

  readKeywords(beginChar) {
    const position = new Position(this.offset, this.line, this.column);
    switch (beginChar) {
      case "+":
        this.next();
        if (this.code.charAt(this.offset) === "+") {
          this.next();
          return new Token("UnaryOperator", "++", position);
        }
        return new Token("BinaryOperator", "+", position);
      case "-":
        this.next();
        if (this.code.charAt(this.offset) === "-") {
          this.next();
          return new Token("UnaryOperator", "--", position);
        }
        return new Token("BinaryOperator", "-", position);
      case "/":
        this.next();
        return new Token("BinaryOperator", "/", position);
      case "*":
        this.next();
        return new Token("BinaryOperator", "*", position);
      case "=":
        this.next();
        if (this.code.charAt(this.offset) === "=") {
          this.next();
          return new Token("BinaryOperator", "==", position);
        }
        return new Token("BinaryOperator", "=", position);
      case "<":
        this.next();
        if (this.code.charAt(this.offset) === "=") {
          this.next();
          return new Token("BinaryOperator", "<=", position);
        }
        return new Token("BinaryOperator", "<", position);
      case ">":
        this.next();
        if (this.code.charAt(this.offset) === "=") {
          this.next();
          return new Token("BinaryOperator", ">=", position);
        }
        return new Token("BinaryOperator", ">", position);
      case "!":
        this.next();
        if (this.code.charAt(this.offset) === "=") {
          this.next();
          return new Token("BinaryOperator", "!=", position);
        }
        return new Token("UnaryOperator", "!", position);
      case "(":
        this.next();
        return new Token("Operator", "(", position);
      case ")":
        this.next();
        return new Token("Operator", ")", position);
      case ";":
        this.next();
        return new Token("Operator", ";", position);
      case ".":
        this.next();
        return new Token("Operator", ".", position);
      case ",":
        this.next();
        return new Token("Operator", ",", position);
      case "{":
        this.next();
        return new Token("Operator", "{", position);
      case "}":
        this.next();
        return new Token("Operator", "}", position);
      case ":":
        this.next();
        return new Token("Operator", ":", position);
      default:
        throw new SyntaxError(
          `Unrecognized punctuation ${beginChar} ${this.line}:${this.column}`
        );
    }
  }

  readString(beginChar) {
    this.next(); // skip first ' or "
    const buffer = this.readIf((char) => char !== beginChar);
    this.next(); // skip last ' or "
    return buffer;
  }

  readNumber(beginChar) {
    let isFloat = false;
    return this.readIf((char) => {
      if (char === ".") {
        if (isFloat) return false;
        isFloat = true;
        return true;
      }
      return /[0-9]/.test(char);
    });
  }

  readUndefined(beginChar) {
    return beginChar === "undefined";
  }

  readBoolean(beginChar) {
    return beginChar === "true" || beginChar === "false";
  }

  readIdentifier(beginChar) {
    return this.readIf((char) => /[a-z0-9_]/i.test(char));
  }

  skipSingleLineComment() {
    this.next(); // skip second '/'
    while (!this.eof() && this.code.charAt(this.offset) !== "\n") {
      this.next();
    }
    if (!this.eof()) {
      this.next(); // skip the newline character
    }
  }

  readIf(predicate) {
    const buffer = [];
    while (!this.eof()) {
      const char = this.code.charAt(this.offset);
      if (predicate(char)) {
        buffer.push(char);
        this.next();
      } else {
        break;
      }
    }
    return buffer.join("");
  }

  next() {
    const char = this.code.charAt(this.offset++);
    if (char === "\n") {
      this.line++;
      this.column = 0;
    } else {
      this.column++;
    }
    return char;
  }

  eof() {
    return this.offset >= this.code.length;
  }
}

module.exports = { Lexer };
