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
const typechat_1 = require("typechat");
const testCore_js_1 = require("./testCore.js");
const openai_js_1 = require("../src/openai.js");
const testTimeout = 30000;
const smallEndpoint = "3_SMALL";
describe("openai.textEmbeddings", () => {
    const texts = [
        "Bach ate pizza while composing fugues",
        "Shakespeare did handstands while writing Macbeth",
    ];
    let standardModel;
    beforeAll(() => {
        if ((0, testCore_js_1.hasEmbeddingModel)()) {
            standardModel = (0, openai_js_1.createEmbeddingModel)();
        }
    });
    (0, testCore_js_1.testIf)(testCore_js_1.hasEmbeddingModel, "generate", async () => {
        await testEmbeddings(standardModel, texts[0]);
    }, testTimeout);
    (0, testCore_js_1.testIf)(testCore_js_1.hasEmbeddingModel, "generateBatch", async () => {
        if (standardModel.generateEmbeddingBatch) {
            const embeddings = (0, typechat_1.getData)(await standardModel.generateEmbeddingBatch(texts));
            expect(embeddings.length).toEqual(texts.length);
            for (const e of embeddings) {
                validateEmbedding(e);
            }
        }
    }, testTimeout);
    (0, testCore_js_1.testIf)(testCore_js_1.hasEmbeddingModel, "generateBatch.maxBatchSize", async () => {
        if (standardModel.generateEmbeddingBatch) {
            const inputs = new Array(standardModel.maxBatchSize + 1);
            inputs.fill("Foo");
            const result = await standardModel.generateEmbeddingBatch(inputs);
            expect(result.success).toBe(false);
        }
    }, testTimeout);
    (0, testCore_js_1.testIf)(() => (0, testCore_js_1.hasEmbeddingEndpoint)(smallEndpoint), "generateSmall", async () => {
        let model = (0, openai_js_1.createEmbeddingModel)(smallEndpoint);
        await testEmbeddings(model, texts[0]);
        let dimensions = 512;
        model = (0, openai_js_1.createEmbeddingModel)(smallEndpoint, dimensions);
        await testEmbeddings(model, texts[0], dimensions);
    }, testTimeout);
    (0, testCore_js_1.testIf)(() => (0, testCore_js_1.hasApiSettings)(openai_js_1.EnvVars.AZURE_OPENAI_API_KEY), "createDefault", () => {
        const model = (0, openai_js_1.createChatModelDefault)("test");
        expect(model.completionSettings.response_format).toBeDefined();
        expect(model.completionSettings.response_format?.type).toBe("json_object");
    });
    async function testEmbeddings(model, text, dimensions) {
        const embedding = (0, typechat_1.getData)(await model.generateEmbedding(text));
        validateEmbedding(embedding, dimensions);
    }
    function validateEmbedding(embedding, dimensions) {
        expect(embedding).not.toBeUndefined();
        expect(embedding.length).toBeGreaterThan(0);
        if (dimensions) {
            expect(embedding.length).toBe(dimensions);
        }
    }
});
//# sourceMappingURL=openai.spec.js.map