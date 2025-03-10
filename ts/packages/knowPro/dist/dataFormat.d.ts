import { conversation } from "knowledge-processor";
export interface IKnowledgeSource {
    getKnowledge: () => conversation.KnowledgeResponse;
}
export interface DeletionInfo {
    timestamp: string;
    reason?: string;
}
export interface IMessage<TMeta extends IKnowledgeSource = any> {
    textChunks: string[];
    metadata: TMeta;
    timestamp?: string | undefined;
    tags: string[];
    deletionInfo?: DeletionInfo;
}
export interface ITermToSemanticRefIndexItem {
    term: string;
    semanticRefIndices: ScoredSemanticRef[];
}
export interface ITermToSemanticRefIndexData {
    items: ITermToSemanticRefIndexItem[];
}
export type SemanticRefIndex = number;
export type ScoredSemanticRef = {
    semanticRefIndex: SemanticRefIndex;
    score: number;
};
export interface ITermToSemanticRefIndex {
    getTerms(): string[];
    addTerm(term: string, semanticRefIndex: SemanticRefIndex | ScoredSemanticRef): void;
    removeTerm(term: string, semanticRefIndex: SemanticRefIndex): void;
    lookupTerm(term: string): ScoredSemanticRef[] | undefined;
}
export type KnowledgeType = "entity" | "action" | "topic" | "tag";
export type Knowledge = conversation.ConcreteEntity | conversation.Action | ITopic | ITag;
export interface SemanticRef {
    semanticRefIndex: SemanticRefIndex;
    range: TextRange;
    knowledgeType: KnowledgeType;
    knowledge: Knowledge;
}
export interface ITopic {
    text: string;
}
export type ITag = ITopic;
export interface IConversation<TMeta extends IKnowledgeSource = any> {
    nameTag: string;
    tags: string[];
    messages: IMessage<TMeta>[];
    semanticRefs: SemanticRef[] | undefined;
    semanticRefIndex?: ITermToSemanticRefIndex | undefined;
}
export type MessageIndex = number;
export interface TextLocation {
    messageIndex: MessageIndex;
    chunkIndex?: number;
    charIndex?: number;
}
export interface TextRange {
    start: TextLocation;
    end?: TextLocation | undefined;
}
export interface IConversationData<TMessage> {
    nameTag: string;
    messages: TMessage[];
    tags: string[];
    semanticRefs: SemanticRef[];
    semanticIndexData?: ITermToSemanticRefIndexData | undefined;
}
export type DateRange = {
    start: Date;
    end?: Date | undefined;
};
export type Term = {
    text: string;
    /**
     * Optional weighting for these matches
     */
    weight?: number | undefined;
};
//# sourceMappingURL=dataFormat.d.ts.map