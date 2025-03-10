"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSemanticMap = void 0;
const aiclient_1 = require("aiclient");
const semanticList_1 = require("./semanticList");
async function createSemanticMap(model, existingValues) {
    model ??= aiclient_1.openai.createEmbeddingModel();
    const map = new Map();
    const semanticIndex = (0, semanticList_1.createSemanticList)(model);
    if (existingValues) {
        init(existingValues);
    }
    return {
        model,
        get size() {
            return map.size;
        },
        entries,
        keys,
        values: () => map.values(),
        has: (text) => map.has(text),
        get,
        set,
        setMultiple,
        getNearest,
        nearestNeighbors,
    };
    function* keys() {
        for (const key of semanticIndex.values) {
            yield key;
        }
    }
    function* entries() {
        for (const key of semanticIndex.values) {
            yield [key, map.get(key.value)];
        }
    }
    function get(text) {
        return map.get(text);
    }
    async function set(text, value, retryMaxAttempts, retryPauseMs) {
        // If new item, have to embed.
        if (!map.has(text)) {
            // New item. Must embed
            await semanticIndex.push(text, text, retryMaxAttempts, retryPauseMs);
        }
        map.set(text, value);
    }
    async function setMultiple(items, retryMaxAttempts, retryPauseMs, concurrency) {
        let newItems;
        for (const item of items) {
            let [text, value] = item;
            if (!map.has(text)) {
                newItems ??= [];
                newItems.push(text);
            }
            map.set(text, value);
        }
        if (newItems) {
            await semanticIndex.pushMultiple(newItems, retryMaxAttempts, retryPauseMs, concurrency);
        }
    }
    async function getNearest(text) {
        // First try an exact match
        if (typeof text === "string") {
            const exactMatch = map.get(text);
            if (exactMatch) {
                return {
                    score: 1,
                    item: exactMatch,
                };
            }
        }
        const key = await semanticIndex.nearestNeighbor(text);
        if (key !== undefined) {
            return valueFromScoredKey(key);
        }
        else {
            return undefined;
        }
    }
    async function nearestNeighbors(value, maxMatches, minScore) {
        const keys = await semanticIndex.nearestNeighbors(value, maxMatches, minScore);
        return keys.map((k) => valueFromScoredKey(k));
    }
    function valueFromScoredKey(match) {
        return {
            score: match.score,
            item: map.get(match.item),
        };
    }
    function init(entries) {
        for (const [key, value] of entries) {
            map.set(key.value, value);
            semanticIndex.pushValue(key);
        }
    }
}
exports.createSemanticMap = createSemanticMap;
//# sourceMappingURL=semanticMap.js.map