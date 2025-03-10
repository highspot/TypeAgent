import { AuthTokenProvider } from "./auth";
import { CommonApiSettings, ModelType } from "./openai";
export type AzureApiSettings = CommonApiSettings & {
    provider: "azure";
    apiKey: string;
    modelName?: string;
    supportsResponseFormat?: boolean;
    tokenProvider?: AuthTokenProvider;
    maxPromptChars?: number | undefined;
};
/**
 * Load settings for the Azure OpenAI services from env
 * @param modelType
 * @param env
 * @returns
 */
export declare function azureApiSettingsFromEnv(modelType: ModelType, env?: Record<string, string | undefined>, endpointName?: string): AzureApiSettings;
//# sourceMappingURL=azureSettings.d.ts.map