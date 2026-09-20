import { FunctionBuilder, FunctionBuilderCodeError } from "../FunctionBuilder";
import { Environment } from "../../src/Environment";
import { type StmtType } from "../../src/ast/StmtType";
import { isTypeArgs } from "../utils/utils";
import path from "node:path";

abstract class PathMethodBuilder extends FunctionBuilder {
  constructor(args: any[], astArgs: StmtType[], environment: Environment) {
    super(args, astArgs, environment);
  }

  get pkgInfo() {
    return {
      name: "path",
      path: __dirname,
    };
  }

  protected validateString(str: any, argName?: string): void {
    if (argName && isTypeArgs(str) !== "string") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "string",
        received: isTypeArgs(str),
      });
    } else if (isTypeArgs(str) !== "string") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsFirstTypeError, {
        expectType: "string",
        received: isTypeArgs(str),
      });
    }
  }

  call() {
    throw new Error("Call is not implemented");
  }
}

class Join extends PathMethodBuilder {
  override call() {
    const paths = this.args;

    paths.forEach((p: any, index: number) => {
      this.validateString(p, `path${index + 1}`);
    });

    return path.join(...paths);
  }
}

class Resolve extends PathMethodBuilder {
  override call() {
    const paths = this.args;

    paths.forEach((p: any, index: number) => {
      this.validateString(p, `path${index + 1}`);
    });

    return path.resolve(...paths);
  }
}

class Dirname extends PathMethodBuilder {
  override call() {
    const [pathStr] = this.args;
    this.validateString(pathStr);

    return path.dirname(pathStr);
  }
}

class Basename extends PathMethodBuilder {
  override call() {
    const [pathStr, ext] = this.args;
    this.validateString(pathStr);
    if (ext !== undefined) this.validateString(ext, "ext");

    return path.basename(pathStr, ext);
  }
}

class Extname extends PathMethodBuilder {
  override call() {
    const [pathStr] = this.args;
    this.validateString(pathStr);

    return path.extname(pathStr);
  }
}

class Parse extends PathMethodBuilder {
  override call() {
    const [pathStr] = this.args;
    this.validateString(pathStr);

    return path.parse(pathStr);
  }
}

class Format extends PathMethodBuilder {
  override call() {
    const [pathObject] = this.args;

    if (!pathObject || typeof pathObject !== "object") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: "pathObject",
        expectType: "object",
        received: isTypeArgs(pathObject),
      });
    }

    return path.format(pathObject);
  }
}

class Normalize extends PathMethodBuilder {
  override call() {
    const [pathStr] = this.args;
    this.validateString(pathStr);

    return path.normalize(pathStr);
  }
}

class IsAbsolute extends PathMethodBuilder {
  override call() {
    const [pathStr] = this.args;
    this.validateString(pathStr);

    return path.isAbsolute(pathStr);
  }
}

class Relative extends PathMethodBuilder {
  override call() {
    const [from, to] = this.args;
    this.validateString(from, "from");
    this.validateString(to, "to");

    return path.relative(from, to);
  }
}

class ToNamespacedPath extends PathMethodBuilder {
  override call() {
    const [pathStr] = this.args;
    this.validateString(pathStr);

    return path.toNamespacedPath(pathStr);
  }
}

class Sep extends PathMethodBuilder {
  override call() {
    return path.sep;
  }
}

class Delimiter extends PathMethodBuilder {
  override call() {
    return path.delimiter;
  }
}

class Win32Join extends PathMethodBuilder {
  override call() {
    const paths = this.args;
    paths.forEach((p: any, index: number) => {
      this.validateString(p, `path${index + 1}`);
    });
    return path.win32.join(...paths);
  }
}

class Win32Resolve extends PathMethodBuilder {
  override call() {
    const paths = this.args;
    paths.forEach((p: any, index: number) => {
      this.validateString(p, `path${index + 1}`);
    });
    return path.win32.resolve(...paths);
  }
}

class Win32Dirname extends PathMethodBuilder {
  override call() {
    const [pathStr] = this.args;
    this.validateString(pathStr);
    return path.win32.dirname(pathStr);
  }
}

class Win32Basename extends PathMethodBuilder {
  override call() {
    const [pathStr, ext] = this.args;
    this.validateString(pathStr);
    if (ext !== undefined) this.validateString(ext, "ext");
    return path.win32.basename(pathStr, ext);
  }
}

class Win32Extname extends PathMethodBuilder {
  override call() {
    const [pathStr] = this.args;
    this.validateString(pathStr);
    return path.win32.extname(pathStr);
  }
}

class Win32Parse extends PathMethodBuilder {
  override call() {
    const [pathStr] = this.args;
    this.validateString(pathStr);
    return path.win32.parse(pathStr);
  }
}

