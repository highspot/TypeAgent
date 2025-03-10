// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { console_log } from "./logging.js";
export function makeBatches(chunks, batchSize, // In characters
maxChunks) {
    const batches = [];
    let batch = [];
    let size = 0;
    function flush() {
        batches.push(batch);
        console_log(`    [Batch ${batches.length} has ${batch.length} chunks and ${size} characters]`);
        batch = [];
        size = 0;
    }
    for (const chunk of chunks) {
        const chunkSize = getChunkSize(chunk);
        if (size &&
            (size + chunkSize > batchSize || batch.length >= maxChunks)) {
            flush();
        }
        batch.push(chunk);
        size += chunkSize;
    }
    if (size) {
        flush();
    }
    return batches;
}
export function keepBestChunks(chunkDescs, // Sorted by descending relevance
allChunks, batchSize) {
    const chunks = [];
    let size = 0;
    for (const chunkDesc of chunkDescs) {
        const chunk = allChunks.find((c) => c.chunkId === chunkDesc.chunkId);
        if (!chunk)
            continue;
        const chunkSize = getChunkSize(chunk);
        if (size + chunkSize > batchSize && chunks.length) {
            break;
        }
        chunks.push(chunk);
        size += chunkSize;
    }
    return chunks;
}
function getChunkSize(chunk) {
    // This is all an approximation
    let size = chunk.fileName.length + 50;
    for (const blob of chunk.blobs) {
        size += blob.lines.join("").length + 4 * blob.lines.length;
    }
    return size;
}
//# sourceMappingURL=batching.js.map