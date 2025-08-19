import { FunctionBuilder, FunctionBuilderCodeError } from "../../FunctionBuilder";
import { Environment } from "../../../src/Environment";
import { type StmtType } from "../../../src/ast/StmtType";
// @ts-ignore
import { randint } from "../../random/index";
import { isTypeArgs } from "../utils";

const COLORS = {
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
  grey: "\x1b[90m",

  brightRed: "\x1b[91m",
  brightGreen: "\x1b[92m",
  brightYellow: "\x1b[93m",
  brightBlue: "\x1b[94m",
  brightMagenta: "\x1b[95m",
  brightCyan: "\x1b[96m",
  brightWhite: "\x1b[97m",

  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m",

  bgBrightRed: "\x1b[101m",
  bgBrightGreen: "\x1b[102m",
  bgBrightYellow: "\x1b[103m",
  bgBrightBlue: "\x1b[104m",
  bgBrightMagenta: "\x1b[105m",
  bgBrightCyan: "\x1b[106m",
  bgBrightWhite: "\x1b[107m",
};

const STYLES = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  italic: "\x1b[3m",
  underline: "\x1b[4m",
  blink: "\x1b[5m",
  reverse: "\x1b[7m",
  strikethrough: "\x1b[9m",
};

abstract class ColorMethodBuilder extends FunctionBuilder {
  constructor(args: any[], astArgs: StmtType[], environment: Environment) {
    super(args, astArgs, environment);
  }

  get pkgInfo() {
    return {
      name: "utils/colors",
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

  protected validateNumber(num: any, argName?: string): void {
    if (argName && isTypeArgs(num) !== "int") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "int",
        received: isTypeArgs(num),
      });
    } else if (isTypeArgs(num) !== "int") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsFirstTypeError, {
        expectType: "int",
        received: isTypeArgs(num),
      });
    }
  }

  protected validateHexColor(hex: string): boolean {
    return /^#([A-Fa-f0-9]{3}){1,2}$/.test(hex);
  }

  protected validateRgbValues(r: number, g: number, b: number): boolean {
    return [r, g, b].every((val) => val >= 0 && val <= 255 && Number.isInteger(val));
  }

  protected validateHslValues(h: number, s: number, l: number): boolean {
    return h >= 0 && h <= 360 && s >= 0 && s <= 100 && l >= 0 && l <= 100;
  }

  call() {
    throw new Error("Call is not implemented");
  }
}

class Red extends ColorMethodBuilder {
  override call() {
    const [text] = this.args;
    this.validateString(text);
    return `${COLORS.red}${text}${STYLES.reset}`;
  }
}

class Green extends ColorMethodBuilder {
  override call() {
    const [text] = this.args;
    this.validateString(text);
    return `${COLORS.green}${text}${STYLES.reset}`;
  }
}

class Blue extends ColorMethodBuilder {
  override call() {
    const [text] = this.args;
    this.validateString(text);
    return `${COLORS.blue}${text}${STYLES.reset}`;
  }
}

class Yellow extends ColorMethodBuilder {
  override call() {
    const [text] = this.args;
    this.validateString(text);
    return `${COLORS.yellow}${text}${STYLES.reset}`;
  }
}

class Magenta extends ColorMethodBuilder {
  override call() {
    const [text] = this.args;
    this.validateString(text);
    return `${COLORS.magenta}${text}${STYLES.reset}`;
  }
}

class Cyan extends ColorMethodBuilder {
  override call() {
    const [text] = this.args;
    this.validateString(text);
    return `${COLORS.cyan}${text}${STYLES.reset}`;
  }
}

class White extends ColorMethodBuilder {
  override call() {
    const [text] = this.args;
    this.validateString(text);
    return `${COLORS.white}${text}${STYLES.reset}`;
  }
}

class Black extends ColorMethodBuilder {
  override call() {
    const [text] = this.args;
    this.validateString(text);
    return `${COLORS.black}${text}${STYLES.reset}`;
  }
}

