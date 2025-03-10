"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createImageModel = exports.createEmbeddingModel = exports.createLocalChatModel = exports.createJsonChatModel = exports.createChatModelDefault = exports.createChatModel = exports.supportsStreaming = exports.getChatModelSettings = exports.localOpenAIApiSettingsFromEnv = exports.apiSettingsFromEnv = exports.MAX_PROMPT_LENGTH_DEFAULT = exports.EnvVars = exports.ModelType = exports.azureApiSettingsFromEnv = void 0;
const restClient_1 = require("./restClient");
const common_1 = require("./common");
const typechat_1 = require("typechat");
const serverEvents_1 = require("./serverEvents");
const async_1 = require("async");
const debug_1 = __importDefault(require("debug"));
const tokenCounter_1 = require("./tokenCounter");
const promptLogger_1 = require("./promptLogger");
const ollamaModels_1 = require("./ollamaModels");
const openaiSettings_1 = require("./openaiSettings");
const azureSettings_1 = require("./azureSettings");
Object.defineProperty(exports, "azureApiSettingsFromEnv", { enumerable: true, get: function () { return azureSettings_1.azureApiSettingsFromEnv; } });
const debugOpenAI = (0, debug_1.default)("typeagent:openai");
var ModelType;
(function (ModelType) {
    ModelType["Chat"] = "chat";
    ModelType["Embedding"] = "embedding";
    ModelType["Image"] = "image";
})(ModelType || (exports.ModelType = ModelType = {}));
/**
 * Environment variables used to configure OpenAI clients
 */
var EnvVars;
(function (EnvVars) {
    EnvVars["OPENAI_API_KEY"] = "OPENAI_API_KEY";
    EnvVars["OPENAI_ENDPOINT"] = "OPENAI_ENDPOINT";
    EnvVars["OPENAI_ENDPOINT_EMBEDDING"] = "OPENAI_ENDPOINT_EMBEDDING";
    EnvVars["OPENAI_ORGANIZATION"] = "OPENAI_ORGANIZATION";
    EnvVars["OPENAI_MODEL"] = "OPENAI_MODEL";
    EnvVars["OPENAI_RESPONSE_FORMAT"] = "OPENAI_RESPONSE_FORMAT";
    EnvVars["OPENAI_MAX_CONCURRENCY"] = "AZURE_OPENAI_MAX_CONCURRENCY";
    EnvVars["OPENAI_MODEL_EMBEDDING"] = "OPENAI_MODEL_EMBEDDING";
    EnvVars["AZURE_OPENAI_API_KEY"] = "AZURE_OPENAI_API_KEY";
    EnvVars["AZURE_OPENAI_ENDPOINT"] = "AZURE_OPENAI_ENDPOINT";
    EnvVars["AZURE_OPENAI_RESPONSE_FORMAT"] = "AZURE_OPENAI_RESPONSE_FORMAT";
    EnvVars["AZURE_OPENAI_MAX_CONCURRENCY"] = "AZURE_OPENAI_MAX_CONCURRENCY";
    EnvVars["AZURE_OPENAI_MAX_CHARS"] = "AZURE_OPENAI_MAX_CHARS";
    EnvVars["AZURE_OPENAI_API_KEY_EMBEDDING"] = "AZURE_OPENAI_API_KEY_EMBEDDING";
    EnvVars["AZURE_OPENAI_ENDPOINT_EMBEDDING"] = "AZURE_OPENAI_ENDPOINT_EMBEDDING";
    EnvVars["AZURE_OPENAI_API_KEY_DALLE"] = "AZURE_OPENAI_API_KEY_DALLE";
    EnvVars["AZURE_OPENAI_ENDPOINT_DALLE"] = "AZURE_OPENAI_ENDPOINT_DALLE";
    EnvVars["OLLAMA_ENDPOINT"] = "OLLAMA_ENDPOINT";
    EnvVars["AZURE_MAPS_ENDPOINT"] = "AZURE_MAPS_ENDPOINT";
    EnvVars["AZURE_MAPS_CLIENTID"] = "AZURE_MAPS_CLIENTID";
    EnvVars["ENABLE_MODEL_REQUEST_LOGGING"] = "ENABLE_MODEL_REQUEST_LOGGING";
    EnvVars["AZURE_STORAGE_ACCOUNT"] = "AZURE_STORAGE_ACCOUNT";
    EnvVars["AZURE_STORAGE_CONTAINER"] = "AZURE_STORAGE_CONTAINER";
})(EnvVars || (exports.EnvVars = EnvVars = {}));
exports.MAX_PROMPT_LENGTH_DEFAULT = 1000 * 60;
/**
 * Initialize settings from environment variables
 * @param modelType
 * @param env Environment variables or arbitrary Record
 * @param endpointName optional suffix to add to env variable names. Lets you target different backends
 * @returns
 */
