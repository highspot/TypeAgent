import { dateTime } from "typeagent";
import { ActionGroup, ActionSearchResult } from "./actions.js";
import { CompositeEntity, EntitySearchResult } from "./entities.js";
import { TopicSearchResult } from "./topics.js";
import { TextBlock } from "../text.js";
import { AnswerResponse } from "./answerSchema.js";
import { Action, ConcreteEntity } from "./knowledgeSchema.js";
export type TopKSettings = {
    topicsTopK: number;
    entitiesTopK: number;
    actionsTopK: number;
};
export interface SearchResponse<TMessageId = any, TTopicId = any, TEntityId = any, TActionId = any> {
    readonly entities: EntitySearchResult<TEntityId>[];
    topics: TopicSearchResult<TTopicId>[];
    actions: ActionSearchResult<TActionId>[];
    topicLevel: number;
    messageIds?: TMessageId[] | undefined;
    messages?: dateTime.Timestamped<TextBlock<TMessageId>>[] | undefined;
    fallbackUsed?: boolean | undefined;
    answer?: AnswerResponse | undefined;
    responseStyle?: string;
    /**
     * Did we get a valid answer?
     */
    hasAnswer(): boolean;
    getAnswer(): string;
    getTopics(): string[];
    topKSettings?: TopKSettings | undefined;
    /**
     * Get the topK matched and *loaded* entities.
     * Composites all raw matched entities - which are very granular - into a whole
     * Entities are loaded only if search options said so
     * @param topK
     */
    getEntities(topK?: number | undefined): CompositeEntity[];
    getActions(topK?: number | undefined): ActionGroup[];
    allTopics(): IterableIterator<string>;
    allTopicIds(): IterableIterator<TTopicId>;
    topicTimeRanges(): (dateTime.DateRange | undefined)[];
    allRawEntities(): IterableIterator<ConcreteEntity>;
    allEntityIds(): IterableIterator<TEntityId>;
    allEntityNames(): string[];
    entityTimeRanges(): (dateTime.DateRange | undefined)[];
    allActions(): IterableIterator<Action>;
    allActionIds(): IterableIterator<TActionId>;
    actionTimeRanges(): (dateTime.DateRange | undefined)[];
    getTotalMessageLength(): number;
    hasTopics(): boolean;
    hasEntities(): boolean;
    hasActions(): boolean;
    hasMessages(): boolean;
    hasHits(): boolean;
}
export declare function createSearchResponse<TMessageId = any, TTopicId = any, TEntityId = any, TActionId = any>(topicLevel?: number): SearchResponse<TMessageId, TTopicId, TEntityId>;
//# sourceMappingURL=searchResponse.d.ts.map