import * as kp from "knowpro";
import * as knowLib from "knowledge-processor";
import { ChatPrinter } from "../chatPrinter.js";
import * as cm from "conversation-memory";
import * as im from "image-memory";
export declare class KnowProPrinter extends ChatPrinter {
    conversation: kp.IConversation | undefined;
    sortAsc: boolean;
    constructor(conversation?: kp.IConversation | undefined);
    writeDateRange(dateTime: kp.DateRange): void;
    writeMetadata(metadata: any): void;
    writeMessage(message: kp.IMessage): this;
    writeEntity(entity: knowLib.conversation.ConcreteEntity | undefined): this;
    writeAction(action: knowLib.conversation.Action | undefined): this;
    writeTopic(topic: kp.Topic | undefined): this;
    writeTag(tag: kp.Tag | undefined): this;
    writeSemanticRef(semanticRef: kp.SemanticRef): this;
    writeSemanticRefs(refs: kp.SemanticRef[] | undefined): this;
    writeScoredSemanticRefs(semanticRefMatches: kp.ScoredSemanticRef[], semanticRefs: kp.SemanticRef[], maxToDisplay: number): this;
    writeScoredKnowledge(scoredKnowledge: kp.ScoredKnowledge): this;
    private writeScoredRef;
    writeSearchResult(conversation: kp.IConversation, result: kp.SearchResult | undefined, maxToDisplay: number): this;
    writeSearchResults(conversation: kp.IConversation, results: Map<kp.KnowledgeType, kp.SearchResult>, maxToDisplay: number, distinct?: boolean): this;
    private writeResult;
    private writeResultDistinct;
    writeConversationInfo(conversation: kp.IConversation): this;
    writePodcastInfo(podcast: cm.Podcast): this;
    writeImageCollectionInfo(imageCollection: im.ImageCollection): this;
    writeIndexingResults(results: kp.IndexingResults): this;
    writeSearchFilter(action: knowLib.conversation.GetAnswerWithTermsActionV2): void;
}
//# sourceMappingURL=knowproPrinter.d.ts.map