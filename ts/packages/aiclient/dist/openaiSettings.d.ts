import { CommonApiSettings } from "./openai";
import { ModelType } from "./openai";
export type OpenAIApiSettings = CommonApiSettings & {
    provider: "openai";
    apiKey: string;
    modelName?: string;
    organization?: string;
    supportsResponseFormat?: boolean;
};
/**
 * Load settings for the OpenAI services from env
 * @param modelType Chat or Embedding
 * @param env Environment variables
 * @param endpointName Name of endpoint, e.g. GPT_35_TURBO or PHI3. This is appended as a suffix to base environment key
 * @param requireEndpoint If false (default), falls back to using non-endpoint specific settings
 * @returns
 */
export declare function openAIApiSettingsFromEnv(modelType: ModelType, env?: Record<string, string | undefined>, endpointName?: string, requireEndpoint?: boolean): OpenAIApiSettings;
//# sourceMappingURL=openaiSettings.d.ts.map