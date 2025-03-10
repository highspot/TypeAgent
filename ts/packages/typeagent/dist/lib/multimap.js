"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiMap = void 0;
/**
 * MultiMap is a map of key => value[]
 * Includes functions that let you work with such structures
 * Very useful for building things like one to many indices, inverted indices etc.
 */
class MultiMap extends Map {
    constructor(iterable) {
        super(iterable);
    }
    /**
     * Push a new value for the give key
     * @param key
     * @param value
     * @returns
     */
    add(key, value) {
        let values = super.get(key);
        if (values === undefined) {
            values = [value];
            super.set(key, values);
        }
        else {
            values.push(value);
        }
        return this;
    }
    /**
     * Push a new value for the given key if it does not already exist
     * @param key
     * @param value
     * @returns
     */
    addUnique(key, value, comparer) {
        let values = super.get(key);
        if (values === undefined) {
            values = [value];
            super.set(key, values);
            return this;
        }
        if (comparer) {
            for (let i = 0; i < values.length; ++i) {
                if (comparer(value, values[i])) {
                    return this;
                }
            }
            values.push(value);
        }
        else if (values.includes(value)) {
            return this;
        }
        values.push(value);
        return this;
    }
    /**
     * Remove a value from the give key
     * @param key
     * @param value
     * @returns
     */
    removeValue(key, value) {
        const values = super.get(key);
        if (values && values.length > 0) {
            return this.removeValueAt(key, values, values.indexOf(value));
        }
        return false;
    }
    remove(key, predicate) {
        const values = super.get(key);
        if (values) {
            return this.removeValueAt(key, values, values.findIndex(predicate));
        }
        return false;
    }
    removeAt(key, pos) {
        const values = super.get(key);
        if (values) {
            return this.removeValueAt(key, values, pos);
        }
        return false;
    }
    find(key, predicate) {
        const values = super.get(key);
        if (values) {
            return values.find(predicate);
        }
        return undefined;
    }
    indexOfValue(key, value) {
        const values = super.get(key);
        if (values) {
            return values.indexOf(value);
        }
        return -1;
    }
    indexOf(key, predicate) {
        const values = super.get(key);
        if (values) {
            return values.findIndex(predicate);
        }
        return -1;
    }
    removeValueAt(key, values, pos) {
        if (pos >= 0) {
            values.splice(pos, 1);
            if (values.length === 0) {
                super.delete(key);
            }
            return true;
        }
        return false;
    }
}
exports.MultiMap = MultiMap;
//# sourceMappingURL=multimap.js.map