class Gray extends ColorMethodBuilder {
  override call() {
    const [text] = this.args;
    this.validateString(text);
    return `${COLORS.gray}${text}${STYLES.reset}`;
  }
}

class Grey extends ColorMethodBuilder {
  override call() {
    const [text] = this.args;
    this.validateString(text);
    return `${COLORS.grey}${text}${STYLES.reset}`;
  }
}

class BrightRed extends ColorMethodBuilder {
  override call() {
    const [text] = this.args;
    this.validateString(text);
    return `${COLORS.brightRed}${text}${STYLES.reset}`;
  }
}

class BrightGreen extends ColorMethodBuilder {
  override call() {
    const [text] = this.args;
    this.validateString(text);
    return `${COLORS.brightGreen}${text}${STYLES.reset}`;
  }
}

class BrightBlue extends ColorMethodBuilder {
  override call() {
    const [text] = this.args;
    this.validateString(text);
    return `${COLORS.brightBlue}${text}${STYLES.reset}`;
  }
}

class BrightYellow extends ColorMethodBuilder {
  override call() {
    const [text] = this.args;
    this.validateString(text);
    return `${COLORS.brightYellow}${text}${STYLES.reset}`;
  }
}

class BrightMagenta extends ColorMethodBuilder {
  override call() {
    const [text] = this.args;
    this.validateString(text);
    return `${COLORS.brightMagenta}${text}${STYLES.reset}`;
  }
}

class BrightCyan extends ColorMethodBuilder {
  override call() {
    const [text] = this.args;
    this.validateString(text);
    return `${COLORS.brightCyan}${text}${STYLES.reset}`;
  }
}

class BrightWhite extends ColorMethodBuilder {
  override call() {
    const [text] = this.args;
    this.validateString(text);
    return `${COLORS.brightWhite}${text}${STYLES.reset}`;
  }
}

class BgRed extends ColorMethodBuilder {
  override call() {
    const [text] = this.args;
    this.validateString(text);
    return `${COLORS.bgRed}${text}${STYLES.reset}`;
  }
}

class BgGreen extends ColorMethodBuilder {
  override call() {
    const [text] = this.args;
    this.validateString(text);
    return `${COLORS.bgGreen}${text}${STYLES.reset}`;
  }
}

class BgBlue extends ColorMethodBuilder {
  override call() {
    const [text] = this.args;
    this.validateString(text);
    return `${COLORS.bgBlue}${text}${STYLES.reset}`;
  }
}

class BgYellow extends ColorMethodBuilder {
  override call() {
    const [text] = this.args;
    this.validateString(text);
    return `${COLORS.bgYellow}${text}${STYLES.reset}`;
  }
}

class BgMagenta extends ColorMethodBuilder {
  override call() {
    const [text] = this.args;
    this.validateString(text);
    return `${COLORS.bgMagenta}${text}${STYLES.reset}`;
  }
}

class BgCyan extends ColorMethodBuilder {
  override call() {
    const [text] = this.args;
    this.validateString(text);
    return `${COLORS.bgCyan}${text}${STYLES.reset}`;
  }
}

class BgWhite extends ColorMethodBuilder {
  override call() {
    const [text] = this.args;
    this.validateString(text);
    return `${COLORS.bgWhite}${text}${STYLES.reset}`;
  }
}

class BgBlack extends ColorMethodBuilder {
  override call() {
    const [text] = this.args;
    this.validateString(text);
    return `${COLORS.bgBlack}${text}${STYLES.reset}`;
  }
}

class Bold extends ColorMethodBuilder {
  override call() {
    const [text] = this.args;
    this.validateString(text);
    return `${STYLES.bold}${text}${STYLES.reset}`;
  }
}

class Dim extends ColorMethodBuilder {
  override call() {
    const [text] = this.args;
    this.validateString(text);
    return `${STYLES.dim}${text}${STYLES.reset}`;
  }
}

class Italic extends ColorMethodBuilder {
  override call() {
    const [text] = this.args;
    this.validateString(text);
    return `${STYLES.italic}${text}${STYLES.reset}`;
  }
}

