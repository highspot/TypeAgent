"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChunkedIterator = void 0;
function createChunkedIterator(loader) {
    let chunk;
    return {
        next,
        loadNext,
    };
    function next() {
        return chunk ? chunk.next() : { value: null, done: true };
    }
    async function loadNext() {
        const newChunk = await loader();
        if (newChunk === undefined) {
            return false;
        }
        chunk = Array.isArray(newChunk) ? newChunk.values() : newChunk;
        return true;
    }
}
exports.createChunkedIterator = createChunkedIterator;
//# sourceMappingURL=iterator.js.map