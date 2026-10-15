const useColor = !process.env.NO_COLOR;
const paint = (code: number) => (text: string) => (useColor ? `\x1b[${code}m${text}\x1b[0m` : text);
const cyan = paint(36);
const green = paint(32);
const yellow = paint(33);
const red = paint(31);
const dim = paint(90);

export { useColor, paint, cyan, green, yellow, red, dim };