function apiSettingsFromEnv(modelType = ModelType.Chat, env, endpointName) {
    env ??= process.env;
    if (EnvVars.OPENAI_API_KEY in env) {
        return (0, openaiSettings_1.openAIApiSettingsFromEnv)(modelType, env, endpointName);
    }
    return (0, azureSettings_1.azureApiSettingsFromEnv)(modelType, env, endpointName);
}
exports.apiSettingsFromEnv = apiSettingsFromEnv;
/**
 * Loads settings that support local services supporting the Open AI API spec
 * @param modelType Type of setting
 * @param env Environment variables
 * @param endpointName
 * @param tags Tags for tracking usage of this model instance
 * @returns API settings, or undefined if endpoint was not defined
 */
function localOpenAIApiSettingsFromEnv(modelType, env, endpointName, tags) {
    env ??= process.env;
    endpointName ??= "Local";
    if ((0, common_1.getEnvSetting)(env, EnvVars.OPENAI_ENDPOINT, endpointName, "undefined") === "undefined") {
        return undefined;
    }
    return (0, openaiSettings_1.openAIApiSettingsFromEnv)(modelType, env, endpointName, true);
}
exports.localOpenAIApiSettingsFromEnv = localOpenAIApiSettingsFromEnv;
/**
 * Create an Open AI client. Supports both OpenAI and AzureOpenAI endpoints
 * @param settings settings to use for creating client
 * @returns headers used for API connections
 */
