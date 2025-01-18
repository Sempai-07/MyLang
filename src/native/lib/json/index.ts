function parse([string]: [string]) {
  return JSON.parse(string);
}

function stringify([obj]: [object]) {
  return JSON.stringify(obj);
}

export { parse, stringify };