class Win32Format extends PathMethodBuilder {
  override call() {
    const [pathObject] = this.args;
    if (!pathObject || typeof pathObject !== "object") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: "pathObject",
        expectType: "object",
        received: isTypeArgs(pathObject),
      });
    }
    return path.win32.format(pathObject);
  }
}

class Win32Normalize extends PathMethodBuilder {
  override call() {
    const [pathStr] = this.args;
    this.validateString(pathStr);
    return path.win32.normalize(pathStr);
  }
}

class Win32IsAbsolute extends PathMethodBuilder {
  override call() {
    const [pathStr] = this.args;
    this.validateString(pathStr);
    return path.win32.isAbsolute(pathStr);
  }
}

class Win32Relative extends PathMethodBuilder {
  override call() {
    const [from, to] = this.args;
    this.validateString(from, "from");
    this.validateString(to, "to");
    return path.win32.relative(from, to);
  }
}

class Win32ToNamespacedPath extends PathMethodBuilder {
  override call() {
    const [pathStr] = this.args;
    this.validateString(pathStr);
    return path.win32.toNamespacedPath(pathStr);
  }
}

class PosixJoin extends PathMethodBuilder {
  override call() {
    const paths = this.args;
    paths.forEach((p: any, index: number) => {
      this.validateString(p, `path${index + 1}`);
    });
    return path.posix.join(...paths);
  }
}

class PosixResolve extends PathMethodBuilder {
  override call() {
    const paths = this.args;
    paths.forEach((p: any, index: number) => {
      this.validateString(p, `path${index + 1}`);
    });
    return path.posix.resolve(...paths);
  }
}

class PosixDirname extends PathMethodBuilder {
  override call() {
    const [pathStr] = this.args;
    this.validateString(pathStr);
    return path.posix.dirname(pathStr);
  }
}

class PosixBasename extends PathMethodBuilder {
  override call() {
    const [pathStr, ext] = this.args;
    this.validateString(pathStr);
    if (ext !== undefined) this.validateString(ext, "ext");
    return path.posix.basename(pathStr, ext);
  }
}

class PosixExtname extends PathMethodBuilder {
  override call() {
    const [pathStr] = this.args;
    this.validateString(pathStr);
    return path.posix.extname(pathStr);
  }
}

class PosixParse extends PathMethodBuilder {
  override call() {
    const [pathStr] = this.args;
    this.validateString(pathStr);
    return path.posix.parse(pathStr);
  }
}

class PosixFormat extends PathMethodBuilder {
  override call() {
    const [pathObject] = this.args;
    if (!pathObject || typeof pathObject !== "object") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: "pathObject",
        expectType: "object",
        received: isTypeArgs(pathObject),
      });
    }
    return path.posix.format(pathObject);
  }
}

class PosixNormalize extends PathMethodBuilder {
  override call() {
    const [pathStr] = this.args;
    this.validateString(pathStr);
    return path.posix.normalize(pathStr);
  }
}

class PosixIsAbsolute extends PathMethodBuilder {
  override call() {
    const [pathStr] = this.args;
    this.validateString(pathStr);
    return path.posix.isAbsolute(pathStr);
  }
}

class PosixRelative extends PathMethodBuilder {
  override call() {
    const [from, to] = this.args;
    this.validateString(from, "from");
    this.validateString(to, "to");
    return path.posix.relative(from, to);
  }
}

class PosixToNamespacedPath extends PathMethodBuilder {
  override call() {
    const [pathStr] = this.args;
    this.validateString(pathStr);
    return path.posix.toNamespacedPath(pathStr);
  }
}

const Win32 = {
  sep: path.win32.sep,
  delimiter: path.win32.delimiter,
  join: Win32Join,
  resolve: Win32Resolve,
  dirname: Win32Dirname,
  basename: Win32Basename,
  extname: Win32Extname,
  parse: Win32Parse,
  format: Win32Format,
  normalize: Win32Normalize,
  isAbsolute: Win32IsAbsolute,
  relative: Win32Relative,
  toNamespacedPath: Win32ToNamespacedPath,
};

const Posix = {
  sep: path.posix.sep,
  delimiter: path.posix.delimiter,
  join: PosixJoin,
  resolve: PosixResolve,
  dirname: PosixDirname,
  basename: PosixBasename,
  extname: PosixExtname,
  parse: PosixParse,
  format: PosixFormat,
  normalize: PosixNormalize,
  isAbsolute: PosixIsAbsolute,
  relative: PosixRelative,
  toNamespacedPath: PosixToNamespacedPath,
};

module.exports = {
  join: Join,
  resolve: Resolve,
  dirname: Dirname,
  basename: Basename,
  extname: Extname,
  parse: Parse,
  format: Format,
  normalize: Normalize,
  isAbsolute: IsAbsolute,
  relative: Relative,
  toNamespacedPath: ToNamespacedPath,
  sep: Sep,
  delimiter: Delimiter,
  win32: Win32,
  posix: Posix,
};
