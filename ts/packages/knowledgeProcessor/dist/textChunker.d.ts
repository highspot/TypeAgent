import { TextBlock, TextBlockType } from "./text.js";
export type SplitOptions = {
    removeEmpty: boolean;
    trim: boolean;
};
/**
 * Split text and then perform additional tidying up
 * @param text
 * @param pattern
 * @param options
 * @returns
 */
export declare function split(text: string, pattern: string | RegExp, options?: SplitOptions): string[];
export declare function splitIntoLines(text: string, options?: SplitOptions): string[];
export declare function splitIntoWords(text: string, options?: SplitOptions): string[];
export declare function splitIntoSentences(text: string, options?: SplitOptions): string[];
/**
 * Assumes that paragraphs end with 2+ LF or 2+ CRLF
 * @param text
 * @returns paragraphs
 */
export declare function splitIntoParagraphs(text: string, options?: SplitOptions): string[];
export declare function splitSentenceIntoPhrases(text: string, options?: SplitOptions): string[];
/**
 * Split the given text into blocks.
 * Block types include paragraph, sentences, words..
 * @param text
 * @param blockType The type of blocks to produce
 * @param options
 * @returns
 */
export declare function splitIntoBlocks(text: string, blockType: TextBlockType, options?: SplitOptions | undefined): TextBlock[];
export declare function joinIntoChunks(strings: Iterable<string>, maxCharsPerChunk: number, separator?: string, autoTruncate?: boolean): IterableIterator<string>;
export declare function splitLargeTextIntoChunks(text: string | string[], maxCharsPerChunk: number, autoTruncate?: boolean): IterableIterator<string>;
export declare function joinTextBlocks(chunks: Iterable<TextBlock>, maxCharsPerChunk: number, separator?: string, autoTruncate?: boolean): IterableIterator<TextBlock>;
/**
 * Progressively splits text blocks to maximize the odds that a chunk contains coherent text
 * Raw --> Paragraphs
 * Paragraph --> Sentence
 * Sentence --> Words
 * @param block
 * @returns
 */
export declare function splitTextBlock(block: TextBlock, blockId?: any, options?: SplitOptions): TextBlock[];
export declare function isValidChunkSize(maxCharsPerChunk: number | undefined): boolean | 0 | undefined;
//# sourceMappingURL=textChunker.d.ts.map