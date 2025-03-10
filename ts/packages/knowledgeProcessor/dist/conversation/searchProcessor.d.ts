import { PromptSectionProvider, SearchOptions } from "typeagent";
import { Conversation, SearchActionResponse, SearchTermsActionResponse, SearchTermsActionResponseV2 } from "./conversation.js";
import { SearchResponse } from "./searchResponse.js";
import { KnowledgeActionTranslator } from "./knowledgeActions.js";
import { AnswerGenerator } from "./answerGenerator.js";
import { PromptSection } from "typechat";
import { ChatModel } from "aiclient";
import { TermFilter } from "./knowledgeTermSearchSchema.js";
import { TermFilterV2 } from "./knowledgeTermSearchSchema2.js";
import { EntitySearchOptions } from "./entities.js";
export type SearchProcessorSettings = {
    contextProvider?: PromptSectionProvider | undefined;
    defaultEntitySearchOptions?: EntitySearchOptions | undefined;
};
export type SearchProcessingOptions = {
    maxMatches: number;
    minScore: number;
    maxMessages: number;
    entitySearch?: EntitySearchOptions | undefined;
    fallbackSearch?: SearchOptions | undefined;
    threadSearch?: SearchOptions | undefined;
    skipAnswerGeneration?: boolean | undefined;
    skipEntitySearch?: boolean | undefined;
    skipTopicSearch?: boolean | undefined;
    skipActionSearch?: boolean | undefined;
    skipMessages?: boolean | undefined;
    progress?: ((action: any) => void) | undefined;
};
export interface ConversationSearchProcessor {
    settings: SearchProcessorSettings;
    actions: KnowledgeActionTranslator;
    answers: AnswerGenerator;
    search(query: string, options: SearchProcessingOptions): Promise<SearchActionResponse | undefined>;
    searchTerms(query: string, filters: TermFilter[] | undefined, options: SearchProcessingOptions): Promise<SearchTermsActionResponse | undefined>;
    searchTermsV2(query: string, filters: TermFilterV2[] | undefined, options: SearchProcessingOptions, history?: PromptSection[] | undefined): Promise<SearchTermsActionResponseV2 | undefined>;
    /**
     * Generate an answer using a prior search response
     * @param searchResponse
     */
    generateAnswer(query: string, actionResponse: SearchTermsActionResponse, options: SearchProcessingOptions): Promise<SearchTermsActionResponse>;
    /**
     * Generate an answer to the prior search response
     * @param query
     * @param actionResponse
     * @param options
     */
    generateAnswerV2(query: string, actionResponse: SearchTermsActionResponseV2, options: SearchProcessingOptions): Promise<SearchTermsActionResponseV2>;
    buildContext(query: string, options: SearchProcessingOptions): Promise<PromptSection[] | undefined>;
    searchMessages(query: string, options: SearchOptions, maxMessageChars?: number): Promise<SearchResponse>;
}
export declare function createSearchProcessor(conversation: Conversation, actionModel: ChatModel, answerModel: ChatModel, searchProcessorSettings?: SearchProcessorSettings): ConversationSearchProcessor;
//# sourceMappingURL=searchProcessor.d.ts.map