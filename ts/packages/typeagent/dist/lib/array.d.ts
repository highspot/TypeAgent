/**
 * Returns true if the given array is undefined or has length 0
 * @param array
 * @returns
 */
export declare function isUndefinedOrEmpty(array: any[] | undefined): boolean;
/**
 * Binary search an array
 * @param array
 * @param value
 * @param compareFn
 * @returns index if found, < 0 if not
 */
export declare function binarySearch(array: any[], value: any, compareFn: (x: any, y: any) => number): number;
/**
 * Finds the first location of value... i.e. handles duplicates in the array
 * If value is not found, returns the location of the first value >= to value
 */
export declare function binarySearchFirst(array: any[], value: any, compareFn: (x: any, y: any) => number, startAt?: number): number;
/**
 * Returns the position of the last item <= to value
 */
export declare function binarySearchLast(array: any[], value: any, compareFn: (x: any, y: any) => number, startAt?: number): number;
/**
 * Insert a new item into a sorted array in order.
 * @param sorted
 * @param value
 */
export declare function insertIntoSorted(sorted: any[], value: any, compareFn: (x: any, y: any) => number): any[];
/**
 * In place.
 * If item exists in sorted list, replace it. Else add it
 * @param sorted
 * @param value
 * @param compareFn
 * @returns
 */
export declare function addOrUpdateIntoSorted(sorted: any[], value: any, compareFn: (x: any, y: any) => number): any[];
export declare function getInRange(values: any[], startAt: any, stopAt: any | undefined, compareFn: (x: any, y: any) => number): any[];
/**
 * Array concatenation that handles (ignores) undefined arrays. The caller has to do fewer checks
 * @param arrays
 */
export declare function concatArrays<T = any>(...arrays: (Array<T> | undefined)[]): T[];
export declare function removeItemFromArray<T>(array: T[], items: T | T[]): T[];
export declare function mapAndFilter<T = any, R = any>(array: T[], callbackfn: (value: T, index: number, array: T[]) => R | undefined, predicate?: (value: R, index: number, array: T[]) => boolean): R[];
export type Slice<T = any> = {
    startAt: number;
    value: T[];
};
export declare function slices<T = any>(array: T[], size: number): IterableIterator<Slice<T>>;
export declare function mapIterate<T, TResult>(items: Iterable<T>, processor: (item: T) => TResult): IterableIterator<TResult>;
/**
 * A Circular Array (Buffer) {@link https://en.wikipedia.org/wiki/Circular_buffer})
 * Useful for implementing:
 *  - Fixed length queues that automatically drop FIFO items when limit is hit
 *  - Buffers for "windowing" functions in streaming, chat histories etc.
 * Properties:
 *  - Maximum allowed length
 *  - Once maximum length is reached, a push replaces the oldest item (FIFO order)
 */
export declare class CircularArray<T> implements Iterable<T> {
    private buffer;
    private count;
    private head;
    private tail;
    constructor(capacity: number);
    /**
     * Array length
     */
    get length(): number;
    /**
     * Return i'th item in the circular buffer
     * @param index
     * @returns
     */
    get(index: number): T;
    /**
     * Returns a shallow copy of all items in the circular buffer
     */
    getEntries(maxEntries?: number): T[];
    /**
     * Method to set an item at a given index
     * @param index
     * @param value
     */
    set(index: number, value: T): void;
    /**
     * Push item onto the array. If array is full, replaces the oldest (in FIFO order) item in the array
     * @param item
     */
    push(item: T): void;
    pop(): T | undefined;
    [Symbol.iterator](): Iterator<T>;
    itemsReverse(): IterableIterator<T>;
    last(): T | undefined;
    reset(): void;
    private isFull;
    private relativeToHead;
    private dropHead;
}
//# sourceMappingURL=array.d.ts.map