async function createApiHeaders(settings) {
    let apiHeaders;
    if (settings.provider === "azure") {
        if (settings.tokenProvider) {
            const tokenResult = await settings.tokenProvider.getAccessToken();
            if (!tokenResult.success) {
                return tokenResult;
            }
            apiHeaders = {
                Authorization: `Bearer ${tokenResult.data}`,
            };
        }
        else {
            apiHeaders = { "api-key": settings.apiKey };
        }
    }
    else if (settings.provider === "openai") {
        apiHeaders = {
            Authorization: `Bearer ${settings.apiKey}`,
            "OpenAI-Organization": settings.organization ?? "",
        };
    }
    return (0, typechat_1.success)(apiHeaders);
}
// Parse the endpoint name with the following naming conventions
//
// - By default, if endpoint name is not specified, it defaults to `OPENAI_ENDPOINT` if it exists, and `AZURE_OPENAI_ENDPOINT` otherwise.
// - Endpoint names `azure` and `openai` refers to `AZURE_OPENAI_ENDPOINT` and `OPENAI_ENDPOINT`
// - Endpoint names `azure:<name>` and `openai:<name>` refers to `AZURE_OPENAI_ENDPOINT_<name>` and `OPENAI_ENDPOINT_<name>`
// - Endpoint names without the `azure:` or `openai:` prefix will assume it is prefixed with `azure:` and uses `AZURE_OPENAI_ENDPOINT_<name>`
function parseEndPointName(endpoint) {
    if (endpoint === undefined || endpoint === "") {
        return {
            provider: EnvVars.OPENAI_ENDPOINT in process.env ? "openai" : "azure",
        };
    }
    if (endpoint === "openai" ||
        endpoint === "azure" ||
        endpoint === "ollama") {
        return { provider: endpoint };
    }
    if (endpoint.startsWith("openai:")) {
        return { provider: "openai", name: endpoint.substring(7) };
    }
    if (endpoint.startsWith("ollama:")) {
        return { provider: "ollama", name: endpoint.substring(7) };
    }
    if (endpoint.startsWith("azure:")) {
        return { provider: "azure", name: endpoint.substring(6) };
    }
    if (EnvVars.OPENAI_ENDPOINT in process.env) {
        return { provider: "openai", name: endpoint };
    }
    return { provider: "azure", name: endpoint };
}
// Cache of the model settings
const chatModels = new Map();
function getChatModelSettings(endpoint) {
    const endpointName = parseEndPointName(endpoint);
    const endpointKey = `${endpointName.provider}:${endpointName.name}`;
    const existing = chatModels.get(endpointKey);
    if (existing) {
        return existing;
    }
    const getApiSettingsFromEnv = endpointName.provider === "openai"
        ? openaiSettings_1.openAIApiSettingsFromEnv
        : endpointName.provider === "azure"
            ? azureSettings_1.azureApiSettingsFromEnv
            : ollamaModels_1.ollamaApiSettingsFromEnv;
    const settings = getApiSettingsFromEnv(ModelType.Chat, undefined, endpointName.name);
    if (settings.maxConcurrency !== undefined) {
        const q = (0, async_1.priorityQueue)(async (task) => {
            return task();
        }, settings.maxConcurrency);
        const throttler = (fn, priority) => {
            return q.push(fn, priority);
        };
        settings.throttler = throttler;
    }
    chatModels.set(endpointKey, settings);
    return settings;
}
exports.getChatModelSettings = getChatModelSettings;
function supportsStreaming(model) {
    return "completeStream" in model;
}
exports.supportsStreaming = supportsStreaming;
/**
 * Create a client for an Open AI chat model
 *  createChatModel()
 *     Initialize using standard TypeChat Env variables
 *  createChatModel("GPT_35_TURBO")
 *     Use the name as a SUFFIX for standard TypeChat Env variable names
 *     If no suffix variable exists, falls back to using defaults.
 *  createChatModel(azureApiSettingsFromEnv())
 *     You supply API settings
 *  createChatModel(apiSettings)
 *     You supply API settings
 * @param endpoint The name of the API endpoint OR explicit API settings with which to create a client
 * @param completionSettings Completion settings for the model
 * @param completionCallback A callback to be called when the response is returned from the api
 * @param tags Tags for tracking usage of this model instance
 * @returns ChatModel
 */
