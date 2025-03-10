"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomEmbedding = exports.testIf = exports.testDirectoryPath = exports.hasEmbeddingModel = void 0;
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const aiclient_1 = require("aiclient");
function hasEmbeddingModel(endpoint) {
    return (0, aiclient_1.hasEnvSettings)(process.env, aiclient_1.openai.EnvVars.AZURE_OPENAI_API_KEY_EMBEDDING, endpoint);
}
exports.hasEmbeddingModel = hasEmbeddingModel;
function testDirectoryPath(subPath) {
    return path_1.default.join(os_1.default.tmpdir(), subPath);
}
exports.testDirectoryPath = testDirectoryPath;
function testIf(runIf, name, fn, testTimeout) {
    if (!runIf()) {
        return test.skip(name, () => { });
    }
    return test(name, fn, testTimeout);
}
exports.testIf = testIf;
function generateRandomEmbedding(length) {
    const embedding = new Float32Array(length);
    for (let i = 0; i < length; ++i) {
        embedding[i] = Math.random();
    }
    return embedding;
}
exports.generateRandomEmbedding = generateRandomEmbedding;
//# sourceMappingURL=common.js.map