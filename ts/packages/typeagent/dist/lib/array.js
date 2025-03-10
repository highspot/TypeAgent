"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircularArray = exports.mapIterate = exports.slices = exports.mapAndFilter = exports.removeItemFromArray = exports.concatArrays = exports.getInRange = exports.addOrUpdateIntoSorted = exports.insertIntoSorted = exports.binarySearchLast = exports.binarySearchFirst = exports.binarySearch = exports.isUndefinedOrEmpty = void 0;
/**
 * Returns true if the given array is undefined or has length 0
 * @param array
 * @returns
 */
function isUndefinedOrEmpty(array) {
    return array === undefined || array.length === 0;
}
exports.isUndefinedOrEmpty = isUndefinedOrEmpty;
/**
 * Binary search an array
 * @param array
 * @param value
 * @param compareFn
 * @returns index if found, < 0 if not
 */
function binarySearch(array, value, compareFn) {
    let lo = 0;
    let hi = array.length - 1;
    while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        const cmp = compareFn(array[mid], value);
        if (cmp === 0) {
            return mid;
        }
        else if (cmp < 0) {
            lo = mid + 1;
        }
        else {
            hi = mid - 1;
        }
    }
    return ~lo;
}
exports.binarySearch = binarySearch;
/**
 * Finds the first location of value... i.e. handles duplicates in the array
 * If value is not found, returns the location of the first value >= to value
 */
function binarySearchFirst(array, value, compareFn, startAt = 0) {
    let lo = startAt;
    let hi = array.length - 1;
    while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        const cmp = compareFn(array[mid], value);
        if (cmp < 0) {
            lo = mid + 1;
        }
        else {
            hi = mid - 1;
        }
    }
    return lo;
}
exports.binarySearchFirst = binarySearchFirst;
/**
 * Returns the position of the last item <= to value
 */
function binarySearchLast(array, value, compareFn, startAt = 0) {
    let lo = startAt;
    let hi = array.length - 1;
    while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        const cmp = compareFn(array[mid], value);
        if (cmp <= 0) {
            lo = mid + 1;
        }
        else {
            hi = mid - 1;
        }
    }
    return lo;
}
exports.binarySearchLast = binarySearchLast;
/**
 * Insert a new item into a sorted array in order.
 * @param sorted
 * @param value
 */
function insertIntoSorted(sorted, value, compareFn) {
    let pos = binarySearch(sorted, value, compareFn);
    if (pos < 0) {
        pos = ~pos;
    }
    sorted.splice(pos, 0, value);
    return sorted;
}
exports.insertIntoSorted = insertIntoSorted;
/**
 * In place.
 * If item exists in sorted list, replace it. Else add it
 * @param sorted
 * @param value
 * @param compareFn
 * @returns
 */
function addOrUpdateIntoSorted(sorted, value, compareFn) {
    let pos = binarySearch(sorted, value, compareFn);
    if (pos < 0) {
        pos = ~pos;
        sorted.splice(pos, 0, value);
    }
    else {
        sorted[pos] = value;
    }
    return sorted;
}
exports.addOrUpdateIntoSorted = addOrUpdateIntoSorted;
function getInRange(values, startAt, stopAt, compareFn) {
    let startIndex = binarySearchFirst(values, startAt, compareFn);
    if (startIndex === values.length) {
        // No such value
        return [];
    }
    if (stopAt === undefined) {
        return values.slice(startIndex);
    }
    const stopIndex = binarySearchLast(values, stopAt, compareFn, startIndex);
    // If the stopIndex has a value that matches the range, use it..
    if (stopIndex < values.length && compareFn(values[stopIndex], stopAt) === 0) {
        return values.slice(startIndex, stopIndex + 1);
    }
    return values.slice(startIndex, stopIndex);
}
exports.getInRange = getInRange;
/**
 * Array concatenation that handles (ignores) undefined arrays. The caller has to do fewer checks
 * @param arrays
 */
