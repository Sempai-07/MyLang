const path = require("node:path");

class ImportDeclaration {
  avaliableLib = ["coreio"];
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

  parseModule(module, body) {
    const libs = [];
    for (const index in module) {
      const lib = module[index];
      if (typeof lib === "string") {
        libs.push({ type: "systemPrefix", libName: lib });
        continue;
      }

      libs.push({
        type: "customPrefix",
        prefix: lib.variable,
        libName: lib.lib,
      });
    }
    return libs;
  }

  evaluate(node, body) {
    const [params] = node.children.map((arg) => body.visit(arg));
    for (const lib of this.parseModule(params, body)) {
      if (!this.avaliableLib.includes(lib.libName)) {
        throw new Error(`Cannot find module "${lib.libName}"`);
      }
      const { libName, content } = this.loadBuiltInModule(lib);
      body.globalScope[libName] = content;
    }
  }
}

module.exports = { ImportDeclaration };
