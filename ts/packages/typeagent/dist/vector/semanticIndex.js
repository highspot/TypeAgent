"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSemanticIndex = void 0;
const aiclient_1 = require("aiclient");
const vectorIndex_1 = require("./vectorIndex");
const embeddings_1 = require("./embeddings");
/**
 * Creates a SemanticIndex OVER an implementation of a VectorStore but does embedding generation itself.
 * Automatically creates embeddings for text... both at time of put and at time of nearestNeighbor
 * The store can be in-memory (such as in this library), local, remote (Azure) etc.
 * @param store vector store to use
 * @param model model to embed with
 * @returns
 */
function createSemanticIndex(store, model) {
    model ??= aiclient_1.openai.createEmbeddingModel();
    return {
        store,
        getEmbedding,
        put,
        putMultiple,
        nearestNeighbor,
        nearestNeighbors,
    };
    async function getEmbedding(text) {
        return (0, vectorIndex_1.generateEmbedding)(model, text);
    }
    async function put(text, id, onlyIfNew) {
        if (id && onlyIfNew) {
            if (store.exists(id)) {
                return id;
            }
        }
        const embedding = await (0, vectorIndex_1.generateEmbeddingWithRetry)(model, text);
        return store.put(embedding, id);
    }
    async function putMultiple(items, onlyIfNew, concurrency) {
        concurrency ??= 1;
        let pendingPositions;
        let textBatch;
        // First, collect the texts that need embeddings
        for (let i = 0; i < items.length; ++i) {
            const [text, id] = items[i];
            if (id && onlyIfNew) {
                if (store.exists(id)) {
                    continue;
                }
            }
            pendingPositions ??= [];
            textBatch ??= [];
            pendingPositions.push(i);
            textBatch.push(text);
        }
        if (pendingPositions &&
            pendingPositions.length > 0 &&
            textBatch &&
            textBatch.length > 0) {
            const embeddings = await (0, vectorIndex_1.generateTextEmbeddingsWithRetry)(model, textBatch);
            // Add them
            for (let i = 0; i < textBatch.length; ++i) {
                const index = pendingPositions[i];
                let id = items[index][1];
                id = await store.put(embeddings[i], id);
                items[index][1] = id;
            }
        }
        return items;
    }
    async function nearestNeighbor(value, minScore) {
        const embedding = await (0, vectorIndex_1.generateEmbedding)(model, value);
        // Since we normalize our embeddings, Dot is faster
        return store.nearestNeighbor(embedding, embeddings_1.SimilarityType.Dot, minScore);
    }
    async function nearestNeighbors(value, maxMatches, minScore) {
        const embedding = await (0, vectorIndex_1.generateEmbedding)(model, value);
        // Since we normalize our embeddings, Dot is faster
        return store.nearestNeighbors(embedding, maxMatches, embeddings_1.SimilarityType.Dot, minScore);
    }
}
exports.createSemanticIndex = createSemanticIndex;
//# sourceMappingURL=semanticIndex.js.map