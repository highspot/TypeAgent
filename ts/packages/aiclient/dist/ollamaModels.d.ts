import { ChatModelWithStreaming, CompletionSettings } from "./models";
import { CommonApiSettings, ModelType } from "./openai";
import { OpenAIApiSettings } from "./openaiSettings";
export type OllamaApiSettings = CommonApiSettings & {
    provider: "ollama";
    modelType: ModelType;
    endpoint: string;
    modelName: string;
};
export declare function getOllamaModelNames(env?: Record<string, string | undefined>): Promise<string[]>;
export declare function ollamaApiSettingsFromEnv(modelType: ModelType, env?: Record<string, string | undefined>, modelName?: string): OllamaApiSettings | OpenAIApiSettings;
export declare function createOllamaChatModel(settings: OllamaApiSettings, completionSettings?: CompletionSettings, completionCallback?: (request: any, response: any) => void, tags?: string[]): ChatModelWithStreaming;
//# sourceMappingURL=ollamaModels.d.ts.map