"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.azureApiSettingsFromEnv = void 0;
const auth_1 = require("./auth");
const common_1 = require("./common");
const openai_1 = require("./openai");
const IdentityApiKey = "identity";
const azureTokenProvider = (0, auth_1.createAzureTokenProvider)(auth_1.AzureTokenScopes.CogServices);
/**
 * Load settings for the Azure OpenAI services from env
 * @param modelType
 * @param env
 * @returns
 */
function azureApiSettingsFromEnv(modelType, env, endpointName) {
    env ??= process.env;
    const settings = modelType == openai_1.ModelType.Chat
        ? azureChatApiSettingsFromEnv(env, endpointName)
        : modelType == openai_1.ModelType.Image
            ? azureImageApiSettingsFromEnv(env, endpointName)
            : azureEmbeddingApiSettingsFromEnv(env, endpointName);
    if (settings.apiKey.toLowerCase() === IdentityApiKey) {
        settings.tokenProvider = azureTokenProvider;
    }
    return settings;
}
exports.azureApiSettingsFromEnv = azureApiSettingsFromEnv;
/**
 * Load settings for the Azure OpenAI Chat Api from env
 * @param env
 * @returns
 */
function azureChatApiSettingsFromEnv(env, endpointName) {
    return {
        provider: "azure",
        modelType: openai_1.ModelType.Chat,
        apiKey: (0, common_1.getEnvSetting)(env, openai_1.EnvVars.AZURE_OPENAI_API_KEY, endpointName),
        endpoint: (0, common_1.getEnvSetting)(env, openai_1.EnvVars.AZURE_OPENAI_ENDPOINT, endpointName),
        supportsResponseFormat: (0, common_1.getEnvSetting)(env, openai_1.EnvVars.AZURE_OPENAI_RESPONSE_FORMAT, endpointName, "0") === "1",
        maxConcurrency: (0, common_1.getIntFromEnv)(env, openai_1.EnvVars.AZURE_OPENAI_MAX_CONCURRENCY, endpointName),
        maxPromptChars: (0, common_1.getIntFromEnv)(env, openai_1.EnvVars.AZURE_OPENAI_MAX_CHARS, endpointName),
        enableModelRequestLogging: (0, common_1.getEnvSetting)(env, openai_1.EnvVars.ENABLE_MODEL_REQUEST_LOGGING, undefined, "false") === "true",
    };
}
/**
 * Load settings for the Azure OpenAI Embedding service from env
 * @param env
 * @returns
 */
function azureEmbeddingApiSettingsFromEnv(env, endpointName) {
    return {
        provider: "azure",
        modelType: openai_1.ModelType.Embedding,
        apiKey: (0, common_1.getEnvSetting)(env, openai_1.EnvVars.AZURE_OPENAI_API_KEY_EMBEDDING, endpointName),
        endpoint: (0, common_1.getEnvSetting)(env, openai_1.EnvVars.AZURE_OPENAI_ENDPOINT_EMBEDDING, endpointName),
    };
}
/**
 * Load settings for the Azure OpenAI Image service from env
 * @param env
 * @returns
 */
function azureImageApiSettingsFromEnv(env, endpointName) {
    return {
        provider: "azure",
        modelType: openai_1.ModelType.Image,
        apiKey: (0, common_1.getEnvSetting)(env, openai_1.EnvVars.AZURE_OPENAI_API_KEY_DALLE, endpointName),
        endpoint: (0, common_1.getEnvSetting)(env, openai_1.EnvVars.AZURE_OPENAI_ENDPOINT_DALLE, endpointName),
    };
}
//# sourceMappingURL=azureSettings.js.map