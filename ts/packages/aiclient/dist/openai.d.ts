import { TextEmbeddingModel, CompletionSettings, ChatModel, ChatModelWithStreaming, ImageModel } from "./models";
import { FetchThrottler } from "./restClient";
import { TypeChatLanguageModel } from "typechat";
import { OllamaApiSettings } from "./ollamaModels";
import { OpenAIApiSettings } from "./openaiSettings";
import { AzureApiSettings, azureApiSettingsFromEnv } from "./azureSettings";
export { azureApiSettingsFromEnv };
export declare enum ModelType {
    Chat = "chat",
    Embedding = "embedding",
    Image = "image"
}
export type ModelInfo<T> = {
    type: ModelType;
    model: T;
    endpointName?: string;
    maxTokens: number;
};
export type ModelProviders = "openai" | "azure" | "ollama";
export type CommonApiSettings = {
    provider: ModelProviders;
    modelType: ModelType;
    endpoint: string;
    maxRetryAttempts?: number;
    retryPauseMs?: number;
    maxConcurrency?: number | undefined;
    throttler?: FetchThrottler;
    enableModelRequestLogging?: boolean | undefined;
};
/**
 * Settings used by OpenAI clients
 */
export type ApiSettings = OllamaApiSettings | AzureApiSettings | OpenAIApiSettings;
/**
 * Environment variables used to configure OpenAI clients
 */
export declare enum EnvVars {
    OPENAI_API_KEY = "OPENAI_API_KEY",
    OPENAI_ENDPOINT = "OPENAI_ENDPOINT",
    OPENAI_ENDPOINT_EMBEDDING = "OPENAI_ENDPOINT_EMBEDDING",
    OPENAI_ORGANIZATION = "OPENAI_ORGANIZATION",
    OPENAI_MODEL = "OPENAI_MODEL",
    OPENAI_RESPONSE_FORMAT = "OPENAI_RESPONSE_FORMAT",
    OPENAI_MAX_CONCURRENCY = "AZURE_OPENAI_MAX_CONCURRENCY",
    OPENAI_MODEL_EMBEDDING = "OPENAI_MODEL_EMBEDDING",
    AZURE_OPENAI_API_KEY = "AZURE_OPENAI_API_KEY",
    AZURE_OPENAI_ENDPOINT = "AZURE_OPENAI_ENDPOINT",
    AZURE_OPENAI_RESPONSE_FORMAT = "AZURE_OPENAI_RESPONSE_FORMAT",
    AZURE_OPENAI_MAX_CONCURRENCY = "AZURE_OPENAI_MAX_CONCURRENCY",
    AZURE_OPENAI_MAX_CHARS = "AZURE_OPENAI_MAX_CHARS",
    AZURE_OPENAI_API_KEY_EMBEDDING = "AZURE_OPENAI_API_KEY_EMBEDDING",
    AZURE_OPENAI_ENDPOINT_EMBEDDING = "AZURE_OPENAI_ENDPOINT_EMBEDDING",
    AZURE_OPENAI_API_KEY_DALLE = "AZURE_OPENAI_API_KEY_DALLE",
    AZURE_OPENAI_ENDPOINT_DALLE = "AZURE_OPENAI_ENDPOINT_DALLE",
    OLLAMA_ENDPOINT = "OLLAMA_ENDPOINT",
    AZURE_MAPS_ENDPOINT = "AZURE_MAPS_ENDPOINT",
    AZURE_MAPS_CLIENTID = "AZURE_MAPS_CLIENTID",
    ENABLE_MODEL_REQUEST_LOGGING = "ENABLE_MODEL_REQUEST_LOGGING",
    AZURE_STORAGE_ACCOUNT = "AZURE_STORAGE_ACCOUNT",
    AZURE_STORAGE_CONTAINER = "AZURE_STORAGE_CONTAINER"
}
export declare const MAX_PROMPT_LENGTH_DEFAULT: number;
/**
 * Initialize settings from environment variables
 * @param modelType
 * @param env Environment variables or arbitrary Record
 * @param endpointName optional suffix to add to env variable names. Lets you target different backends
 * @returns
 */
export declare function apiSettingsFromEnv(modelType?: ModelType, env?: Record<string, string | undefined>, endpointName?: string): ApiSettings;
/**
 * Loads settings that support local services supporting the Open AI API spec
 * @param modelType Type of setting
 * @param env Environment variables
 * @param endpointName
 * @param tags Tags for tracking usage of this model instance
 * @returns API settings, or undefined if endpoint was not defined
 */
export declare function localOpenAIApiSettingsFromEnv(modelType: ModelType, env?: Record<string, string | undefined>, endpointName?: string, tags?: string[]): ApiSettings | undefined;
export declare function getChatModelSettings(endpoint?: string): ApiSettings;
export declare function supportsStreaming(model: TypeChatLanguageModel): model is ChatModelWithStreaming;
export type CompletionUsageStats = {
    completion_tokens: number;
    prompt_tokens: number;
    total_tokens: number;
};
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
export declare function createChatModel(endpoint?: string | ApiSettings, completionSettings?: CompletionSettings, completionCallback?: (request: any, response: any) => void, tags?: string[]): ChatModelWithStreaming;
/**
 * Create one of AI System's standard Chat Models
 * @param modelName
 * @param tag - Tag for tracking this model's usage
 * @returns
 */
export declare function createChatModelDefault(tag: string): ChatModelWithStreaming;
/**
 * Return a Chat model that returns JSON
 * Uses the type: json_object flag
 * @param endpoint
 * @param tags - Tags for tracking this model's usage
 * @returns ChatModel
 */
export declare function createJsonChatModel(endpoint?: string | ApiSettings, tags?: string[]): ChatModelWithStreaming;
/**
 * Model that supports OpenAI api, but running locally
 * @param endpointName
 * @param completionSettings
 * @param tags - Tags for tracking this model's usage
 * @returns If no local Api settings found, return undefined
 */
export declare function createLocalChatModel(endpointName?: string, completionSettings?: CompletionSettings, tags?: string[]): ChatModel | undefined;
export type AzureChatModelName = "DEFAULT" | "GPT_4" | "GPT_35_TURBO" | "GPT_4_O" | "GPT_4_O_MINI";
/**
 * Create a client for the OpenAI embeddings service
 * @param apiSettings: settings to use to create the client
 * @param dimensions (optional) text-embedding-03 and later models allow variable length embeddings
 */
export declare function createEmbeddingModel(endpoint: string, dimensions?: number | undefined): TextEmbeddingModel;
export declare function createEmbeddingModel(apiSettings?: ApiSettings | undefined, dimensions?: number | undefined): TextEmbeddingModel;
/**
 * Create a client for the OpenAI image/DallE service
 * @param apiSettings: settings to use to create the client
 */
export declare function createImageModel(apiSettings?: ApiSettings): ImageModel;
//# sourceMappingURL=openai.d.ts.map