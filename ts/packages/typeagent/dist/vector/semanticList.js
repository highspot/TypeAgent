"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSemanticList = void 0;
const embeddings_1 = require("./embeddings");
const vectorIndex_1 = require("./vectorIndex");
const assert_1 = __importDefault(require("assert"));
const async_1 = require("../async");
function createSemanticList(model, existingValues, stringify) {
    let values = existingValues ?? [];
    return {
        values,
        push,
        pushMultiple,
        pushValue,
        indexOf,
        indexesOf,
        nearestNeighbor,
        nearestNeighbors,
    };
    async function push(value, stringValue, retryMaxAttempts, retryPauseMs) {
        await (0, async_1.callWithRetry)(async () => {
            const embedding = await (0, vectorIndex_1.generateEmbedding)(model, toString(value, stringValue));
            pushValue({ value, embedding });
        }, retryMaxAttempts, retryPauseMs);
    }
    async function pushMultiple(values, retryMaxAttempts, retryPauseMs, concurrency) {
        // Generate embeddings in parallel
        const valueStrings = values.map((v) => toString(v));
        await (0, async_1.callWithRetry)(async () => {
            const embeddings = await (0, vectorIndex_1.generateTextEmbeddings)(model, valueStrings, concurrency);
            (0, assert_1.default)(values.length === embeddings.length);
            for (let i = 0; i < values.length; ++i) {
                pushValue({ value: values[i], embedding: embeddings[i] });
            }
        }, retryMaxAttempts, retryPauseMs);
    }
    function pushValue(value) {
        values.push(value);
    }
    async function nearestNeighbor(value) {
        const match = await indexOf(value);
        if (match.item === -1) {
            return undefined;
        }
        else {
            return { score: match.score, item: values[match.item].value };
        }
    }
    async function nearestNeighbors(value, maxMatches, minScore) {
        const matches = await indexesOf(value, maxMatches, minScore);
        return matches.map((m) => {
            return {
                score: m.score,
                item: values[m.item].value,
            };
        });
    }
    async function indexOf(value) {
        const embedding = await (0, vectorIndex_1.generateEmbedding)(model, value);
        return indexOfNearest(values, embedding, embeddings_1.SimilarityType.Dot);
    }
    async function indexesOf(value, maxMatches, minScore) {
        minScore ??= 0;
        const embedding = await (0, vectorIndex_1.generateEmbedding)(model, value);
        return indexesOfNearest(values, embedding, maxMatches, embeddings_1.SimilarityType.Dot, minScore);
    }
    function toString(value, stringValue) {
        if (!stringValue) {
            if (stringify) {
                stringValue = stringify(value);
            }
            else if (typeof value === "string") {
                stringValue = value;
            }
            else {
                stringValue = JSON.stringify(value);
            }
        }
        return stringValue;
    }
    function indexOfNearest(list, other, type) {
        let best = { score: Number.MIN_VALUE, item: -1 };
        for (let i = 0; i < list.length; ++i) {
            const score = (0, embeddings_1.similarity)(list[i].embedding, other, type);
            if (score > best.score) {
                best.score = score;
                best.item = i;
            }
        }
        return best;
    }
    function indexesOfNearest(list, other, maxMatches, type, minScore = 0) {
        const matches = new embeddings_1.TopNCollection(maxMatches, -1);
        for (let i = 0; i < list.length; ++i) {
            const score = (0, embeddings_1.similarity)(list[i].embedding, other, type);
            if (score >= minScore) {
                matches.push(i, score);
            }
        }
        return matches.byRank();
    }
}
exports.createSemanticList = createSemanticList;
//# sourceMappingURL=semanticList.js.map