function createChatModel(endpoint, completionSettings, completionCallback, tags) {
    const settings = typeof endpoint === "object"
        ? endpoint
        : getChatModelSettings(endpoint);
    if (settings.provider === "ollama") {
        return (0, ollamaModels_1.createOllamaChatModel)(settings, completionSettings, completionCallback, tags);
    }
    return createAzureOpenAIChatModel(settings, completionSettings, completionCallback, tags);
}
exports.createChatModel = createChatModel;
function createAzureOpenAIChatModel(settings, completionSettings, completionCallback, tags) {
    completionSettings ??= {};
    completionSettings.n ??= 1;
    completionSettings.temperature ??= 0;
    const disableResponseFormat = !settings.supportsResponseFormat &&
        completionSettings.response_format !== undefined;
    if (disableResponseFormat) {
        // Remove it even if user specify it.
        delete completionSettings.response_format;
    }
    const defaultParams = settings.provider === "azure"
        ? {}
        : {
            model: settings.modelName,
        };
    const model = {
        completionSettings,
        completionCallback,
        complete,
        completeStream,
    };
    return model;
    function getParams(messages, jsonSchema, additionalParams) {
        const params = {
            ...defaultParams,
            messages,
            ...completionSettings,
            ...additionalParams,
        };
        if (jsonSchema !== undefined) {
            if (disableResponseFormat) {
                throw new Error(`Json schema not supported by model '${settings.modelName}'`);
            }
            if (Array.isArray(jsonSchema)) {
                // function calling
                params.tools = jsonSchema;
                params.tool_choice = "required";
                params.parallel_tool_calls = false;
            }
            else {
                if (params.response_format?.type === "json_object") {
                    params.response_format = {
                        type: "json_schema",
                        json_schema: jsonSchema,
                    };
                }
            }
        }
        return params;
    }
    async function complete(prompt, usageCallback, jsonSchema) {
        verifyPromptLength(settings, prompt);
        const headerResult = await createApiHeaders(settings);
        if (!headerResult.success) {
            return headerResult;
        }
        const messages = typeof prompt === "string"
            ? [{ role: "user", content: prompt }]
            : prompt;
        const params = getParams(messages, jsonSchema);
        const result = await (0, restClient_1.callJsonApi)(headerResult.data, settings.endpoint, params, settings.maxRetryAttempts, settings.retryPauseMs, undefined, settings.throttler);
        if (!result.success) {
            return result;
        }
        const data = result.data;
        if (!data.choices || data.choices.length === 0) {
            return (0, typechat_1.error)("No choices returned");
        }
        if (model.completionCallback) {
            model.completionCallback(params, data);
        }
        try {
            if (settings.enableModelRequestLogging) {
                // Log request
                promptLogger_1.PromptLogger.getInstance().logModelRequest({
                    prompt: messages,
                    response: data.choices[0].message?.content ?? "",
                    tokenUsage: data.usage,
                    tags: tags,
                });
            }
            // track token usage
            tokenCounter_1.TokenCounter.getInstance().add(data.usage, tags);
            usageCallback?.(data.usage);
        }
        catch { }
        if (Array.isArray(jsonSchema)) {
            const tool_calls = data.choices[0].message?.tool_calls;
            if (tool_calls === undefined) {
                return (0, typechat_1.error)("No tool_calls returned");
            }
            if (tool_calls.length !== 1) {
                return (0, typechat_1.error)("Invalid number of tool_calls");
            }
            const c = tool_calls[0];
            if (c.type !== "function") {
                return (0, typechat_1.error)("Invalid tool call type");
            }
            return (0, typechat_1.success)(JSON.stringify({
                name: c.function.name,
                arguments: JSON.parse(c.function.arguments),
            }));
        }
        return (0, typechat_1.success)(data.choices[0].message?.content ?? "");
    }
    async function completeStream(prompt, usageCallback, jsonSchema) {
        verifyPromptLength(settings, prompt);
        const headerResult = await createApiHeaders(settings);
        if (!headerResult.success) {
            return headerResult;
        }
        const messages = typeof prompt === "string"
            ? [{ role: "user", content: prompt }]
            : prompt;
        // BUGBUG - https://learn.microsoft.com/en-us/answers/questions/1805363/azure-openai-streaming-token-usage
        // image_url content with streaming token usage reporting is currently broken
        // TODO: remove after API endpoint correctly handles this case
        let historyIncludesImages = false;
        let isImageProptContent = (c) => c.type == "image_url";
        messages.map((ps) => {
            if (Array.isArray(ps.content)) {
                if (ps.content.some(isImageProptContent)) {
                    historyIncludesImages = true;
                }
            }
        });
        const params = getParams(messages, jsonSchema, {
            stream: true,
            stream_options: { include_usage: true && !historyIncludesImages },
        });
        const result = await (0, restClient_1.callApi)(headerResult.data, settings.endpoint, params, settings.maxRetryAttempts, settings.retryPauseMs);
        if (!result.success) {
            return result;
        }
        let fullResponseText = "";
        let tokenUsage;
        return {
            success: true,
            data: (async function* () {
                for await (const evt of (0, serverEvents_1.readServerEventStream)(result.data)) {
                    if (evt.data === "[DONE]") {
                        try {
                            if (settings.enableModelRequestLogging) {
                                // Log request.
                                promptLogger_1.PromptLogger.getInstance().logModelRequest({
                                    prompt: messages,
                                    response: fullResponseText,
                                    tokenUsageData: tokenUsage,
                                    tags: tags,
                                });
                            }
                        }
                        catch { }
                        if (Array.isArray(jsonSchema)) {
                            fullResponseText += "}";
                            yield "}";
                        }
                        break;
                    }
                    const data = JSON.parse(evt.data);
                    if (verifyContentSafety(data)) {
                        if (data.choices && data.choices.length > 0) {
                            if (Array.isArray(jsonSchema)) {
                                const delta = data.choices[0].delta.tool_calls;
                                if (delta) {
                                    for (const d of delta) {
                                        if (d.index !== 0) {
                                            throw new Error("Invalid number of tool_calls");
                                        }
                                        if (fullResponseText === "") {
                                            if (d.type !== "function") {
                                                throw new Error("Invalid tool call type");
                                            }
                                            if (!d.function.name) {
                                                throw new Error("Invalid function name");
                                            }
                                            fullResponseText = `{"name":"${d.function.name}","arguments":${d.function.arguments ?? ""}`;
                                            yield fullResponseText;
                                        }
                                        else {
                                            const result = d.function.arguments;
                                            fullResponseText += result;
                                            yield result;
                                        }
                                    }
                                }
                            }
                            else {
                                const delta = data.choices[0].delta.content;
                                if (delta) {
                                    fullResponseText += delta;
                                    yield delta;
                                }
                            }
                        }
                        if (data.usage) {
                            tokenUsage = data.usage;
                            try {
                                // track token usage
                                tokenCounter_1.TokenCounter.getInstance().add(data.usage, tags);
                                usageCallback?.(data.usage);
                            }
                            catch { }
                        }
                    }
                }
            })(),
        };
        // Stream chunks back
    }
    function verifyContentSafety(data) {
        data.choices.map((c) => {
            if (c.finish_reason == "content_filter_error") {
                const err = c.content_filter_results;
                throw new Error(`There was a content filter error (${err.code}): ${err.message}`);
            }
            verifyFilterResults(c.content_filter_results);
        });
        return true;
    }
}
function verifyFilterResults(filterResult) {
    let filters = new Array();
    if (filterResult) {
        if (filterResult.hate?.filtered) {
            filters.push("hate");
        }
        if (filterResult.self_harm?.filtered) {
            filters.push("self_harm");
        }
        if (filterResult.sexual?.filtered) {
            filters.push("sexual");
        }
        if (filterResult.violence?.filtered) {
            filters.push("violence");
        }
        if (filters.length > 0) {
            let msg = `A content filter has been triggered by one or more messages. The triggered filters are: ${filters.join(", ")}`;
            throw new Error(`${msg}`);
        }
    }
}
/**
 * Create one of AI System's standard Chat Models
 * @param modelName
 * @param tag - Tag for tracking this model's usage
 * @returns
 */
