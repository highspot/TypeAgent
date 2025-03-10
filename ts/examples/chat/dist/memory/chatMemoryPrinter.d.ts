import * as knowLib from "knowledge-processor";
import { conversation } from "knowledge-processor";
import { InteractiveIo, StopWatch } from "interactive-app";
import { collections, dateTime } from "typeagent";
import { ChatPrinter } from "../chatPrinter.js";
import { ChalkInstance } from "chalk";
export declare class ChatMemoryPrinter extends ChatPrinter {
    constructor(io: InteractiveIo);
    writeLink(filePath: string): this;
    writeBlocks(color: ChalkInstance, blocks: knowLib.TextBlock[] | undefined, ids?: string[]): void;
    writeSourceBlock(block: knowLib.SourceTextBlock): void;
    writeTimestamp(timestamp?: Date): void;
    writeBatchProgress(batch: collections.Slice, label?: string | undefined, total?: number | undefined): void;
    writeTemporalBlock(color: ChalkInstance, block: dateTime.Timestamped<knowLib.TextBlock>): void;
    writeTemporalBlocks(color: ChalkInstance, blocks: (dateTime.Timestamped<knowLib.TextBlock> | undefined)[]): void;
    writeKnowledge(knowledge: conversation.KnowledgeResponse): void;
    writeTopics(topics: string[] | undefined): void;
    writeEntities(entities: conversation.ConcreteEntity[] | undefined): void;
    writeCompositeEntity(entity: conversation.CompositeEntity | undefined): void;
    writeExtractedEntities(entities?: conversation.ExtractedEntity | (conversation.ExtractedEntity | undefined)[] | undefined): void;
    writeCompositeEntities(entities: (conversation.CompositeEntity | undefined)[]): void;
    writeCompositeAction(action: conversation.CompositeAction | undefined): void;
    writeActionGroups(actions: conversation.ActionGroup[]): void;
    writeAction(action: conversation.Action | undefined, writeParams?: boolean): void;
    writeActions(actions: conversation.Action[] | undefined): void;
    writeExtractedActions(actions?: (knowLib.conversation.ExtractedAction | undefined)[] | undefined): void;
    writeSearchResponse(response: conversation.SearchResponse): void;
    writeResultStats(response: conversation.SearchResponse | undefined): void;
    writeSearchQuestion(result: conversation.SearchTermsActionResponse | conversation.SearchTermsActionResponseV2 | undefined, debug?: boolean): void;
    writeSearchTermsResult(result: conversation.SearchTermsActionResponse | conversation.SearchTermsActionResponseV2, debug?: boolean): void;
    writeAnswer(response: conversation.AnswerResponse, fallback?: boolean): void;
    writeIndexingMetrics(stats: knowLib.IndexingStats, totalItems: number, timing: StopWatch): void;
}
//# sourceMappingURL=chatMemoryPrinter.d.ts.map