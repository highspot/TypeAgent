"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLazy = exports.createLRUCache = void 0;
const linkedList_1 = require("./linkedList");
/**
 * Create an LRU cache
 * @param maxEntries max entries in the cache
 * @param entries initial entries, if any
 * @param onPurged callback when an entry is purged
 * @returns
 */
function createLRUCache(maxEntries, entries, onPurged) {
    const kvTable = new Map();
    const mruList = (0, linkedList_1.createLinkedList)();
    if (entries) {
        for (const entry of entries) {
            put(entry.name, entry.value);
        }
    }
    return {
        get size() {
            return kvTable.size;
        },
        has: (key) => kvTable.has(key),
        all,
        get,
        put,
        remove,
        removeLRU,
        purge,
    };
    function all() {
        const all = [];
        for (const node of (0, linkedList_1.allNodes)(mruList.head)) {
            const entry = node;
            all.push({ name: entry.name, value: entry.value });
        }
        return all;
    }
    function get(name) {
        const entry = kvTable.get(name);
        if (entry) {
            mruList.makeMRU(entry);
            return entry.value;
        }
        return undefined;
    }
    function put(name, value) {
        let entry = kvTable.get(name);
        if (entry !== undefined) {
            mruList.makeMRU(entry);
            entry.value = value;
        }
        else {
            purge();
            entry = createListEntry(name, value);
            kvTable.set(name, entry);
            mruList.pushHead(entry);
        }
    }
    function remove(name) {
        const entry = kvTable.get(name);
        if (entry) {
            removeNode(entry);
        }
    }
    function removeLRU() {
        if (kvTable.size >= maxEntries) {
            const lru = mruList.tail;
            if (lru) {
                removeNode(lru);
                if (onPurged) {
                    onPurged(lru.name, lru.value);
                }
                return lru.value;
            }
        }
        return undefined;
    }
    function removeNode(entry) {
        kvTable.delete(entry.name);
        mruList.removeNode(entry);
    }
    function purge() {
        while (kvTable.size >= maxEntries) {
            const tail = mruList.tail;
            if (tail) {
                removeNode(tail);
                if (onPurged) {
                    onPurged(tail.name, tail.value);
                }
            }
        }
    }
    function createListEntry(name, value) {
        return {
            next: undefined,
            prev: undefined,
            name,
            value,
        };
    }
}
exports.createLRUCache = createLRUCache;
function createLazy(initializer, cache, useWeakRef) {
    let lazyValue;
    let pendingInit;
    return {
        get value() {
            return getSync();
        },
        get,
    };
    function getSync() {
        if (lazyValue !== undefined) {
            return lazyValue.isWeak ? lazyValue.value.deref() : lazyValue.value;
        }
        return undefined;
    }
    function get() {
        const value = getSync();
        if (value !== undefined) {
            return Promise.resolve(value);
        }
        if (pendingInit === undefined) {
            // Wrapper promise to prevent 'herding cats' 
            pendingInit = new Promise((resolve, reject) => {
                try {
                    initializer().then((v) => {
                        setValue(v);
                        resolve(v);
                    }).catch((e) => reject(e));
                }
                catch (e) {
                    reject(e);
                }
            }).finally(() => {
                pendingInit = undefined;
            });
        }
        return pendingInit;
    }
    function setValue(v) {
        if (cache) {
            lazyValue = useWeakRef ? { isWeak: true, value: new WeakRef(v) } : { isWeak: false, value: v };
        }
        return v;
    }
}
exports.createLazy = createLazy;
//# sourceMappingURL=cache.js.map