function createChatModelDefault(tag) {
    return createJsonChatModel(undefined, [tag]);
}
exports.createChatModelDefault = createChatModelDefault;
/**
 * Return a Chat model that returns JSON
 * Uses the type: json_object flag
 * @param endpoint
 * @param tags - Tags for tracking this model's usage
 * @returns ChatModel
 */
function createJsonChatModel(endpoint, tags) {
    return createChatModel(endpoint, {
        response_format: { type: "json_object" },
    }, undefined, tags);
}
exports.createJsonChatModel = createJsonChatModel;
/**
 * Model that supports OpenAI api, but running locally
 * @param endpointName
 * @param completionSettings
 * @param tags - Tags for tracking this model's usage
 * @returns If no local Api settings found, return undefined
 */
function createLocalChatModel(endpointName, completionSettings, tags) {
    const settings = localOpenAIApiSettingsFromEnv(ModelType.Chat, undefined, endpointName, tags);
    return settings
        ? createChatModel(settings, completionSettings, undefined, tags)
        : undefined;
}
exports.createLocalChatModel = createLocalChatModel;
function createEmbeddingModel(apiSettingsOrEndpoint, dimensions) {
    if (typeof apiSettingsOrEndpoint === "string") {
        apiSettingsOrEndpoint = apiSettingsFromEnv(ModelType.Embedding, undefined, apiSettingsOrEndpoint);
    }
    // https://platform.openai.com/docs/api-reference/embeddings/create#embeddings-create-input
    const maxBatchSize = 2048;
    const settings = apiSettingsOrEndpoint ?? apiSettingsFromEnv(ModelType.Embedding);
    const defaultParams = settings.provider === "azure"
        ? {}
        : {
            model: settings.modelName,
        };
    if (dimensions && dimensions > 0) {
        defaultParams.dimensions = dimensions;
    }
    const model = {
        generateEmbedding,
        generateEmbeddingBatch,
        maxBatchSize,
    };
    return model;
    async function generateEmbedding(input) {
        if (!input) {
            return (0, typechat_1.error)("Empty input");
        }
        const result = await callApi(input);
        if (!result.success) {
            return result;
        }
        const data = result.data;
        return (0, typechat_1.success)(data.data[0].embedding);
    }
    // Support optional method, since OAI supports batching
    async function generateEmbeddingBatch(input) {
        if (input.length === 0) {
            return (0, typechat_1.error)("Empty input array");
        }
        if (input.length > maxBatchSize) {
            return (0, typechat_1.error)(`Batch size must be < ${maxBatchSize}`);
        }
        const result = await callApi(input);
        if (!result.success) {
            return result;
        }
        const data = result.data;
        return (0, typechat_1.success)(data.data.map((d) => d.embedding));
    }
    async function callApi(input) {
        const headerResult = await createApiHeaders(settings);
        if (!headerResult.success) {
            return headerResult;
        }
        const params = {
            ...defaultParams,
            input,
        };
        return (0, restClient_1.callJsonApi)(headerResult.data, settings.endpoint, params, settings.maxRetryAttempts, settings.retryPauseMs);
    }
}
exports.createEmbeddingModel = createEmbeddingModel;
/**
 * Create a client for the OpenAI image/DallE service
 * @param apiSettings: settings to use to create the client
 */
