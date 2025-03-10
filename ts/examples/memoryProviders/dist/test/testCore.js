// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import path from "path";
import os from "node:os";
import { createNormalized, ensureDir } from "typeagent";
import { hasEnvSettings, openai } from "aiclient";
import * as knowLib from "knowledge-processor";
export function skipTest(name) {
    return test.skip(name, () => { });
}
export function testIf(name, runIf, fn, testTimeout) {
    if (!runIf()) {
        return test.skip(name, () => { });
    }
    return test(name, fn, testTimeout);
}
export function hasEmbeddingEndpoint(endpoint) {
    return hasEnvSettings(process.env, openai.EnvVars.AZURE_OPENAI_ENDPOINT_EMBEDDING, endpoint);
}
export function createEmbeddingModel(endpoint, dimensions) {
    const settings = openai.apiSettingsFromEnv(openai.ModelType.Embedding, process.env, endpoint);
    return openai.createEmbeddingModel(settings, dimensions);
}
export async function ensureTestDir() {
    return ensureDir(getRootDataPath());
}
export function getRootDataPath() {
    return path.join(os.tmpdir(), "/data/tests/memoryProviders");
}
export function testFilePath(fileName) {
    return path.join(getRootDataPath(), fileName);
}
export function generateTestEmbedding(value, length) {
    const embedding = new Array(length);
    embedding.fill(value);
    return createNormalized(embedding);
}
export function generateRandomTestEmbedding(length) {
    const embedding = [];
    for (let i = 0; i < length; ++i) {
        embedding[i] = Math.random();
    }
    return createNormalized(embedding);
}
export function generateRandomTestEmbeddings(length, count) {
    const embeddings = [];
    for (let i = 0; i < count; ++i) {
        embeddings.push(generateRandomTestEmbedding(length));
    }
    return embeddings;
}
export function composers(offset) {
    const blocks = [
        {
            type: knowLib.TextBlockType.Raw,
            value: "Bach",
            sourceIds: [1, 3, 5, 7],
        },
        {
            type: knowLib.TextBlockType.Raw,
            value: "Debussy",
            sourceIds: [2, 3, 4, 7],
        },
        {
            type: knowLib.TextBlockType.Raw,
            value: "Gershwin",
            sourceIds: [1, 5, 8, 9],
        },
    ];
    if (offset) {
        blocks.forEach((b) => {
            const sourceIds = b.sourceIds;
            for (let i = 0; i < sourceIds.length; ++i) {
                sourceIds[i] = sourceIds[i] + offset;
            }
        });
    }
    return blocks;
}
export function fruits() {
    const blocks = [
        {
            type: knowLib.TextBlockType.Raw,
            value: "Banana",
            sourceIds: [11, 13, 15, 17],
        },
        {
            type: knowLib.TextBlockType.Raw,
            value: "Apple",
            sourceIds: [12, 13, 14, 17],
        },
        {
            type: knowLib.TextBlockType.Raw,
            value: "Peach",
            sourceIds: [11, 15, 18, 19],
        },
    ];
    return blocks;
}
export function uniqueSourceIds(blocks) {
    const set = new Set();
    for (const block of blocks) {
        block.sourceIds?.forEach((id) => set.add(id));
    }
    return [...set.values()].sort();
}
export function countSourceIds(blocks) {
    return blocks.reduce((total, b) => total + (b.sourceIds?.length ?? 0), 0);
}
//# sourceMappingURL=testCore.js.map