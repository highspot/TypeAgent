"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTextEmbeddingsWithRetry = exports.generateTextEmbeddings = exports.generateEmbeddingWithRetry = exports.generateEmbedding = void 0;
const __1 = require("..");
const async_1 = require("../async");
const embeddings_1 = require("./embeddings");
const typechat_1 = require("typechat");
const DefaultRetryPauseMs = 2500;
const DefaultRetryAttempts = 3;
/**
 * Generates a normalized embedding for the given value from the embedding model
 * Batch support is available for text embeddings (see generateTextEmbeddings)
 * @param model embedding model
 * @param value value to generate an embedding for
 * @returns
 */
async function generateEmbedding(model, value) {
    if (isEmbedding(value)) {
        return value;
    }
    const result = await model.generateEmbedding(value);
    return (0, embeddings_1.createNormalized)((0, typechat_1.getData)(result));
}
exports.generateEmbedding = generateEmbedding;
/**
 * Generate an embedding for a single value
 * Batch support is available for text embeddings (see generateTextEmbeddings)
 * @param model embedding model
 * @param value value to generate an embedding for
 */
async function generateEmbeddingWithRetry(model, value, retryMaxAttempts = DefaultRetryAttempts, retryPauseMs = DefaultRetryPauseMs) {
    return (0, async_1.callWithRetry)(() => generateEmbedding(model, value), retryMaxAttempts, retryPauseMs);
}
exports.generateEmbeddingWithRetry = generateEmbeddingWithRetry;
/**
 * Generate embeddings in parallel
 * Uses batching if model supports it
 * @param model
 * @param values strings for which to generate embeddings
 * @param maxCharsPerChunk Models can limit the total # of chars per batch
 * @param concurrency default is 2
 * @returns
 */
async function generateTextEmbeddings(model, values, concurrency, maxCharsPerChunk = Number.MAX_SAFE_INTEGER) {
    // Verify that none of the individual strings are too long
    if (values.some((s) => s.length > maxCharsPerChunk)) {
        throw new Error(`Values contains string with length > ${maxCharsPerChunk}`);
    }
    concurrency ??= 1;
    if (model.maxBatchSize > 1 && model.generateEmbeddingBatch) {
        const chunks = [
            ...__1.collections.getStringChunks(values, model.maxBatchSize, maxCharsPerChunk),
        ];
        const embeddingChunks = await __1.asyncArray.mapAsync(chunks, concurrency, (c) => generateEmbeddingBatch(model, c));
        return embeddingChunks.flat();
    }
    else {
        // Run generateEmbeddings in parallel
        return __1.asyncArray.mapAsync(values, concurrency, (v) => generateEmbedding(model, v));
    }
}
exports.generateTextEmbeddings = generateTextEmbeddings;
/**
 * Same as generateTextEmbeddings, but with retries
 * @param model
 * @param values
 * @param retryMaxAttempts
 * @param retryPauseMs
 * @param maxCharsPerChunk
 * @returns
 */
async function generateTextEmbeddingsWithRetry(model, values, retryMaxAttempts = DefaultRetryAttempts, retryPauseMs = DefaultRetryPauseMs, maxCharsPerChunk = Number.MAX_SAFE_INTEGER) {
    return (0, async_1.callWithRetry)(() => generateTextEmbeddings(model, values, maxCharsPerChunk), retryMaxAttempts, retryPauseMs);
}
exports.generateTextEmbeddingsWithRetry = generateTextEmbeddingsWithRetry;
async function generateEmbeddingBatch(model, values) {
    if (model.generateEmbeddingBatch === undefined) {
        throw new Error("Model does not support batch operations");
    }
    const embeddings = (0, typechat_1.getData)(await model.generateEmbeddingBatch(values));
    return embeddings.map((e) => (0, embeddings_1.createNormalized)(e));
}
function isEmbedding(value) {
    return value instanceof Float32Array;
}
//# sourceMappingURL=vectorIndex.js.map