class Underline extends ColorMethodBuilder {
  override call() {
    const [text] = this.args;
    this.validateString(text);
    return `${STYLES.underline}${text}${STYLES.reset}`;
  }
}

class Strikethrough extends ColorMethodBuilder {
  override call() {
    const [text] = this.args;
    this.validateString(text);
    return `${STYLES.strikethrough}${text}${STYLES.reset}`;
  }
}

class Reverse extends ColorMethodBuilder {
  override call() {
    const [text] = this.args;
    this.validateString(text);
    return `${STYLES.reverse}${text}${STYLES.reset}`;
  }
}

class Rgb extends ColorMethodBuilder {
  override call() {
    const [text, r, g, b] = this.args;
    this.validateString(text);
    this.validateNumber(r, "red");
    this.validateNumber(g, "green");
    this.validateNumber(b, "blue");

    if (!this.validateRgbValues(r, g, b)) {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: "rgb values",
        expectType: "integers between 0-255",
        received: `r:${r}, g:${g}, b:${b}`,
      });
    }

    return `\x1b[38;2;${r};${g};${b}m${text}${STYLES.reset}`;
  }
}

class BgRgb extends ColorMethodBuilder {
  override call() {
    const [text, r, g, b] = this.args;
    this.validateString(text);
    this.validateNumber(r, "red");
    this.validateNumber(g, "green");
    this.validateNumber(b, "blue");

    if (!this.validateRgbValues(r, g, b)) {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: "rgb values",
        expectType: "integers between 0-255",
        received: `r:${r}, g:${g}, b:${b}`,
      });
    }

    return `\x1b[48;2;${r};${g};${b}m${text}${STYLES.reset}`;
  }
}

class Hex extends ColorMethodBuilder {
  override call() {
    const [text, hexColor] = this.args;
    this.validateString(text);
    this.validateString(hexColor, "hexColor");

    if (!this.validateHexColor(hexColor)) {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: "hexColor",
        expectType: "valid hex color (#RGB or #RRGGBB)",
        received: hexColor,
      });
    }

    const hex = hexColor.replace("#", "");
    let r: number, g: number, b: number;

    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else {
      r = parseInt(hex.substr(0, 2), 16);
      g = parseInt(hex.substr(2, 2), 16);
      b = parseInt(hex.substr(4, 2), 16);
    }

    return `\x1b[38;2;${r};${g};${b}m${text}${STYLES.reset}`;
  }
}

class BgHex extends ColorMethodBuilder {
  override call() {
    const [text, hexColor] = this.args;
    this.validateString(text);
    this.validateString(hexColor, "hexColor");

    if (!this.validateHexColor(hexColor)) {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: "hexColor",
        expectType: "valid hex color (#RGB or #RRGGBB)",
        received: hexColor,
      });
    }

    const hex = hexColor.replace("#", "");
    let r: number, g: number, b: number;

    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else {
      r = parseInt(hex.substr(0, 2), 16);
      g = parseInt(hex.substr(2, 2), 16);
      b = parseInt(hex.substr(4, 2), 16);
    }

    return `\x1b[48;2;${r};${g};${b}m${text}${STYLES.reset}`;
  }
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  s /= 100;
  l /= 100;

  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

class Hsl extends ColorMethodBuilder {
  override call() {
    const [text, h, s, l] = this.args;
    this.validateString(text);
    this.validateNumber(h, "hue");
    this.validateNumber(s, "saturation");
    this.validateNumber(l, "lightness");

    if (!this.validateHslValues(h, s, l)) {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: "hsl values",
        expectType: "h: 0-360, s: 0-100, l: 0-100",
        received: `h:${h}, s:${s}, l:${l}`,
      });
    }

    const [r, g, b] = hslToRgb(h, s, l);
    return `\x1b[38;2;${r};${g};${b}m${text}${STYLES.reset}`;
  }
}

