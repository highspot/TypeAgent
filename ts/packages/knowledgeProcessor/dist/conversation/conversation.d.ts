import { FileSystem, ObjectFolder, ObjectFolderSettings, SearchOptions, dateTime } from "typeagent";
import { TextBlock, SourceTextBlock } from "../text.js";
import { Topic } from "./topicSchema.js";
import { TextStore } from "../textStore.js";
import { TopicIndex, TopicMerger, TopicSearchOptions } from "./topics.js";
import { TextIndexSettings } from "../textIndex.js";
import { EntityIndex, EntitySearchOptions } from "./entities.js";
import { ExtractedKnowledge } from "./knowledge.js";
import { Filter, SearchAction } from "./knowledgeSearchSchema.js";
import { MessageIndex } from "./messages.js";
import { ActionIndex, ActionSearchOptions } from "./actions.js";
import { SearchTermsAction, TermFilter } from "./knowledgeTermSearchSchema.js";
import { SearchTermsActionV2, TermFilterV2 } from "./knowledgeTermSearchSchema2.js";
import { TypeChatLanguageModel } from "typechat";
import { TextEmbeddingModel } from "aiclient";
import { SearchResponse } from "./searchResponse.js";
import { StorageProvider } from "../storageProvider.js";
import { RecentItems } from "../temporal.js";
import { ThreadIndex } from "./threads.js";
export interface ConversationSettings {
    indexSettings: TextIndexSettings;
    entityIndexSettings?: TextIndexSettings | undefined;
    actionIndexSettings?: TextIndexSettings | undefined;
    indexActions?: boolean;
    initializer?: ((conversation: Conversation) => Promise<void>) | undefined;
}
export declare function createConversationSettings(embeddingModel?: TextEmbeddingModel): ConversationSettings;
export type ConversationSearchOptions = {
    entity?: EntitySearchOptions | undefined;
    topic?: TopicSearchOptions | undefined;
    action?: ActionSearchOptions | undefined;
    topicLevel?: number;
    loadMessages?: boolean;
};
export declare function createConversationSearchOptions(topLevelSummary?: boolean): ConversationSearchOptions;
/**
 * A conversation is *anything* that can be modelled as a set of turns or conversation messages.
 * Messages are:
 *  - text blocks, with optional links back to their sources.
 *  - timestamped
 * Each new message can also have *associated* knowledge:
 *  - Entities
 *  - Actions
 *  - Hierarchical topics
 * This knowledge is stored and indexed. It is available for search and enumeration.
 * Knowledge is used to implement 'Structured RAG'. The knowledge informs and improves search *specificity*.
 * Instead of just relying on embeddings (like classic RAG), structured RAG uses the indexes structured knowledge and
 * structured queries to find knowledge (entities etc) AND messages that are relevant to user intent.
 *
 * Knowledge extraction can be automatic or manual. For automatic knowledge extraction, see:
 * - KnowledgeExtractor {@link ./knowledge.ts}
 * - ConversationManager, which provides a built in pipeline for knowledge extraction  {@link ./conversationManager.ts}
 */
