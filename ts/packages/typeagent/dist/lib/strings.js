"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStringChunks = exports.stringCompareArray = exports.stringHashCode = exports.stringEquals = exports.stringCompare = exports.lowerAndSort = exports.stringPrefixCompare = void 0;
// Is x a prefix of y
function stringPrefixCompare(x, y) {
    // Find the length of the shorter string
    const length = Math.min(x.length, y.length);
    // Compare the substrings up to the length of the shorter string
    for (let i = 0; i < length; ++i) {
        if (x[i] < y[i]) {
            return -1;
        }
        else if (x[i] > y[i]) {
            return 1;
        }
    }
    // If all characters are equal up to the minLength, then check the lengths
    if (x.length < y.length) {
        return -1; // x is a prefix of y, since it is shorter
    }
    else if (x.length > y.length) {
        return 1; // yis a prefix of x
    }
    // Same chars, same length
    return 0;
}
exports.stringPrefixCompare = stringPrefixCompare;
function lowerAndSort(values) {
    if (values) {
        for (let i = 0; i < values.length; ++i) {
            values[i] = values[i].toLowerCase();
        }
        values.sort();
    }
}
exports.lowerAndSort = lowerAndSort;
const caseInsensitiveOptions = { sensitivity: 'base' };
function stringCompare(x, y, caseSensitive) {
    if (x === undefined) {
        return y === undefined ? 0 : -1;
    }
    if (y === undefined) {
        return 1;
    }
    return caseSensitive ? x.localeCompare(y) : x.localeCompare(y, undefined, caseInsensitiveOptions);
}
exports.stringCompare = stringCompare;
function stringEquals(x, y, caseSensitive) {
    return caseSensitive ? x === y : stringCompare(x, y, caseSensitive) === 0;
}
exports.stringEquals = stringEquals;
// Uses the djb2 hash
function stringHashCode(value) {
    let hash = 5381;
    for (let i = 0; i < value.length; i++) {
        hash = (hash * 33) ^ value.charCodeAt(i);
    }
    return hash >>> 0; // Ensure the hash is a positive 32-bit integer  
}
exports.stringHashCode = stringHashCode;
function stringCompareArray(x, y, caseSensitive) {
    if (x === undefined) {
        return y === undefined ? 0 : -1;
    }
    if (y === undefined) {
        return 1;
    }
    const xLength = x.length;
    const yLength = y.length;
    const minLength = Math.min(xLength, yLength);
    for (let i = 0; i < minLength; i++) {
        const cmp = stringCompare(x[i], y[i], caseSensitive);
        if (cmp !== 0) {
            return cmp;
        }
    }
    // If items are equal, then shorter string is less in ascending order 
    return (xLength === yLength) ? 0 : (xLength < yLength) ? -1 : 1;
}
exports.stringCompareArray = stringCompareArray;
function* getStringChunks(values, maxChunkLength, maxCharsPerChunk) {
    let chunk = [];
    let totalCharsInChunk = 0;
    for (let value of values) {
        if (value.length > maxCharsPerChunk) {
            // Truncate strings that are too long
            value = value.slice(0, maxCharsPerChunk);
        }
        if (chunk.length === maxChunkLength || value.length + totalCharsInChunk > maxCharsPerChunk) {
            if (totalCharsInChunk > 0) {
                yield chunk;
            }
            chunk = [];
            totalCharsInChunk = 0;
        }
        chunk.push(value);
        totalCharsInChunk += value.length;
    }
    if (totalCharsInChunk > 0) {
        yield chunk;
    }
}
exports.getStringChunks = getStringChunks;
//# sourceMappingURL=strings.js.map