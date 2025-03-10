import { Action, ConcreteEntity, KnowledgeResponse, Value } from "./knowledgeSchema.js";
import { Result, TypeChatJsonTranslator, TypeChatLanguageModel } from "typechat";
import { SourceTextBlock, TextBlock } from "../text.js";
export interface KnowledgeExtractor {
    readonly settings: KnowledgeExtractorSettings;
    extract(message: string): Promise<KnowledgeResponse | undefined>;
    extractWithRetry(message: string, maxRetries: number): Promise<Result<KnowledgeResponse>>;
    translator?: TypeChatJsonTranslator<KnowledgeResponse>;
}
export type KnowledgeExtractorSettings = {
    maxContextLength: number;
    mergeActionKnowledge?: boolean;
};
export declare function createKnowledgeExtractor(model: TypeChatLanguageModel, extractorSettings?: KnowledgeExtractorSettings | undefined): KnowledgeExtractor;
/**
 * Return default settings
 * @param maxCharsPerChunk (optional)
 * @returns
 */
export declare function createKnowledgeExtractorSettings(maxCharsPerChunk?: number): KnowledgeExtractorSettings;
export type ExtractedEntity<TSourceId = any> = {
    value: ConcreteEntity;
    sourceIds: TSourceId[];
};
export type ExtractedAction<TSourceId = any> = {
    value: Action;
    sourceIds: TSourceId[];
};
/**
 * Knowledge extracted from a source text block
 */
export type ExtractedKnowledge<TSourceId = any> = {
    entities?: ExtractedEntity<TSourceId>[] | undefined;
    topics?: TextBlock<TSourceId>[] | undefined;
    actions?: ExtractedAction<TSourceId>[] | undefined;
    sourceEntityName?: string | undefined;
    tags?: string[] | undefined;
};
/**
 * Create knowledge from pre-existing entities, topics and actions
 * @param source
 * @returns
 */
export declare function createExtractedKnowledge(source: SourceTextBlock, knowledge: KnowledgeResponse | ConcreteEntity[]): ExtractedKnowledge;
/**
 * Extract knowledge from source text
 * @param extractor
 * @param message
 * @returns
 */
export declare function extractKnowledgeFromBlock(extractor: KnowledgeExtractor, message: SourceTextBlock): Promise<[SourceTextBlock, ExtractedKnowledge] | undefined>;
/**
 * Extract knowledge from the given blocks concurrently
 * @param extractor
 * @param blocks
 * @param concurrency
 * @returns
 */
export declare function extractKnowledge(extractor: KnowledgeExtractor, blocks: SourceTextBlock[], concurrency: number): Promise<([SourceTextBlock<any, any>, ExtractedKnowledge<any>] | undefined)[]>;
export declare const NoEntityName = "none";
export declare function knowledgeValueToString(value: Value): string;
export declare enum KnownEntityTypes {
    Person = "person",
    Email = "email",
    Email_Address = "email_address",
    Email_Alias = "alias",
    Memorized = "__memory",
    Message = "message"
}
export declare function isMemorizedEntity(entityType: string[]): boolean;
export declare function isKnowledgeEmpty(knowledge: KnowledgeResponse): boolean;
export declare function mergeKnowledge(x: ExtractedKnowledge, y?: ExtractedKnowledge | undefined): ExtractedKnowledge;
export declare function isValidEntityName(name: string | undefined): boolean;
//# sourceMappingURL=knowledge.d.ts.map