export interface Conversation<MessageId = any, TTopicId = any, TEntityId = any, TActionId = any> {
    readonly settings: ConversationSettings;
    readonly messages: TextStore<MessageId>;
    readonly knowledge: ObjectFolder<ExtractedKnowledge>;
    /**
     * Returns the index for all messages in this conversation. The index is dynamically maintained.
     */
    getMessageIndex(): Promise<MessageIndex<MessageId>>;
    /**
     * Returns the index of all entities found in this conversation. The index is dynamically maintained.
     */
    getEntityIndex(): Promise<EntityIndex<TEntityId, MessageId>>;
    /**
     * Returns the index of all topics found in this conversation. The index is dynamically maintained.
     * @param level
     */
    getTopicsIndex(level?: number): Promise<TopicIndex<TTopicId, MessageId>>;
    /**
     * Returns the index of
     */
    getActionIndex(): Promise<ActionIndex<TActionId, MessageId>>;
    getThreadIndex(): Promise<ThreadIndex<string>>;
    /**
     *
     * @param removeMessages If you want the original messages also removed. Set to false if you just want to rebuild the indexes
     */
    clear(removeMessages: boolean): Promise<void>;
    /**
     * Add a message to the conversation
     * @param message
     * @param timestamp
     */
    addMessage(message: string | TextBlock, timestamp?: Date): Promise<SourceTextBlock<MessageId>>;
    addKnowledgeForMessage(message: SourceTextBlock<MessageId>, knowledge: ExtractedKnowledge<MessageId>): Promise<ExtractedKnowledgeIds<TTopicId, TEntityId, TActionId>>;
    addKnowledgeToIndex(knowledge: ExtractedKnowledge<MessageId>, knowledgeIds: ExtractedKnowledgeIds<TTopicId, TEntityId, TActionId>): Promise<void>;
    /**
     * Search for artifacts (messages, entities, actions, topics,etc..) that match the given filters
     * @param filters
     * @param options
     */
    search(filters: Filter[], options: ConversationSearchOptions): Promise<SearchResponse>;
    /**
     * Search for artifacts (messages, entities, actions, topics,etc..) that match the given term filters
     * Deprecated. Use searchTermsV2 when possible
     * @param filters
     * @param options
     */
    searchTerms(filters: TermFilter[], options: ConversationSearchOptions): Promise<SearchResponse>;
    /**
     * Search for artifacts (messages, entities, actions, topics,etc..) that match the given term filters
     * This is 'structured RAG' search
     * This is an new version of searchTerms and will eventually replace it
     * @param filters
     * @param options
     */
    searchTermsV2(filters: TermFilterV2[], options?: ConversationSearchOptions | undefined): Promise<SearchResponse>;
    /**
     * Find messages that are nearest to the given query.
     * Does not use structured indices like entities or actions; just does pure ANN.
     * You can pass in message ids to restrict the set of messages you want to search. This is useful if you
     * used structured indices to pre-filter the messages you were interested in.
     * @param query
     * @param options
     * @param idsToSearch
     */
    searchMessages(query: string, options: SearchOptions, idsToSearch?: MessageId[]): Promise<{
        messageIds: MessageId[];
        messages: dateTime.Timestamped<TextBlock<MessageId>>[];
    } | undefined>;
    /**
     * Find the message whose text exactly matches messageText
     * For example, you can use this to find out if a message is already in the conversation (de-dupe)
     * @param messageText
     */
    findMessage(messageText: string): Promise<dateTime.Timestamped<TextBlock<MessageId>> | undefined>;
    loadMessages(ids: MessageId[]): Promise<dateTime.Timestamped<TextBlock<MessageId>>[]>;
}
/**
 * Create or load a persistent conversation, using the given rootPath as the storage root.
 * - The conversation is stored in folders below the given root path
 * - If the rootPath exists, the conversation stored inside it is automatically used.
 * @param settings
 * @param rootPath
 * @param folderSettings (Optional) Flags for object storage
 * @param fSys (Optional) By default, stored on local file system
 * @returns
 */
export declare function createConversation(settings: ConversationSettings, rootPath: string, folderSettings?: ObjectFolderSettings | undefined, fSys?: FileSystem | undefined, storageProvider?: StorageProvider): Promise<Conversation<string, string, string>>;
export type ExtractedKnowledgeIds<TopicId = any, TEntityId = any, TActionId = any> = {
    topicIds?: TopicId[];
    entityIds?: TEntityId[] | undefined;
    actionIds?: TActionId[] | undefined;
};
export interface ConversationTopicMerger<TTopicId = any> extends TopicMerger<TTopicId> {
    reset(): Promise<void>;
}
export declare function createConversationTopicMerger<TTopicId = string>(mergeModel: TypeChatLanguageModel, conversation: Conversation, baseTopicLevel: number, mergeWindowSize?: number): Promise<ConversationTopicMerger<TTopicId>>;
export interface RecentConversation {
    readonly turns: RecentItems<SourceTextBlock>;
    readonly topics: RecentItems<Topic>;
}
export declare function createRecentConversationWindow(windowSize: number): RecentConversation;
export type SearchActionResponse = {
    action: SearchAction;
    response?: SearchResponse | undefined;
};
export type SearchTermsActionResponse = {
    action: SearchTermsAction;
    response?: SearchResponse | undefined;
};
export type SearchTermsActionResponseV2 = {
    action: SearchTermsActionV2;
    response?: SearchResponse | undefined;
};
//# sourceMappingURL=conversation.d.ts.map