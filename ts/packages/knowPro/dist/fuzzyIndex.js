// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { generateTextEmbeddingsWithRetry, generateEmbedding, generateTextEmbeddings, indexesOfNearest, SimilarityType, indexesOfAllNearest, createTopNList, } from "typeagent";
import { openai } from "aiclient";
import * as levenshtein from "fast-levenshtein";
import { createEmbeddingCache } from "knowledge-processor";
export class TextEmbeddingIndex {
    constructor(settings) {
        this.settings = settings;
        this.embeddings = [];
    }
    get size() {
        return this.embeddings.length;
    }
    async addText(texts) {
        if (Array.isArray(texts)) {
            const embeddings = await generateTextEmbeddingsWithRetry(this.settings.embeddingModel, texts);
            this.embeddings.push(...embeddings);
        }
        else {
            const embedding = await generateEmbedding(this.settings.embeddingModel, texts);
            this.embeddings.push(embedding);
        }
    }
    async addTextBatch(textToIndex, eventHandler) {
        for (const batch of getIndexingBatches(textToIndex, this.settings.batchSize)) {
            if (eventHandler?.onEmbeddingsCreated &&
                !eventHandler.onEmbeddingsCreated(textToIndex, batch.values, batch.startAt)) {
                break;
            }
            await this.addText(batch.values);
        }
    }
    get(pos) {
        return this.embeddings[pos];
    }
    add(embedding) {
        this.embeddings.push(embedding);
    }
    async getIndexesOfNearest(text, maxMatches, minScore) {
        const textEmbedding = await generateEmbedding(this.settings.embeddingModel, text);
        return this.indexesOfNearestText(textEmbedding, maxMatches, minScore);
    }
    async getIndexesOfNearestMultiple(textArray, maxMatches, minScore) {
        const textEmbeddings = await generateTextEmbeddings(this.settings.embeddingModel, textArray);
        const results = [];
        for (const embedding of textEmbeddings) {
            results.push(await this.getIndexesOfNearest(embedding, maxMatches, minScore));
        }
        return results;
    }
    removeAt(pos) {
        this.embeddings.splice(pos, 1);
    }
    clear() {
        this.embeddings = [];
    }
    serialize() {
        return this.embeddings;
    }
    deserialize(embeddings) {
        this.embeddings = embeddings;
    }
    indexesOfNearestText(textEmbedding, maxMatches, minScore) {
        maxMatches ??= this.settings.maxMatches;
        minScore ??= this.settings.minScore;
        let matches;
        if (maxMatches && maxMatches > 0) {
            matches = indexesOfNearest(this.embeddings, textEmbedding, maxMatches, SimilarityType.Dot, minScore);
        }
        else {
            matches = indexesOfAllNearest(this.embeddings, textEmbedding, SimilarityType.Dot, minScore);
        }
        return matches;
    }
}
export function serializeEmbedding(embedding) {
    return Array.from(embedding);
}
export function deserializeEmbedding(array) {
    return new Float32Array(array);
}
export function createTextEmbeddingIndexSettings(minScore = 0.85) {
    return {
        embeddingModel: createEmbeddingCache(openai.createEmbeddingModel(), 64),
        embeddingSize: 1536,
        minScore,
        retryMaxAttempts: 2,
        retryPauseMs: 2000,
        batchSize: 8,
    };
}
export class TextEditDistanceIndex {
    constructor(textArray = []) {
        this.textArray = textArray;
    }
    getNearest(text, maxMatches, maxEditDistance) {
        const matches = nearestNeighborEditDistance(this.textArray, text, maxMatches, maxEditDistance);
        return Promise.resolve(matches);
    }
    getNearestMultiple(textArray, maxMatches, maxEditDistance) {
        const matches = textArray.map((text) => nearestNeighborEditDistance(this.textArray, text, maxMatches, maxEditDistance));
        return Promise.resolve(matches);
    }
}
export function nearestNeighborEditDistance(textList, other, maxMatches, maxEditDistance) {
    maxEditDistance ??= 0;
    if (maxMatches !== undefined && maxMatches > 0) {
        const matches = createTopNList(maxMatches);
        for (const text of textList) {
            const distance = levenshtein.get(text, other);
            // We want to return those with an edit distance < than the min
            if (distance <= maxEditDistance) {
                matches.push(text, distance);
            }
        }
        return matches.byRank();
    }
    else {
        const matches = [];
        for (const text of textList) {
            const distance = levenshtein.get(text, other);
            if (distance <= maxEditDistance) {
                matches.push({ item: text, score: distance });
            }
        }
        matches.sort((x, y) => y.score - x.score);
        return matches;
    }
}
function* getIndexingBatches(array, size) {
    for (let i = 0; i < array.length; i += size) {
        const batch = array.slice(i, i + size);
        if (batch.length === 0) {
            break;
        }
        yield { startAt: i, values: batch };
    }
}
export function serializeEmbeddings(embeddings) {
    const buffers = embeddings.map((e) => Buffer.from(e.buffer));
    return Buffer.concat(buffers);
}
export function deserializeEmbeddings(buffer, embeddingSize) {
    const embeddings = [];
    const embeddingByteCount = Float32Array.BYTES_PER_ELEMENT * embeddingSize;
    for (let startAt = 0; startAt < buffer.length; startAt += embeddingByteCount) {
        const sliceStartAt = buffer.byteOffset + startAt;
        const embedding = new Float32Array(buffer.buffer.slice(sliceStartAt, sliceStartAt + embeddingByteCount));
        embeddings.push(embedding);
    }
    return embeddings;
}
//# sourceMappingURL=fuzzyIndex.js.map