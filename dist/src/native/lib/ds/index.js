"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hash = Hash;
exports.Bag = Bag;
function Hash() {
    const hash = new Map();
    return {
        get([key]) {
            return hash.get(key);
        },
        set([key, value]) {
            hash.set(key, value);
        },
        delete([key]) {
            return hash.delete(key);
        },
        has([key]) {
            return hash.has(key);
        },
        clear() {
            hash.clear();
        },
        keys() {
            return Array.from(hash.keys());
        },
        values() {
            return Array.from(hash.values());
        },
        entries() {
            return Array.from(hash.entries());
        },
        size() {
            return hash.size;
        },
        [Symbol.iterator]() {
            return hash.keys();
        },
    };
}
function Bag() {
    const set = new Set();
    return {
        add([value]) {
            set.add(value);
        },
        delete([value]) {
            return set.delete(value);
        },
        has([value]) {
            return set.has(value);
        },
        clear() {
            set.clear();
        },
        values() {
            return Array.from(set.values());
        },
        size() {
            return set.size;
        },
        [Symbol.iterator]() {
            return set.values();
        },
    };
}
