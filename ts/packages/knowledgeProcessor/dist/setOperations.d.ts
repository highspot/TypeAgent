import { ScoredItem } from "typeagent";
export declare enum SetOp {
    Union = 0,
    Intersect = 1,
    IntersectUnion = 2
}
export type Postings = Uint32Array;
export declare function createPostings(ids: number[] | Iterable<number>): Postings;
export declare function intersectMerge<T>(xArray: Iterator<T> | Array<T>, yArray: Iterator<T> | Array<T>): IterableIterator<T>;
export declare function intersect<T>(xArray: Iterator<T> | Array<T>, yArray: Iterator<T> | Array<T>): IterableIterator<T>;
export declare function intersectMultiple<T>(...arrays: (Iterator<T> | IterableIterator<T> | Array<T> | undefined)[]): IterableIterator<T>;
export declare function intersectUnionMultiple<T>(...arrays: (Iterator<T> | IterableIterator<T> | Array<T> | undefined)[]): T[] | undefined;
export declare function unionMerge<T>(xArray: Iterator<T> | Array<T>, yArray: Iterator<T> | Array<T>): IterableIterator<T>;
export declare function union<T>(xArray: Iterator<T> | Array<T>, yArray: Iterator<T> | Array<T>): IterableIterator<T>;
export declare function unionMultiple<T>(...arrays: (Iterator<T> | IterableIterator<T> | Array<T> | undefined)[]): IterableIterator<T>;
export declare function unionScored<T>(xArray: Iterator<ScoredItem<T>> | Array<ScoredItem<T>>, yArray: Iterator<ScoredItem<T>> | Array<ScoredItem<T>>): IterableIterator<ScoredItem<T>>;
export declare function unionScoredHash(xArray: Iterator<ScoredItem<number>> | Array<ScoredItem<number>>, yArray: Iterator<ScoredItem<number>> | Array<ScoredItem<number>>): IterableIterator<ScoredItem<number>>;
export declare function unionMultipleScored<T>(...arrays: (Iterator<ScoredItem<T>> | IterableIterator<ScoredItem<T>> | Array<ScoredItem<T>> | undefined)[]): IterableIterator<ScoredItem<T>>;
export declare function unique<T>(x: Iterator<T>): IterableIterator<T>;
export declare function window<T>(x: Iterator<T>, windowSize: number): IterableIterator<T[]>;
export declare function unionArrays<T = any>(x: T[] | undefined, y: T[] | undefined): T[] | undefined;
export declare function intersectArrays(x?: any[], y?: any[]): any[] | undefined;
export declare function setFrom<T>(src: Iterable<T>, callback?: (value: T) => any | undefined): Set<any>;
export declare function uniqueFrom<T, TRetVal = any>(src: Iterable<T>, callback?: (value: T) => TRetVal | undefined, sort?: boolean): TRetVal[] | undefined;
export declare function addToSet(set: Set<any>, values?: Iterable<any>): void;
export declare function intersectSets<T = any>(x?: Set<T>, y?: Set<T>): Set<T> | undefined;
export declare function unionSets<T = any>(x?: Set<T>, y?: Set<T>): Set<T> | undefined;
export declare function intersectUnionSets<T = any>(x?: Set<T>, y?: Set<T>): Set<T> | undefined;
export declare function flatten<T>(src: Iterable<T>, callback?: (value: T) => any | undefined, sort?: boolean): any[];
export declare function removeUndefined<T = any>(src: Array<T | undefined>): T[];
export declare function removeDuplicates<T = any>(src: T[] | undefined, comparer: (x: T, y: T) => number): T[] | undefined;
export type WithFrequency<T = any> = {
    value: T;
    count: number;
};
export interface HitTable<T = any> {
    readonly size: number;
    get(value: T): ScoredItem<T> | undefined;
    getScore(value: T): number;
    add(value: T, score?: number | undefined): number;
    addMultiple(values: Iterator<T> | IterableIterator<T> | Array<T>, score?: number | undefined): void;
    addMultipleScored(values: Iterator<ScoredItem<T>> | IterableIterator<ScoredItem<T>> | Array<ScoredItem<T>>): void;
    keys(): IterableIterator<any>;
    values(): IterableIterator<ScoredItem<T>>;
    /**
     * Return all hits sorted by score
     */
    byHighestScore(): ScoredItem<T>[];
    /**
     * Return top scoring hits
     */
    getTop(): T[];
    /**
     * Return hits with the 'k' highest scores
     * getTopK(3) will return all items whose scores put them in the top 3
     * @param k k highest scores
     */
    getTopK(k: number): T[];
    getByKey(key: any): ScoredItem<T> | undefined;
    set(key: any, value: ScoredItem<T>): void;
    clear(): void;
    roundScores(decimalPlace: number): void;
}
/**
 * Tracks the # of hits on an object of arbitrary type T
 * Internally uses the Map object
 * @param keyAccessor (optional) By default, when T is a non-primitive type, the map object uses object identity as the 'key'.
 * This is not always what we want, as we may want to treat different object with different identities as the same..
 * @param fixedScore (optional) Overrides an supplied scores. E.g. set this to 1.0 to get a hit *counter*
 * @returns
 */
export declare function createHitTable<T>(keyAccessor?: (value: T) => any, fixedScore?: number | undefined): HitTable<T>;
//# sourceMappingURL=setOperations.d.ts.map