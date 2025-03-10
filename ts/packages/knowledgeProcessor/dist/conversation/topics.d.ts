import { FileSystem, ObjectFolderSettings, SearchOptions, dateTime } from "typeagent";
import { Topic, TopicResponse } from "./topicSchema.js";
import { TypeChatLanguageModel } from "typechat";
import { AggregateTopicResponse } from "./aggregateTopicSchema.js";
import { TextIndex, TextIndexSettings } from "../textIndex.js";
import { SourceTextBlock, TextBlock } from "../text.js";
import { TopicFilter } from "./knowledgeSearchSchema.js";
import { TemporalLog } from "../temporal.js";
import { TermFilter } from "./knowledgeTermSearchSchema.js";
import { TermFilterV2 } from "./knowledgeTermSearchSchema2.js";
import { StorageProvider, ValueDataType, ValueType } from "../storageProvider.js";
import { EntityNameIndex } from "./entities.js";
export interface TopicExtractor {
    nextTopic(latestText: string, pastText: string, pastTopics?: Topic[], facets?: string): Promise<TopicResponse | undefined>;
    mergeTopics(topics: Topic[], pastTopics?: Topic[] | undefined): Promise<AggregateTopicResponse | undefined>;
}
export declare function createTopicExtractor(topicModel: TypeChatLanguageModel, mergeModel?: TypeChatLanguageModel): TopicExtractor;
export type TopicMergerSettings = {
    mergeWindowSize: number;
    trackRecent: boolean;
};
export interface TopicMerger<TTopicId = any> {
    readonly settings: TopicMergerSettings;
    /**
     * If enough prior topics to fill settings.mergeWindowSize are available then:
     *  - Merge topics into a higher level topic
     *  - Return the  merged topic
     *  - Optionally update indexes
     * @param updateIndex if true, add newly merged topic into topic index
     */
    next(lastTopics: TextBlock[], lastTopicIds: TTopicId[], timestamp: Date | undefined, updateIndex: boolean): Promise<dateTime.Timestamped<TextBlock<TTopicId>> | undefined>;
    mergeWindow(lastTopics: TextBlock[], lastTopicIds: TTopicId[], timestamp: Date | undefined, windowSize: number, updateIndex: boolean): Promise<dateTime.Timestamped<TextBlock<TTopicId>> | undefined>;
    clearRecent(): void;
}
export declare function createTopicMerger<TTopicId = string>(model: TypeChatLanguageModel, childIndex: TopicIndex<TTopicId>, settings: TopicMergerSettings, topicIndex?: TopicIndex<TTopicId, TTopicId>): Promise<TopicMerger<TTopicId>>;
export interface TopicSearchOptions extends SearchOptions {
    sourceNameSearchOptions?: SearchOptions;
    loadTopics?: boolean | undefined;
    useHighLevel?: boolean | undefined;
    filterBySourceName?: boolean | undefined;
}
export declare function createTopicSearchOptions(isTopicSummary?: boolean): TopicSearchOptions;
export interface TopicSearchResult<TTopicId = any> {
    topicIds?: TTopicId[] | undefined;
    topics?: string[];
    temporalSequence?: dateTime.Timestamped<TTopicId[]>[] | undefined;
    getTemporalRange(): dateTime.DateRange | undefined;
}
export interface TopicIndex<TTopicId = any, TSourceId = any> {
    readonly settings: TextIndexSettings;
    readonly sequence: TemporalLog<TTopicId, TTopicId[]>;
    readonly textIndex: TextIndex<TTopicId, TSourceId>;
    topics(): AsyncIterableIterator<string>;
    entries(): AsyncIterableIterator<TextBlock<TSourceId>>;
    getTopicSequence(): AsyncIterableIterator<SourceTextBlock<TSourceId>>;
    get(id: TTopicId): Promise<TextBlock<TSourceId> | undefined>;
    getText(id: TTopicId): Promise<string>;
    getMultiple(ids: TTopicId[]): Promise<TextBlock<TSourceId>[]>;
    getMultipleText(ids: TTopicId[]): Promise<string[]>;
    getId(topic: string): Promise<TTopicId | undefined>;
    /**
     * Return all sources where topic was seen
     * @param topic
     */
    getSourceIds(ids: TTopicId[]): Promise<TSourceId[]>;
    getSourceIdsForTopic(topic: string): Promise<TSourceId[] | undefined>;
    /**
     * Add the topic to the topic index and the topic sequence with the supplied timestamp
     * @param topics
     * @param timestamp
     */
    addNext(topics: TextBlock<TSourceId>[], timestamp?: Date): Promise<TTopicId[]>;
    /**
     * Add a topic to the index, but not to the sequence
     * @param topic
     */
    add(topic: string | TextBlock<TSourceId>, sourceName?: string, id?: TTopicId): Promise<TTopicId>;
    addMultiple(text: TextBlock<TSourceId>[], sourceName?: string, ids?: TTopicId[]): Promise<TTopicId[]>;
    search(filter: TopicFilter, options: TopicSearchOptions): Promise<TopicSearchResult<TTopicId>>;
    searchTerms(filter: TermFilter, options: TopicSearchOptions): Promise<TopicSearchResult<TTopicId>>;
    searchTermsV2(filter: TermFilterV2, options: TopicSearchOptions, possibleIds?: TTopicId[] | undefined): Promise<TopicSearchResult<TTopicId>>;
    loadSourceIds(sourceIdLog: TemporalLog<TSourceId>, results: TopicSearchResult<TTopicId>[], unique?: Set<TSourceId>): Promise<Set<TSourceId> | undefined>;
}
export declare function createTopicIndex<TSourceId extends ValueType = string>(settings: TextIndexSettings, getNameIndex: () => Promise<EntityNameIndex<string>>, rootPath: string, name: string, sourceIdType: ValueDataType<TSourceId>, folderSettings?: ObjectFolderSettings, fSys?: FileSystem): Promise<TopicIndex<string, TSourceId>>;
export declare function createTopicIndexOnStorage<TSourceId extends ValueType = string>(settings: TextIndexSettings, getNameIndex: () => Promise<EntityNameIndex<string>>, basePath: string, name: string, storageProvider: StorageProvider, sourceIdType: ValueDataType<TSourceId>): Promise<TopicIndex<string, TSourceId>>;
//# sourceMappingURL=topics.d.ts.map