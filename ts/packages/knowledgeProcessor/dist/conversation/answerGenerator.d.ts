import { asyncArray, PromptSectionProvider } from "typeagent";
import { ChatModel } from "aiclient";
import { AnswerResponse } from "./answerSchema.js";
import { SearchResponse, TopKSettings } from "./searchResponse.js";
import { AnswerContext } from "./answerContext.js";
export type AnswerStyle = "List" | "List_Entities" | "Paragraph";
export type AnswerSettings = {
    maxCharsPerChunk: number;
    answerStyle: AnswerStyle | undefined;
    higherPrecision: boolean;
};
export type AnswerChunkingSettings = {
    enable: boolean;
    splitMessages?: boolean | undefined;
    maxChunks?: number | undefined;
    fastStop?: boolean | undefined;
};
export type AnswerGeneratorSettings = {
    topK: TopKSettings;
    chunking: AnswerChunkingSettings;
    maxCharsInContext?: number | undefined;
    concurrency?: number;
    contextProvider?: PromptSectionProvider | undefined;
    hints?: string | undefined;
};
export declare function createAnswerGeneratorSettings(): AnswerGeneratorSettings;
export interface AnswerGenerator {
    settings: AnswerGeneratorSettings;
    generateAnswer(question: string, style: AnswerStyle | undefined, response: SearchResponse, higherPrecision: boolean, enforceContextLength?: boolean): Promise<AnswerResponse | undefined>;
    generateAnswerInChunks(question: string, response: SearchResponse, settings: AnswerSettings, progress?: asyncArray.ProcessProgress<AnswerContext, AnswerResponse | undefined>): Promise<AnswerResponse | undefined>;
}
export declare function createAnswerGenerator(model: ChatModel, generatorSettings?: AnswerGeneratorSettings): AnswerGenerator;
//# sourceMappingURL=answerGenerator.d.ts.map