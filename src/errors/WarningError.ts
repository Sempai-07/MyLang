class CustomWarning extends Error {
  code?: string;

  constructor(message: string, name: string = "Warning", code?: string) {
    super(message);
    this.name = name;
    if (code) this.code = code;
    Error.captureStackTrace(this, CustomWarning);
  }
}

type WarningHandler = (warning: CustomWarning) => void;

const handlers: WarningHandler[] = [];

function emitWarning(
  message: string,
  options: { name?: string; code?: string } = {},
): void {
  const { name = "Warning", code } = options;
  const warning = new CustomWarning(message, name, code);
  handlers.forEach((h) => h(warning));

  console.warn(
    `\x1b[33m${warning.name}: ${warning.message}${code ? ` [${code}]` : ""}\x1b[0m`,
  );
}

emitWarning.on = (handler: WarningHandler) => handlers.push(handler);
emitWarning.off = (handler: WarningHandler) => {
  const index = handlers.indexOf(handler);
  if (index !== -1) handlers.splice(index, 1);
};

export { emitWarning };