function concatArrays(...arrays) {
    const result = [];
    for (const array of arrays) {
        if (array) {
            result.push(...array);
        }
    }
    return result;
}
exports.concatArrays = concatArrays;
function removeItemFromArray(array, items) {
    if (Array.isArray(items)) {
        for (const item of items) {
            const pos = array.indexOf(item);
            if (pos >= 0) {
                array.splice(pos, 1);
            }
        }
    }
    else {
        const pos = array.indexOf(items);
        if (pos >= 0) {
            array.splice(pos, 1);
        }
    }
    return array;
}
exports.removeItemFromArray = removeItemFromArray;
function mapAndFilter(array, callbackfn, predicate) {
    let results = [];
    for (let i = 0; i < array.length; ++i) {
        const result = callbackfn(array[i], i, array);
        if (!result || (predicate && !predicate(result, i, array))) {
            continue;
        }
        results.push(result);
    }
    return results;
}
exports.mapAndFilter = mapAndFilter;
function* slices(array, size) {
    for (let i = 0; i < array.length; i += size) {
        const slice = array.slice(i, i + size);
        if (slice.length === 0) {
            break;
        }
        yield { startAt: i, value: slice };
    }
}
exports.slices = slices;
function* mapIterate(items, processor) {
    for (const item of items) {
        yield processor(item);
    }
}
exports.mapIterate = mapIterate;
/**
 * A Circular Array (Buffer) {@link https://en.wikipedia.org/wiki/Circular_buffer})
 * Useful for implementing:
 *  - Fixed length queues that automatically drop FIFO items when limit is hit
 *  - Buffers for "windowing" functions in streaming, chat histories etc.
 * Properties:
 *  - Maximum allowed length
 *  - Once maximum length is reached, a push replaces the oldest item (FIFO order)
 */
class CircularArray {
    constructor(capacity) {
        this.buffer = new Array(capacity);
        this.count = 0;
        this.head = 0;
        this.tail = this.count;
    }
    /**
     * Array length
     */
    get length() {
        return this.count;
    }
    /**
     * Return i'th item in the circular buffer
     * @param index
     * @returns
     */
    get(index) {
        if (index >= this.count) {
            throw new Error(`${index} is out of range`);
        }
        return this.buffer[this.relativeToHead(index)];
    }
    /**
     * Returns a shallow copy of all items in the circular buffer
     */
    getEntries(maxEntries) {
        let arrayLength = this.length;
        if (maxEntries) {
            arrayLength = Math.min(arrayLength, maxEntries);
        }
        const entries = [];
        for (let i = 0; i < arrayLength; ++i) {
            entries.push(this.get(i));
        }
        return entries;
    }
    /**
     * Method to set an item at a given index
     * @param index
     * @param value
     */
    set(index, value) {
        this.buffer[this.relativeToHead(index)] = value;
    }
    /**
     * Push item onto the array. If array is full, replaces the oldest (in FIFO order) item in the array
     * @param item
     */
    push(item) {
        if (this.isFull()) {
            // Queue is full. Drop the oldest item
            this.dropHead();
        }
        this.buffer[this.tail] = item;
        this.tail = (this.tail + 1) % this.buffer.length;
        this.count++;
    }
    pop() {
        if (this.count == 0) {
            return undefined;
        }
        const item = this.buffer[this.head];
        this.dropHead();
        return item;
    }
    *[Symbol.iterator]() {
        const count = this.count;
        for (let i = 0; i < count; ++i) {
            yield this.get(i);
        }
    }
    *itemsReverse() {
        for (let i = this.count - 1; i >= 0; --i) {
            const item = this.get(i);
            if (item) {
                yield item;
            }
        }
    }
    last() {
        return this.buffer[this.count - 1];
    }
    reset() {
        this.count = 0;
        this.head = 0;
        this.tail = this.count;
    }
    isFull() {
        return this.count == this.buffer.length;
    }
    relativeToHead(index) {
        return (this.head + index) % this.buffer.length;
    }
    dropHead() {
        this.head = (this.head + 1) % this.buffer.length;
        --this.count;
    }
}
exports.CircularArray = CircularArray;
//# sourceMappingURL=array.js.map