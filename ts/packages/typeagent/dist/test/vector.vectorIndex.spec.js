"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({
    path: path_1.default.join(__dirname, "../../../../.env"),
});
const aiclient_1 = require("aiclient");
const common_1 = require("./common");
const vectorIndex_1 = require("../src/vector/vectorIndex");
const vector_1 = require("../src/vector/vector");
const semanticList_1 = require("../src/vector/semanticList");
const semanticMap_1 = require("../src/vector/semanticMap");
const semanticIndex_1 = require("../src/vector/semanticIndex");
const embeddingFS_1 = require("../src/storage/embeddingFS");
const objStream_1 = require("../src/objStream");
describe("vector.vectorIndex", () => {
    const timeoutMs = 5 * 1000 * 60;
    let model;
    beforeAll(() => {
        if ((0, common_1.hasEmbeddingModel)()) {
            model = aiclient_1.openai.createEmbeddingModel();
        }
    });
    test("dot", () => {
        const length = 1536;
        const x = (0, common_1.generateRandomEmbedding)(length);
        const y = (0, common_1.generateRandomEmbedding)(length);
        const dot = (0, vector_1.dotProduct)(x, y);
        const dot2 = (0, vector_1.dotProductSimple)(x, y);
        expect(dot).toEqual(dot2);
    });
    test("cosine", () => {
        const length = 1536;
        const x = (0, common_1.generateRandomEmbedding)(length);
        const y = (0, common_1.generateRandomEmbedding)(length);
        const cosine = (0, vector_1.cosineSimilarityLoop)(x, y, (0, vector_1.euclideanLength)(y));
        const cosine2 = (0, vector_1.cosineSimilarity)(x, y);
        expect(cosine).toEqual(cosine2);
    });
    (0, common_1.testIf)(common_1.hasEmbeddingModel, "generateEmbeddings", async () => {
        const strings = [
            "Apples and Bananas",
            "Dolphins and Whales",
            "Mountains and Streams",
            "Science and Technology",
        ];
        const embeddings = await (0, vectorIndex_1.generateTextEmbeddings)(model, strings);
        expect(embeddings).toHaveLength(strings.length);
    }, timeoutMs);
    const smallStrings = [
        "object",
        "person",
        "composer",
        "instrument",
        "book",
        "movie",
        "dog",
        "cat",
        "computer",
        "phone",
    ];
    (0, common_1.testIf)(common_1.hasEmbeddingModel, "semanticIndex", async () => {
        const storePath = (0, common_1.testDirectoryPath)("semanticIndex");
        await (0, objStream_1.removeDir)(storePath);
        const store = await (0, embeddingFS_1.createEmbeddingFolder)(storePath);
        const semanticIndex = await (0, semanticIndex_1.createSemanticIndex)(store, model);
        let entries = smallStrings.map((s, index) => [
            s,
            index.toString(),
        ]);
        let halfEntries = entries.slice(0, entries.length / 2);
        let halfEntriesAdded = await semanticIndex.putMultiple(halfEntries, true);
        expect(halfEntriesAdded.length).toBe(halfEntries.length);
        let entriesAdded = await semanticIndex.putMultiple(entries, true);
        expect(entriesAdded.length).toBe(entries.length);
        for (let i = 0; i < entries.length; ++i) {
            const entry = entries[i];
            expect(semanticIndex.store.get(entry[1])).toBeTruthy();
            expect(entry[1]).toEqual(entriesAdded[i][1]);
        }
        for (let i = 0; i < halfEntriesAdded.length; ++i) {
            expect(halfEntriesAdded[i][1]).toEqual(entriesAdded[i][1]);
        }
    }, timeoutMs);
    (0, common_1.testIf)(common_1.hasEmbeddingModel, "semanticList", async () => {
        const semanticList = (0, semanticList_1.createSemanticList)(model);
        await semanticList.pushMultiple(smallStrings);
        expect(semanticList.values).toHaveLength(smallStrings.length);
        for (let i = 0; i < smallStrings.length; ++i) {
            const item = semanticList.values[i];
            const embedding = item.embedding;
            const match = await semanticList.nearestNeighbor(embedding);
            expect(match).toBeDefined();
            if (match) {
                expect(match.item).toBe(item.value);
            }
        }
        // add one more
        await semanticList.push("The last string");
        expect(semanticList.values).toHaveLength(smallStrings.length + 1);
    }, timeoutMs);
    (0, common_1.testIf)(common_1.hasEmbeddingModel, "semanticMap", async () => {
        const semanticMap = await (0, semanticMap_1.createSemanticMap)(model);
        // First add some of the strings
        const firstHalf = smallStrings.slice(0, 5);
        await semanticMap.setMultiple(firstHalf.map((s) => [s, s]));
        expect(semanticMap.size).toBe(firstHalf.length);
        // Now add all the strings. This should only add the new strings
        await semanticMap.setMultiple(smallStrings.map((s) => [s, s]));
        expect(semanticMap.size).toBe(smallStrings.length);
        const match = await semanticMap.getNearest(smallStrings[0]);
        expect(match).toBeDefined();
        if (match) {
            expect(match.item).toBe(smallStrings[0]);
        }
        // add one more
        await semanticMap.set("The last string", "abc");
        expect(semanticMap.size).toBe(smallStrings.length + 1);
    }, timeoutMs);
});
//# sourceMappingURL=vector.vectorIndex.spec.js.map