function createImageModel(apiSettings) {
    const settings = apiSettings ?? apiSettingsFromEnv(ModelType.Image);
    const defaultParams = settings.provider === "azure"
        ? {}
        : {
            model: settings.modelName,
        };
    const model = {
        generateImage,
    };
    return model;
    async function generateImage(prompt, imageCount, width, height) {
        const headerResult = await createApiHeaders(settings);
        if (!headerResult.success) {
            return headerResult;
        }
        if (imageCount != 1) {
            throw Error("n MUST equal 1"); // as of 10.03.2024 API will only accept n=1
        }
        const params = {
            ...defaultParams,
            prompt,
            n: imageCount,
            size: `${width}x${height}`,
        };
        const result = await (0, restClient_1.callJsonApi)(headerResult.data, settings.endpoint, params, settings.maxRetryAttempts, settings.retryPauseMs);
        if (!result.success) {
            return result;
        }
        const data = result.data;
        const retValue = { images: [] };
        data.data.map((i) => {
            verifyContentSafety(i);
            retValue.images.push({
                revised_prompt: i.revised_prompt,
                image_url: i.url,
            });
        });
        return (0, typechat_1.success)(retValue);
    }
    function verifyContentSafety(data) {
        verifyFilterResults(data.content_filter_results);
        verifyFilterResults(data.prompt_filter_results);
        return true;
    }
}
exports.createImageModel = createImageModel;
function verifyPromptLength(settings, prompt) {
    if (settings.provider !== "azure") {
        return;
    }
    const promptLength = getPromptLength(prompt);
    if (settings.maxPromptChars && settings.maxPromptChars > 0) {
        if (promptLength > settings.maxPromptChars) {
            const errorMsg = `REQUEST NOT SENT:\nTotal prompt length ${promptLength} chars EXCEEDS AZURE_OPENAI_MAX_CHARS=${settings.maxPromptChars}`;
            debugOpenAI(errorMsg);
            throw new Error(errorMsg);
        }
    }
    else if (promptLength > exports.MAX_PROMPT_LENGTH_DEFAULT) {
        // Approx 20K tokens
        const errorMsg = `LARGE REQUEST:\nTotal prompt length ${promptLength} chars. Set AZURE_OPENAI_MAX_CHARS env variable to block.`;
        console.log(errorMsg);
        debugOpenAI(errorMsg);
    }
}
function getPromptLength(prompt) {
    if (typeof prompt === "string") {
        return prompt.length;
    }
    let length = 0;
    for (const section of prompt) {
        length += section.content.length;
    }
    return length;
}
//# sourceMappingURL=openai.js.map