class BgHsl extends ColorMethodBuilder {
  override call() {
    const [text, h, s, l] = this.args;
    this.validateString(text);
    this.validateNumber(h, "hue");
    this.validateNumber(s, "saturation");
    this.validateNumber(l, "lightness");

    if (!this.validateHslValues(h, s, l)) {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: "hsl values",
        expectType: "h: 0-360, s: 0-100, l: 0-100",
        received: `h:${h}, s:${s}, l:${l}`,
      });
    }

    const [r, g, b] = hslToRgb(h, s, l);
    return `\x1b[48;2;${r};${g};${b}m${text}${STYLES.reset}`;
  }
}

class Rainbow extends ColorMethodBuilder {
  override call() {
    const [text] = this.args;
    this.validateString(text);

    const colors = [
      COLORS.red,
      COLORS.yellow,
      COLORS.green,
      COLORS.cyan,
      COLORS.blue,
      COLORS.magenta,
    ];

    let result = "";
    for (let i = 0; i < text.length; i++) {
      const colorIndex = i % colors.length;
      result += `${colors[colorIndex]}${text[i]}`;
    }
    return result + STYLES.reset;
  }
}

class Strip extends ColorMethodBuilder {
  override call() {
    const [text] = this.args;
    this.validateString(text);

    return text.replace(/\x1b\[[0-9;]*m/g, "");
  }
}

class Enabled extends ColorMethodBuilder {
  override call() {
    const hasColorSupport =
      process?.stdout?.isTTY && process?.env?.TERM !== "dumb" && !process?.env?.NODE_DISABLE_COLORS;

    return hasColorSupport || false;
  }
}

class Random extends ColorMethodBuilder {
  override call() {
    const [text] = this.args;
    this.validateString(text);

    const colorKeys = Object.keys(COLORS).filter(
      (key) => !key.startsWith("bg") && !key.startsWith("bright"),
    );

    const randomColor =
      colorKeys[new randint([0, colorKeys.length - 1], [], this.environment).call()];
    const colorCode = COLORS[randomColor as keyof typeof COLORS];

    return `${colorCode}${text}${STYLES.reset}`;
  }
}

class Combine extends ColorMethodBuilder {
  override call() {
    const [text, ...styleNames] = this.args;
    this.validateString(text);

    let combinedStyles = "";

    for (const styleName of styleNames) {
      this.validateString(styleName, "style");

      if (COLORS[styleName as keyof typeof COLORS]) {
        combinedStyles += COLORS[styleName as keyof typeof COLORS];
      } else if (STYLES[styleName as keyof typeof STYLES]) {
        combinedStyles += STYLES[styleName as keyof typeof STYLES];
      }
    }

    return `${combinedStyles}${text}${STYLES.reset}`;
  }
}

module.exports = {
  red: Red,
  green: Green,
  blue: Blue,
  yellow: Yellow,
  magenta: Magenta,
  cyan: Cyan,
  white: White,
  black: Black,
  gray: Gray,
  grey: Grey,
  brightRed: BrightRed,
  brightGreen: BrightGreen,
  brightBlue: BrightBlue,
  brightYellow: BrightYellow,
  brightMagenta: BrightMagenta,
  brightCyan: BrightCyan,
  brightWhite: BrightWhite,
  bgRed: BgRed,
  bgGreen: BgGreen,
  bgBlue: BgBlue,
  bgYellow: BgYellow,
  bgMagenta: BgMagenta,
  bgCyan: BgCyan,
  bgWhite: BgWhite,
  bgBlack: BgBlack,
  bold: Bold,
  dim: Dim,
  italic: Italic,
  underline: Underline,
  strikethrough: Strikethrough,
  reverse: Reverse,
  rgb: Rgb,
  bgRgb: BgRgb,
  hex: Hex,
  bgHex: BgHex,
  hsl: Hsl,
  bgHsl: BgHsl,
  rainbow: Rainbow,
  random: Random,
  combine: Combine,
  strip: Strip,
  enabled: Enabled,
  Styles: STYLES,
  Colors: COLORS,
};
