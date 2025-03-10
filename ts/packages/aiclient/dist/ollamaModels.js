"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOllamaChatModel = exports.ollamaApiSettingsFromEnv = exports.getOllamaModelNames = void 0;
const typechat_1 = require("typechat");
const common_1 = require("./common");
const openai_1 = require("./openai");
const restClient_1 = require("./restClient");
const tokenCounter_1 = require("./tokenCounter");
function getOllamaEndpointUrl(env) {
    return (0, common_1.getEnvSetting)(env, openai_1.EnvVars.OLLAMA_ENDPOINT, undefined, "http://localhost:11434");
}
let modelNames;
async function getOllamaModelNames(env = process.env) {
    if (modelNames === undefined) {
        const url = getOllamaEndpointUrl(env);
        const result = await (0, restClient_1.getJson)({}, `${url}/api/tags`, undefined);
        if (result.success) {
            const tags = result.data;
            modelNames = tags.models.map((m) => `ollama:${m.name.endsWith(":latest")
                ? m.name.substring(0, m.name.length - 7)
                : m.name}`);
        }
        else {
            modelNames = [];
        }
    }
    return modelNames;
}
exports.getOllamaModelNames = getOllamaModelNames;
function ollamaApiSettingsFromEnv(modelType, env = process.env, modelName = "phi3") {
    const useOAIEndpoint = env["OLLAMA_USE_OAI_ENDPOINT"] !== "0";
    if (modelType === openai_1.ModelType.Image) {
        throw new Error("Image model not supported");
    }
    const url = getOllamaEndpointUrl(env);
    if (useOAIEndpoint) {
        return {
            provider: "openai",
            modelType,
            endpoint: modelType === openai_1.ModelType.Chat
                ? `${url}/v1/chat/completions`
                : `${url}/v1/embeddings`,
            modelName,
            apiKey: "",
            supportsResponseFormat: true, // REVIEW: just assume it supports it. Ollama doesn't reject this option
        };
    }
    else {
        return {
            provider: "ollama",
            modelType,
            endpoint: modelType === openai_1.ModelType.Chat
                ? `${url}/api/chat`
                : `${url}/api/embed`,
            modelName,
        };
    }
}
exports.ollamaApiSettingsFromEnv = ollamaApiSettingsFromEnv;
function createOllamaChatModel(settings, completionSettings, completionCallback, tags) {
    completionSettings ??= {};
    completionSettings.n ??= 1;
    completionSettings.temperature ??= 0;
    const defaultParams = {
        model: settings.modelName,
    };
    const model = {
        completionSettings: completionSettings,
        completionCallback,
        complete,
        completeStream,
    };
    return model;
    function reportUsage(data) {
        try {
            // track token usage
            const usage = {
                completion_tokens: data.eval_count,
                prompt_tokens: data.prompt_eval_count,
                total_tokens: data.prompt_eval_count + data.eval_count,
            };
            tokenCounter_1.TokenCounter.getInstance().add(usage, tags);
        }
        catch { }
    }
    async function complete(prompt) {
        const messages = typeof prompt === "string"
            ? [{ role: "user", content: prompt }]
            : prompt;
        const isImageProptContent = (c) => c.type == "image_url";
        messages.map((ps) => {
            if (Array.isArray(ps.content)) {
                if (ps.content.some(isImageProptContent)) {
                    throw new Error("Image content not supported");
                }
            }
        });
        const params = {
            ...defaultParams,
            messages: messages,
            stream: false,
            options: completionSettings,
        };
        const result = await (0, restClient_1.callJsonApi)({}, settings.endpoint, params, settings.maxRetryAttempts, settings.retryPauseMs, undefined, settings.throttler);
        if (!result.success) {
            return result;
        }
        const data = result.data;
        if (model.completionCallback) {
            model.completionCallback(params, data);
        }
        reportUsage(data);
        return (0, typechat_1.success)(data.message.content);
    }
    async function completeStream(prompt) {
        const messages = typeof prompt === "string"
            ? [{ role: "user", content: prompt }]
            : prompt;
        const isImageProptContent = (c) => c.type == "image_url";
        messages.map((ps) => {
            if (Array.isArray(ps.content)) {
                if (ps.content.some(isImageProptContent)) {
                    throw new Error("Image content not supported");
                }
            }
        });
        const params = {
            ...defaultParams,
            messages: messages,
            stream: true,
            ...completionSettings,
        };
        const result = await (0, restClient_1.callApi)({}, settings.endpoint, params, settings.maxRetryAttempts, settings.retryPauseMs);
        if (!result.success) {
            return result;
        }
        return {
            success: true,
            data: (async function* () {
                const messageStream = (0, restClient_1.readResponseStream)(result.data);
                for await (const message of messageStream) {
                    const data = JSON.parse(message);
                    if (data.done) {
                        reportUsage(data);
                        break;
                    }
                    yield data.message.content;
                }
            })(),
        };
    }
}
exports.createOllamaChatModel = createOllamaChatModel;
//# sourceMappingURL=ollamaModels.js.map