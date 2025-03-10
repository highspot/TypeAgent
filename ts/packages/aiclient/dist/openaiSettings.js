"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.openAIApiSettingsFromEnv = void 0;
const openai_1 = require("./openai");
const common_1 = require("./common");
const openai_2 = require("./openai");
/**
 * Load settings for the OpenAI services from env
 * @param modelType Chat or Embedding
 * @param env Environment variables
 * @param endpointName Name of endpoint, e.g. GPT_35_TURBO or PHI3. This is appended as a suffix to base environment key
 * @param requireEndpoint If false (default), falls back to using non-endpoint specific settings
 * @returns
 */
function openAIApiSettingsFromEnv(modelType, env, endpointName, requireEndpoint = false) {
    env ??= process.env;
    return {
        provider: "openai",
        modelType: modelType,
        apiKey: (0, common_1.getEnvSetting)(env, openai_1.EnvVars.OPENAI_API_KEY, endpointName),
        endpoint: (0, common_1.getEnvSetting)(env, modelType === openai_2.ModelType.Chat
            ? openai_1.EnvVars.OPENAI_ENDPOINT
            : openai_1.EnvVars.OPENAI_ENDPOINT_EMBEDDING, endpointName, undefined, requireEndpoint),
        modelName: (0, common_1.getEnvSetting)(env, modelType === openai_2.ModelType.Chat
            ? openai_1.EnvVars.OPENAI_MODEL
            : openai_1.EnvVars.OPENAI_MODEL_EMBEDDING, endpointName),
        organization: (0, common_1.getEnvSetting)(env, openai_1.EnvVars.OPENAI_ORGANIZATION, endpointName),
        supportsResponseFormat: (0, common_1.getEnvSetting)(env, openai_1.EnvVars.OPENAI_RESPONSE_FORMAT, endpointName, "0") === "1",
        maxConcurrency: (0, common_1.getIntFromEnv)(env, openai_1.EnvVars.OPENAI_MAX_CONCURRENCY, endpointName),
        enableModelRequestLogging: (0, common_1.getEnvSetting)(env, openai_1.EnvVars.ENABLE_MODEL_REQUEST_LOGGING, endpointName, "false") === "true",
    };
}
exports.openAIApiSettingsFromEnv = openAIApiSettingsFromEnv;
//# sourceMappingURL=openaiSettings.js.map