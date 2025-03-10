import { IMessage } from "./interfaces.js";
import { TextEmbeddingIndexSettings } from "./fuzzyIndex.js";
import { RelatedTermIndexSettings } from "./relatedTermsIndex.js";
export type ConversationSettings = {
    relatedTermIndexSettings: RelatedTermIndexSettings;
    threadSettings: TextEmbeddingIndexSettings;
};
export declare function createConversationSettings(): ConversationSettings;
/**
 * Text (such as a transcript) can be collected over a time range.
 * This text can be partitioned into blocks. However, timestamps for individual blocks are not available.
 * Assigns individual timestamps to blocks proportional to their lengths.
 * @param turns Transcript turns to assign timestamps to
 * @param startDate starting
 * @param endDate
 */
export declare function timestampMessages(messages: IMessage[], startDate: Date, endDate: Date): void;
//# sourceMappingURL=import.d.ts.map