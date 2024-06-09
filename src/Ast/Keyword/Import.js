const fs = require("node:fs");
const path = require("node:path");
const { Lexer } = require("../../Lexer");
const { Parser } = require("../../Parser");

class ImportDeclaration {
  availableLibs = ["coreio"];
  dirModule = path.join(__dirname, "../../../library/");

  constructor(children) {
    this.name = "ImportDeclaration";
    this.children = children;
  }

  loadBuiltInModule(module) {
    return {
      libName: module.type === "customPrefix" ? module.prefix : module.libName,
      content: require(path.join(this.dirModule, module.libName, "index.js")),
    };
  }

  parseModule(modules) {
    return modules.map((lib) => {
      return typeof lib === "string"
        ? { type: "systemPrefix", libName: lib }
        : { type: "customPrefix", prefix: lib.variable, libName: lib.lib };
    });
  }

  loadModule(body, lib) {
    const { dir, base } = path.parse(lib.libName);
    const resolvePath = path.join(
      process.cwd(),
      path.parse(body.main).dir,
      dir,
      base,
    );
    const content = fs.readFileSync(resolvePath, "utf-8");

    if (lib.libName.endsWith(".json")) {
      body.globalScope[lib.prefix] = JSON.parse(content);
    } else {
      const lexer = new Lexer(content);
      const analysis = lexer.lexAnalysis();
      const parser = new Parser(analysis);

      const previousScope = body.globalScope;
      body.visit(parser.parse());
      body.globalScope = previousScope;
      body.globalScope[lib.prefix] = body.exports;
      body.exports = {};
    }
  }

  evaluate(node, body) {
    const [params] = node.children.map((arg) => body.visit(arg));
    for (const lib of this.parseModule(params)) {
      if (!this.availableLibs.includes(lib.libName)) {
        const baseName = path.parse(lib.libName).base;
        if (body.globalExports.some((path) => path.includes(baseName))) {
          this.loadModule(body, lib);
        } else {
          throw new Error(`Cannot find module "${lib.libName}"`);
        }
        continue;
      }
      const { libName, content } = this.loadBuiltInModule(lib);
      body.globalScope[libName] = content;
    }
  }
}

module.exports = { ImportDeclaration };
