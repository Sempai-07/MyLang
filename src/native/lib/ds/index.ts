function Hash() {
  const hash = new Map<string, any>();

  return {
    get([key]: [string]): any {
      return hash.get(key);
    },
    set([key, value]: [string, any]): void {
      hash.set(key, value);
    },
    delete([key]: [string]): boolean {
      return hash.delete(key);
    },
    has([key]: [string]): boolean {
      return hash.has(key);
    },
    clear(): void {
      hash.clear();
    },
    keys(): string[] {
      return Array.from(hash.keys());
    },
    values(): any[] {
      return Array.from(hash.values());
    },
    entries(): [string, any][] {
      return Array.from(hash.entries());
    },
    size(): number {
      return hash.size;
    },
  };
}

function Bag() {
  const set = new Set<any>();

  return {
    add([value]: [any]): void {
      set.add(value);
    },
    delete([value]: [any]): boolean {
      return set.delete(value);
    },
    has([value]: [any]): boolean {
      return set.has(value);
    },
    clear(): void {
      set.clear();
    },
    values(): any[] {
      return Array.from(set.values());
    },
    size(): number {
      return set.size;
    },
  };
}

export { Hash, Bag };
