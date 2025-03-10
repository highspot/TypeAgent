/**
 * MultiMap is a map of key => value[]
 * Includes functions that let you work with such structures
 * Very useful for building things like one to many indices, inverted indices etc.
 */
export declare class MultiMap<K, V> extends Map<K, V[]> {
    constructor(iterable?: Iterable<readonly [K, V[]]>);
    /**
     * Push a new value for the give key
     * @param key
     * @param value
     * @returns
     */
    add(key: K, value: V): this;
    /**
     * Push a new value for the given key if it does not already exist
     * @param key
     * @param value
     * @returns
     */
    addUnique(key: K, value: V, comparer?: (value: V, other: V) => boolean): this;
    /**
     * Remove a value from the give key
     * @param key
     * @param value
     * @returns
     */
    removeValue(key: K, value: V): boolean;
    remove(key: K, predicate: (value: V, index: number, obj: V[]) => boolean): boolean;
    removeAt(key: K, pos: number): boolean;
    find(key: K, predicate: (value: V, index: number, obj: V[]) => boolean): V | undefined;
    indexOfValue(key: K, value: V): number;
    indexOf(key: K, predicate: (value: V, index: number, obj: V[]) => boolean): number;
    private removeValueAt;
}
//# sourceMappingURL=multimap.d.ts.map