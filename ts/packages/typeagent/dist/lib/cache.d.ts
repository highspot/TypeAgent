import { NameValue } from "../memory";
/**
 * A Cache of V, where N is the key for V
 */
export interface Cache<N, V> {
    readonly size: number;
    has(name: N): boolean;
    get(name: N): V | undefined;
    put(name: N, value: V): void;
    remove(name: N): void;
    removeLRU(): V | undefined;
    purge(): void;
    all(): NameValue<V, N>[];
}
/**
 * Create an LRU cache
 * @param maxEntries max entries in the cache
 * @param entries initial entries, if any
 * @param onPurged callback when an entry is purged
 * @returns
 */
export declare function createLRUCache<N, V>(maxEntries: number, entries?: NameValue<V, N>[], onPurged?: (key: N, v: V) => void): Cache<N, V>;
export interface Lazy<T> {
    readonly value: T | undefined;
    get(): Promise<T>;
}
export declare function createLazy<T extends object>(initializer: () => Promise<T>, cache: boolean, useWeakRef: boolean): Lazy<T>;
//# sourceMappingURL=cache.d.ts.map