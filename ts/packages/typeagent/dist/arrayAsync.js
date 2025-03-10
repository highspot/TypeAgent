"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.toArray = exports.readBatches = exports.forEachBatch = exports.forEachAsync = exports.mapAsync = void 0;
const _1 = require(".");
const lib_1 = require("./lib");
/**
 * Any async version of map that supports concurrency
 * @param array chunks to process
 * @param concurrency how many to run in parallel
 * @param processor function to process chunks
 * @returns
 */
async function mapAsync(array, concurrency, processor, progress) {
    if (concurrency <= 1) {
        return sequential();
    }
    return concurrent();
    async function sequential() {
        const results = [];
        for (let i = 0; i < array.length; i++) {
            const result = await processor(array[i], i);
            results.push(result);
            if (progress) {
                const progressResult = progress(array[i], i, result);
                if (shouldStop(progressResult)) {
                    break;
                }
            }
        }
        return results;
    }
    async function concurrent() {
        const results = [];
        // Concurrent version
        for (let i = 0; i < array.length; i += concurrency) {
            const slice = array.slice(i, i + concurrency);
            if (slice.length === 0) {
                break;
            }
            const sliceResults = await Promise.all(slice.map((item, index) => processor(item, i + index)));
            results.push(...sliceResults);
            if (progress) {
                let stop = false;
                for (let s = 0; s < sliceResults.length; ++s) {
                    let index = s + i;
                    let r = progress(array[index], index, results[index]);
                    if (shouldStop(r)) {
                        stop = true;
                    }
                }
                if (stop) {
                    return results;
                }
            }
        }
        return results;
    }
}
exports.mapAsync = mapAsync;
/**
 * Any async version of map that supports concurrency
 * @param array chunks to process
 * @param concurrency how many to run in parallel
 * @param processor function to process chunks
 * @returns
 */
async function forEachAsync(array, concurrency, processor, progress) {
    if (array.length === 0) {
        return;
    }
    if (concurrency <= 1) {
        return sequential();
    }
    return concurrent();
    async function sequential() {
        for (let i = 0; i < array.length; i++) {
            await processor(array[i], i);
            if (progress) {
                const progressResult = progress(array[i], i);
                if (shouldStop(progressResult)) {
                    break;
                }
            }
        }
        return;
    }
    async function concurrent() {
        // Concurrent version
        for (let i = 0; i < array.length; i += concurrency) {
            const slice = array.slice(i, i + concurrency);
            if (slice.length === 0) {
                break;
            }
            await Promise.all(slice.map((item, index) => processor(item, i + index)));
            if (progress) {
                let stop = false;
                for (let s = 0; s < slice.length; ++s) {
                    let index = s + i;
                    let r = progress(array[index], index);
                    if (shouldStop(r)) {
                        stop = true;
                    }
                }
                if (stop) {
                    return;
                }
            }
        }
    }
}
exports.forEachAsync = forEachAsync;
async function forEachBatch(array, sliceSize, processor, progress, maxCount) {
    if (Array.isArray(array)) {
        for (const batch of (0, lib_1.slices)(array, sliceSize)) {
            const results = await Promise.all(processor(batch));
            if (progress) {
                progress(batch, results);
            }
        }
    }
    else {
        for await (const batch of readBatches(array, sliceSize)) {
            const results = await Promise.all(processor(batch));
            if (progress) {
                progress(batch, results);
            }
        }
    }
}
exports.forEachBatch = forEachBatch;
/**
 * Read items from the given iterable in batches
 * @param source source of items
 * @param batchSize batch size
 * @returns
 */
async function* readBatches(source, batchSize) {
    if (batchSize <= 0) {
        return;
    }
    if (Array.isArray(source)) {
        for (const slice of _1.collections.slices(source, batchSize)) {
            yield slice;
        }
        return;
    }
    let value;
    let startAt = 0;
    for await (const item of source) {
        value ??= [];
        value.push(item);
        if (value.length === batchSize) {
            yield { startAt, value };
            startAt += value.length;
            value = undefined;
        }
    }
    if (value && value.length > 0) {
        yield { startAt, value };
    }
}
exports.readBatches = readBatches;
/**
 * Turn an async iterator into an array
 * @param iter
 * @param maxLength (Optional) Read at most these many items
 * @returns
 */
async function toArray(iter, maxLength) {
    const items = [];
    for await (const item of iter) {
        items.push(item);
        if (maxLength && items.length === maxLength) {
            break;
        }
    }
    return items;
}
exports.toArray = toArray;
function shouldStop(progressResult) {
    return typeof progressResult === "boolean" && !progressResult;
}
//# sourceMappingURL=arrayAsync.js.map