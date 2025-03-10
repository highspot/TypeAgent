import { DateRange, IConversation, IMessage, MessageIndex } from "./interfaces.js";
import { ITimestampToTextRangeIndex, TimestampedTextRange } from "./interfaces.js";
/**
 * An index of timestamp => TextRanges.
 * * Timestamps must be unique.
 * *TextRanges need not be contiguous.
 */
export declare class TimestampToTextRangeIndex implements ITimestampToTextRangeIndex {
    private ranges;
    constructor();
    /**
     * Looks up text ranges in given date range.
     * Text ranges need not be contiguous
     * @param dateRange
     * @returns
     */
    lookupRange(dateRange: DateRange): TimestampedTextRange[];
    addTimestamp(messageIndex: MessageIndex, timestamp: string): boolean;
    addTimestamps(messageTimestamps: [MessageIndex, string][]): void;
    private insertTimestamp;
    clear(): void;
    private compareTimestampedRange;
    private dateToTimestamp;
}
export declare function buildTimestampIndex(conversation: IConversation): void;
export declare function addToTimestampIndex(timestampIndex: ITimestampToTextRangeIndex, messages: IMessage[], baseMessageIndex: MessageIndex): void;
//# sourceMappingURL=timestampIndex.d.ts.map