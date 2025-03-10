"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.testIf = exports.skipTest = exports.hasApiSettings = exports.hasEmbeddingEndpoint = exports.hasEmbeddingModel = void 0;
const common_js_1 = require("../src/common.js");
const index_js_1 = require("../src/index.js");
function hasEmbeddingModel() {
    return hasApiSettings(index_js_1.openai.EnvVars.AZURE_OPENAI_API_KEY_EMBEDDING);
}
exports.hasEmbeddingModel = hasEmbeddingModel;
function hasEmbeddingEndpoint(endpoint) {
    return hasApiSettings(index_js_1.openai.EnvVars.AZURE_OPENAI_ENDPOINT_EMBEDDING, endpoint);
}
exports.hasEmbeddingEndpoint = hasEmbeddingEndpoint;
function hasApiSettings(key, endpoint) {
    return (0, common_js_1.hasEnvSettings)(process.env, key, endpoint);
}
exports.hasApiSettings = hasApiSettings;
function skipTest(name) {
    return test.skip(name, () => { });
}
exports.skipTest = skipTest;
function testIf(runIf, name, fn, testTimeout) {
    if (!runIf()) {
        return test.skip(name, () => { });
    }
    return test(name, fn, testTimeout);
}
exports.testIf = testIf;
//# sourceMappingURL=testCore.js.map