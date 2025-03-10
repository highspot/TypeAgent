import { dateTime } from "typeagent";
import { TextStore } from "./textStore.js";
export declare function valueToString(value: any, stringify?: (value: any) => string): string;
export declare enum TextBlockType {
    Raw = 0,
    Paragraph = 1,
    Sentence = 2,
    Word = 3
}
/**
 * A block of text
 * TextBlock includes an optional set of sourceIds: Ids for the artifact(doc, message, web page)
 * from where this text block was taken
 */
export interface TextBlock<TId = any> {
    type: TextBlockType;
    /**
     * The text for this text block
     */
    value: string;
    sourceIds?: TId[] | undefined;
}
export interface SourceTextBlock<TId = any, TBlockId = any> extends TextBlock<TId> {
    blockId: TBlockId;
    timestamp?: Date;
}
export type TimestampedTextBlock<TSourceId> = dateTime.Timestamped<TextBlock<TSourceId>>;
export declare function collectBlockIds(blocks: Iterable<SourceTextBlock>): any[] | undefined;
export declare function collectSourceIds(blocks?: Iterable<TextBlock>): any[] | undefined;
export declare function collectBlockText(blocks: Iterable<TextBlock>, sep: string): string;
export declare function appendTextBlock(dest: TextBlock, newBlock: TextBlock): void;
export declare function getTextBlockSources(store: TextStore, blocks: TextBlock[]): Promise<TextBlock[] | undefined>;
export declare function flattenTimestampedBlocks<TSourceId>(entries: Iterable<dateTime.Timestamped<TextBlock<TSourceId>[]> | undefined>): IterableIterator<TimestampedTextBlock<TSourceId>>;
//# sourceMappingURL=text.d.ts.map