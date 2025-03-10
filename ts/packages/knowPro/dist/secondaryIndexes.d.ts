import { IConversationThreadData } from "./conversationThread.js";
import { IConversation, IConversationData, IConversationSecondaryIndexes, IndexingEventHandlers, Term } from "./interfaces.js";
import { PropertyIndex } from "./propertyIndex.js";
import { RelatedTermIndexSettings, RelatedTermsIndex } from "./relatedTermsIndex.js";
import { TimestampToTextRangeIndex } from "./timestampIndex.js";
export declare function buildSecondaryIndexes(conversation: IConversation, buildRelated: boolean, eventHandler?: IndexingEventHandlers): Promise<void>;
export declare class ConversationSecondaryIndexes implements IConversationSecondaryIndexes {
    propertyToSemanticRefIndex: PropertyIndex;
    timestampIndex: TimestampToTextRangeIndex;
    termToRelatedTermsIndex: RelatedTermsIndex;
    constructor(settings?: RelatedTermIndexSettings);
}
export interface ITermsToRelatedTermsIndexData {
    aliasData?: ITermToRelatedTermsData | undefined;
    textEmbeddingData?: ITextEmbeddingIndexData | undefined;
}
export interface ITermToRelatedTermsData {
    relatedTerms?: ITermsToRelatedTermsDataItem[] | undefined;
}
export interface ITermsToRelatedTermsDataItem {
    termText: string;
    relatedTerms: Term[];
}
export interface ITextEmbeddingIndexData {
    textItems: string[];
    embeddings: Float32Array[];
}
export interface IConversationDataWithIndexes<TMessage = any> extends IConversationData<TMessage> {
    relatedTermsIndexData?: ITermsToRelatedTermsIndexData | undefined;
    threadData?: IConversationThreadData;
}
//# sourceMappingURL=secondaryIndexes.d.ts.map