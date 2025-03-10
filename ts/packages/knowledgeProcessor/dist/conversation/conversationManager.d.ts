import { ChatModel } from "aiclient";
import { SearchOptions, collections } from "typeagent";
import { TextBlock } from "../text.js";
import { Conversation, ConversationSettings, SearchTermsActionResponse } from "./conversation.js";
import { KnowledgeExtractor } from "./knowledge.js";
import { ConversationSearchProcessor } from "./searchProcessor.js";
import { ConcreteEntity, KnowledgeResponse } from "./knowledgeSchema.js";
import { TermFilter } from "./knowledgeTermSearchSchema.js";
import { TopicMerger } from "./topics.js";
import { StorageProvider } from "../storageProvider.js";
export type ConversationMessage = {
    /**
     * Text of the message
     */
    text: string | TextBlock;
    /**
     * Any pre-extracted knowledge associated with this message
     */
    knowledge?: ConcreteEntity[] | KnowledgeResponse | undefined;
    /**
     * Message timestamp
     */
    timestamp?: Date | undefined;
    /**
     * Message header (Optional).
     * No knowledge is extracted from the header
     */
    header?: string | undefined;
    /**
     * Message sender (Optional)
     */
    sender?: string | undefined;
    /**
     * Message recipients (Optional)
     */
    recipients?: string[] | undefined;
};
export type AddMessageTask = {
    type: "addMessage";
    message: ConversationMessage;
    extractKnowledge?: boolean | boolean;
    callback?: ((error?: any | undefined) => void) | undefined;
};
export type ConversationManagerTask = AddMessageTask;
export type ConversationManagerSettings = {
    model?: ChatModel | undefined;
    answerModel?: ChatModel | undefined;
    initializer?: ((cm: ConversationManager) => Promise<void>) | undefined;
};
/**
 * A conversation manager lets you dynamically:
 *  - add and index messages and entities to a conversation
 *  - search the conversation
 */
export interface ConversationManager<TMessageId = any, TTopicId = any> {
    readonly conversationName: string;
    readonly conversation: Conversation<TMessageId, TTopicId, string, string>;
    readonly topicMerger: TopicMerger<TTopicId>;
    readonly knowledgeExtractor: KnowledgeExtractor;
    readonly searchProcessor: ConversationSearchProcessor;
    readonly updateTaskQueue: collections.TaskQueue<ConversationManagerTask>;
    /**
     * Add a message to the conversation
     * @param message
     */
    addMessage(message: string | ConversationMessage, extractKnowledge?: boolean | undefined): Promise<void>;
    /**
     * Add a batch message to the conversation
     * @param messages Conversation messages to add
     */
    addMessageBatch(messages: ConversationMessage[], extractKnowledge?: boolean | undefined): Promise<void>;
    /**
     * Queue the message for adding to the conversation memory in the background
     * @param message
     * @param knowledge Any pre-extracted knowledge. Merged with knowledge automatically extracted from message.
     * @param timestamp message timestamp
     * @returns true if queued. False if queue is full
     */
    queueAddMessage(message: string | ConversationMessage, extractKnowledge?: boolean | undefined): boolean;
    /**
     * Search the conversation and return an answer
     * @param query
     * @param termFilters
     * @param fuzzySearchOptions
     * @param maxMessages
     * @param progress
     */
    search(query: string, termFilters?: TermFilter[] | undefined, fuzzySearchOptions?: SearchOptions | undefined, maxMessages?: number | undefined, progress?: ((value: any) => void) | undefined): Promise<SearchTermsActionResponse | undefined>;
    /**
     * Search without generating an answer
     * @param query
     * @param termFilters
     * @param fuzzySearchOptions
     * @param maxMessages
     * @param progress
     */
    getSearchResponse(query: string, termFilters?: TermFilter[] | undefined, fuzzySearchOptions?: SearchOptions | undefined, maxMessages?: number | undefined, progress?: ((value: any) => void) | undefined): Promise<SearchTermsActionResponse | undefined>;
    /**
     * Generate an answer for a response received from getSearchResponse
     * @param query
     * @param searchResponse
     * @param fuzzySearchOptions
     * @param maxMessages
     */
    generateAnswerForSearchResponse(query: string, searchResponse: SearchTermsActionResponse, fuzzySearchOptions?: SearchOptions | undefined, maxMessages?: number | undefined): Promise<SearchTermsActionResponse>;
    /**
     * Clear everything.
     * Note: While this is happening, it is up to you to ensure you are not searching or reading the conversation
     */
    clear(removeMessages: boolean): Promise<void>;
}
/**
 * Creates a conversation manager with standard defaults.
 * @param conversationName name of conversation
 * @param conversationPath path to a root folder for this conversation.
 * @param createNew Use existing conversation or create a new one
 * @param existingConversation If using an existing conversation
 * @param model Pass in chat model to use
 * @param initializer Optional initializer
 */
export declare function createConversationManager(settings: ConversationManagerSettings, conversationName: string, conversationPath: string, createNew: boolean, existingConversation?: Conversation | undefined): Promise<ConversationManager<string, string>>;
export declare function createConversationManagerEx(settings: ConversationManagerSettings, conversationSettings: ConversationSettings, name: string, rootPath: string, storageProvider?: StorageProvider): Promise<ConversationManager<string, string>>;
/**
 * Add a new message to the given conversation, extracting knowledge using the given knowledge extractor.
 * @param conversation
 * @param knowledgeExtractor
 * @param topicMerger (Optional)
 * @param message message text or message text block to add
 * @param knownKnowledge pre-extracted/known knowledge associated with this message
 * @param timestamp
 */
export declare function addMessageToConversation(conversation: Conversation, knowledgeExtractor: KnowledgeExtractor, topicMerger: TopicMerger | undefined, message: ConversationMessage, extractKnowledge?: boolean): Promise<void>;
export declare function addMessageBatchToConversation(conversation: Conversation, knowledgeExtractor: KnowledgeExtractor, topicMerger: TopicMerger | undefined, messages: ConversationMessage[], extractKnowledge?: boolean): Promise<void>;
//# sourceMappingURL=conversationManager.d.ts.map