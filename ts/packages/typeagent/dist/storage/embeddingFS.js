"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmbeddingFolder = void 0;
const embeddings_1 = require("../vector/embeddings");
const objectFolder_1 = require("./objectFolder");
const __1 = require("..");
async function createEmbeddingFolder(folderPath, folderSettings, concurrency, fSys) {
    concurrency ??= 2;
    const settings = {
        serializer: (obj) => obj,
        deserializer: (buffer) => new Float32Array(buffer.buffer),
    };
    if (folderSettings) {
        settings.cacheNames = folderSettings.cacheNames;
        settings.useWeakRefs = folderSettings.useWeakRefs;
    }
    const folder = await (0, objectFolder_1.createObjectFolder)(folderPath, settings, fSys);
    return {
        ...folder,
        nearestNeighbor,
        nearestNeighbors,
        nearestNeighborsInSubset,
    };
    async function nearestNeighbor(embedding, similarity) {
        const entries = await loadEntries();
        const match = (0, embeddings_1.indexOfNearest)(entries.embeddings, embedding, similarity);
        if (match.item < 0) {
            return undefined;
        }
        return {
            item: entries.names[match.item],
            score: match.score,
        };
    }
    async function nearestNeighbors(embedding, maxMatches, similarity, minScore) {
        if (maxMatches === 1) {
            const match = await nearestNeighbor(embedding, similarity);
            if (!match) {
                return [];
            }
            const matches = [];
            if (!minScore || match.score >= minScore) {
                matches.push(match);
            }
            return matches;
        }
        const entries = await loadEntries();
        const matches = (0, embeddings_1.indexesOfNearest)(entries.embeddings, embedding, maxMatches, similarity, minScore ?? Number.MIN_VALUE);
        return matches.map((m) => {
            return {
                item: entries.names[m.item],
                score: m.score,
            };
        });
    }
    async function nearestNeighborsInSubset(embedding, subsetIds, maxMatches, similarity, minScore) {
        const entries = await loadEntriesSubset(subsetIds);
        const matches = (0, embeddings_1.indexesOfNearest)(entries.embeddings, embedding, maxMatches, similarity, minScore ?? Number.MIN_VALUE);
        return matches.map((m) => {
            return {
                item: entries.names[m.item],
                score: m.score,
            };
        });
    }
    async function loadEntries() {
        const names = await folder.allNames();
        let loadedEmbeddings = await __1.asyncArray.mapAsync(names, concurrency, (name) => folder.get(name));
        let embeddings = loadedEmbeddings.filter((e) => e !== undefined);
        return { names, embeddings };
    }
    async function loadEntriesSubset(nameSubset) {
        // TODO: parallelize
        let names = [];
        let embeddings = [];
        for (const name of nameSubset) {
            const entry = await folder.get(name);
            if (entry) {
                names.push(name);
                embeddings.push(entry);
            }
        }
        return { names, embeddings };
    }
}
exports.createEmbeddingFolder = createEmbeddingFolder;
//# sourceMappingURL=embeddingFS.js.map