// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import fs from "node:fs";
import { generateEmbeddingWithRetry, generateTextEmbeddingsWithRetry, similarity, SimilarityType, TopNCollection, } from "typeagent";
import { openai } from "aiclient";
import registerDebug from "debug";
const debug = registerDebug("typeagent:dispatcher:semantic");
export class ActionSchemaSemanticMap {
    constructor(model) {
        this.actionSemanticMaps = new Map();
        this.model = model ?? openai.createEmbeddingModel();
    }
    async addActionSchemaFile(config, actionSchemaFile, cache) {
        const keys = [];
        const definitions = [];
        if (this.actionSemanticMaps.has(config.schemaName)) {
            throw new Error(`Internal Error: Duplicate schemaName ${config.schemaName}`);
        }
        const actionSemanticMap = new Map();
        this.actionSemanticMaps.set(config.schemaName, actionSemanticMap);
        let reuseCount = 0;
        for (const [name, definition] of actionSchemaFile.actionSchemas) {
            const key = `${config.schemaName} ${name} ${definition.comments?.[0] ?? ""}`;
            const embedding = cache?.get(key);
            if (embedding) {
                actionSemanticMap.set(key, {
                    embedding,
                    actionSchemaFile,
                    definition,
                });
                reuseCount++;
            }
            else {
                keys.push(key);
                definitions.push(definition);
            }
        }
        debug(`Reused ${reuseCount}/${actionSchemaFile.actionSchemas.size} embeddings for ${config.schemaName} ${cache === undefined}`);
        const embeddings = await generateTextEmbeddingsWithRetry(this.model, keys);
        for (let i = 0; i < keys.length; i++) {
            actionSemanticMap.set(keys[i], {
                embedding: embeddings[i],
                actionSchemaFile,
                definition: definitions[i],
            });
        }
    }
    removeActionSchemaFile(schemaName) {
        this.actionSemanticMaps.delete(schemaName);
    }
    async nearestNeighbors(request, maxMatches, filter, minScore = 0) {
        const embedding = await generateEmbeddingWithRetry(this.model, request);
        const matches = new TopNCollection(maxMatches, {});
        for (const [name, actionSemanticMap] of this.actionSemanticMaps) {
            if (!filter(name)) {
                continue;
            }
            for (const entry of actionSemanticMap.values()) {
                const score = similarity(entry.embedding, embedding, SimilarityType.Dot);
                if (score >= minScore) {
                    matches.push(entry, score);
                }
            }
        }
        return matches.byRank();
    }
    embeddings() {
        const result = [];
        for (const actionSemanticMap of this.actionSemanticMaps.values()) {
            for (const [key, entry] of actionSemanticMap) {
                result.push([key, entry.embedding]);
            }
        }
        return result;
    }
}
function encodeEmbedding(embedding) {
    return btoa(String.fromCharCode(...new Uint8Array(embedding.buffer)));
}
function decodeEmbedding(embedding) {
    return new Float32Array(Uint8Array.from([...atob(embedding)].map((c) => c.charCodeAt(0))).buffer);
}
export async function writeEmbeddingCache(fileName, embeddings) {
    const entries = [];
    for (const embedding of embeddings) {
        entries.push([embedding[0], encodeEmbedding(embedding[1])]);
    }
    return fs.promises.writeFile(fileName, JSON.stringify(entries));
}
export async function readEmbeddingCache(fileName) {
    const data = JSON.parse(await fs.promises.readFile(fileName, "utf-8"));
    const cache = new Map();
    for (const entry of data) {
        cache.set(entry[0], decodeEmbedding(entry[1]));
    }
    return cache;
}
//# sourceMappingURL=actionSchemaSemanticMap.js.map