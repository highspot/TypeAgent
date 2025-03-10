"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMultiModalContentSupported = exports.getChatModelNames = exports.getChatModelMaxConcurrency = void 0;
const aiclient_1 = require("aiclient");
const ollamaModels_1 = require("./ollamaModels");
function getChatModelMaxConcurrency(userMaxConcurrency, endpoint, defaultConcurrency = 1) {
    const maxConcurrency = aiclient_1.openai.getChatModelSettings(endpoint).maxConcurrency;
    if (userMaxConcurrency === undefined) {
        return maxConcurrency ?? defaultConcurrency;
    }
    if (userMaxConcurrency <= 0) {
        return defaultConcurrency;
    }
    return maxConcurrency !== undefined
        ? Math.min(userMaxConcurrency, maxConcurrency)
        : userMaxConcurrency;
}
exports.getChatModelMaxConcurrency = getChatModelMaxConcurrency;
async function getChatModelNames() {
    const envKeys = Object.keys(process.env);
    const knownEnvKeys = Object.keys(aiclient_1.openai.EnvVars);
    const getPrefixedNames = (name) => {
        const prefix = `${name}_`;
        return envKeys
            .filter((key) => key.startsWith(prefix) &&
            knownEnvKeys.every((knownKey) => knownKey === name || !key.startsWith(knownKey)))
            .map((key) => key.replace(prefix, ""));
    };
    const azureNames = getPrefixedNames(aiclient_1.openai.EnvVars.AZURE_OPENAI_API_KEY);
    const openaiNames = getPrefixedNames(aiclient_1.openai.EnvVars.OPENAI_API_KEY).map((key) => `openai:${key}`);
    return [...azureNames, ...openaiNames, ...(await (0, ollamaModels_1.getOllamaModelNames)())];
}
exports.getChatModelNames = getChatModelNames;
function isMultiModalContentSupported(modelName) {
    if (modelName === undefined) {
        return false;
    }
    else if (modelName.toUpperCase() == "GPT_4_O" ||
        modelName.toUpperCase() == "GPT_V") {
        return true;
    }
    else if (modelName == "") {
        // default model is now 4_O
        return true;
    }
    return false;
}
exports.isMultiModalContentSupported = isMultiModalContentSupported;
//# sourceMappingURL=modelResource.js.map