function compare([a, b]: [string, string]): number {
  return a.localeCompare(b);
}

function contains([haystack, needle]: [string, string]): boolean {
  return haystack.includes(needle);
}

function containsAny([haystack, chars]: [string, string]): boolean {
  for (let char of chars) {
    if (haystack.includes(char)) {
      return true;
    }
  }
  return false;
}

function containsRune([haystack, rune]: [string, string]): boolean {
  return haystack.includes(rune);
}

function count([haystack, needle]: [string, string]): number {
  return haystack.split(needle).length - 1;
}

function equalFold([a, b]: [string, string]): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

function fields([s]: [string]): string[] {
  return s.trim().split(/\s+/);
}

function hasPrefix([s, prefix]: [string, string]): boolean {
  return s.startsWith(prefix);
}

function hasSuffix([s, suffix]: [string, string]): boolean {
  return s.endsWith(suffix);
}

function index([haystack, needle]: [string, string]): number {
  return haystack.indexOf(needle);
}

function indexAny([haystack, chars]: [string, string]): number {
  for (let i = 0; i < haystack.length; i++) {
    if (chars.includes(haystack[i])) {
      return i;
    }
  }
  return -1;
}

function repeat([s, count]: [string, number]): string {
  return s.repeat(count);
}

function replace([s, oldSub, newSub, n = 1]: [
  string,
  string,
  string,
  number,
]): string {
  if (n === 0) return s;
  let count = 0;
  return s.replace(new RegExp(oldSub, "g"), (match) => {
    count++;
    return count <= n ? newSub : match;
  });
}

function replaceAll([s, oldSub, newSub]: [string, string, string]): string {
  return s.split(oldSub).join(newSub);
}

function split([s, separator]: [string, string]): string[] {
  return s.split(separator);
}

function splitAfter([s, separator]: [string, string]): string[] {
  let parts = s.split(separator);
  return parts.map((part, index) => {
    if (index < parts.length - 1) return part + separator;
    return part;
  });
}

function title([s]: [string]): string {
  return s.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase(),
  );
}

function toLower([s]: [string]): string {
  return s.toLowerCase();
}

function toUpper([s]: [string]): string {
  return s.toUpperCase();
}

function trim([s, cutset]: [string, string]): string {
  let pattern = new RegExp(`^[${cutset}]+|[${cutset}]+$`, "g");
  return s.replace(pattern, "");
}

function trimLeft([s, cutset]: [string, string]): string {
  let pattern = new RegExp(`^[${cutset}]+`, "g");
  return s.replace(pattern, "");
}

function trimRight([s, cutset]: [string, string]): string {
  let pattern = new RegExp(`[${cutset}]+$`, "g");
  return s.replace(pattern, "");
}

function trimSpace([s]: [string]): string {
  return s.trim();
}

export {
  compare,
  contains,
  containsAny,
  containsRune,
  count,
  equalFold,
  fields,
  hasPrefix,
  hasSuffix,
  index,
  indexAny,
  repeat,
  replace,
  replaceAll,
  split,
  splitAfter,
  title,
  toLower,
  toUpper,
  trim,
  trimLeft,
  trimRight,
  trimSpace,
};
