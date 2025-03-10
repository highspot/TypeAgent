import { IConversation, IKnowledgeSource, IMessage, IndexingResults, ITermToSemanticRefIndex, ITermToSemanticRefIndexData, Knowledge, KnowledgeType, MessageIndex, ScoredSemanticRef, SemanticRef, SemanticRefIndex, TextRange, Topic } from "./interfaces.js";
import { IndexingEventHandlers } from "./interfaces.js";
import { conversation as kpLib } from "knowledge-processor";
import { ChatModel } from "aiclient";
export declare function textRangeFromLocation(messageIndex: MessageIndex, chunkIndex?: number): TextRange;
export type KnowledgeValidator = (knowledgeType: KnowledgeType, knowledge: Knowledge) => boolean;
export declare function addMetadataToIndex(messages: IMessage[], semanticRefs: SemanticRef[], semanticRefIndex: ITermToSemanticRefIndex, knowledgeValidator?: KnowledgeValidator): void;
export declare function addEntityToIndex(entity: kpLib.ConcreteEntity, semanticRefs: SemanticRef[], semanticRefIndex: ITermToSemanticRefIndex, messageIndex: number, chunkIndex?: number): void;
export declare function addTopicToIndex(topic: Topic, semanticRefs: SemanticRef[], semanticRefIndex: ITermToSemanticRefIndex, messageIndex: number, chunkIndex?: number): void;
export declare function addActionToIndex(action: kpLib.Action, semanticRefs: SemanticRef[], semanticRefIndex: ITermToSemanticRefIndex, messageIndex: number, chunkIndex?: number): void;
export declare function addKnowledgeToIndex(semanticRefs: SemanticRef[], semanticRefIndex: ITermToSemanticRefIndex, messageIndex: MessageIndex, knowledge: kpLib.KnowledgeResponse): void;
export declare function buildSemanticRefIndex<TMeta extends IKnowledgeSource>(conversation: IConversation<TMeta>, extractor?: kpLib.KnowledgeExtractor, eventHandler?: IndexingEventHandlers): Promise<IndexingResults>;
export declare function addToConversationIndex<TMeta extends IKnowledgeSource>(conversation: IConversation<TMeta>, messages: IMessage<TMeta>[], knowledgeResponses: kpLib.KnowledgeResponse[]): void;
/**
 * Notes:
 *  Case-insensitive
 */
export declare class ConversationIndex implements ITermToSemanticRefIndex {
    private map;
    constructor(data?: ITermToSemanticRefIndexData | undefined);
    get size(): number;
    getTerms(): string[];
    addTerm(term: string, semanticRefIndex: SemanticRefIndex | ScoredSemanticRef): void;
    lookupTerm(term: string): ScoredSemanticRef[];
    removeTerm(term: string, semanticRefIndex: number): void;
    removeTermIfEmpty(term: string): void;
    serialize(): ITermToSemanticRefIndexData;
    deserialize(data: ITermToSemanticRefIndexData): void;
    /**
     * Do any pre-processing of the term.
     * @param term
     */
    private prepareTerm;
}
export declare function createKnowledgeModel(): import("aiclient").ChatModelWithStreaming;
export declare function createKnowledgeProcessor(chatModel?: ChatModel): kpLib.KnowledgeExtractor;
export declare function buildConversationIndex(conversation: IConversation, eventHandler?: IndexingEventHandlers): Promise<IndexingResults>;
//# sourceMappingURL=conversationIndex.d.ts.map