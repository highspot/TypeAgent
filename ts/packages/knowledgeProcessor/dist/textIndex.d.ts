import { FileSystem, ObjectFolder, ObjectFolderSettings, ScoredItem, SemanticIndex } from "typeagent";
import { HitTable } from "./setOperations.js";
import { TextBlock } from "./text.js";
import { TextEmbeddingModel } from "aiclient";
import { TextMatcher } from "./textMatcher.js";
/**
 * A text index helps you index textual information.
 * A text index is a map. text --> where that text was seen.
 * A text index stores and retrieves "postings" (defined below) for a given piece of text.
 * Postings:
 * - Text values (term, phrase, etc) is found in a "source". Each source has a unique Id
 * - Postings are the set of source ids a value is found in
 *
 * What a source is up to you. A source can be a text block, or a document, or an entity or..
 */
export interface TextIndex<TTextId = any, TSourceId = any> {
    text(): IterableIterator<string>;
    ids(): AsyncIterableIterator<TTextId>;
    entries(): AsyncIterableIterator<TextBlock<TSourceId>>;
    /**
     * Get the postings (source ids) for the the given text. Uses exact matching.
     * For fuzzy matching, use getNearest
     * @param text
     * @returns If value matches, returns
     */
    get(text: string): Promise<TSourceId[] | undefined>;
    /**
     * How many unique sources is this value seen?
     * @param text
     */
    getFrequency(text: string): Promise<number>;
    getById(id: TTextId): Promise<TSourceId[] | undefined>;
    getByIds(ids: TTextId[]): Promise<(TSourceId[] | undefined)[]>;
    /**
     * Return the text Id for the given text.
     * @param text
     * @returns text id if the value is indexed. Else returns undefined
     */
    getId(text: string): Promise<TTextId | undefined>;
    /**
     * Return the Ids for the given array of texts
     * @param texts
     */
    getIds(texts: string[]): Promise<(TTextId | undefined)[]>;
    /**
     * Return the text for the given text id
     * @param id
     */
    getText(id: TTextId): Promise<string | undefined>;
    /**
     * Add postings for the given text.
     * Merges the new postings with the existing postings
     * TODO: rename to addUpdate
     * @param text
     * @param postings
     */
    put(text: string, postings?: TSourceId[]): Promise<TTextId>;
    /**
     *  TODO: rename to addUpdateMultiple
     * @param values
     */
    putMultiple(values: TextBlock<TSourceId>[]): Promise<TTextId[]>;
    /**
     * Add source Ids for the given text Id
     * TODO: rename to addUpdateSources
     * @param id
     * @param postings
     */
    addSources(id: TTextId, postings: TSourceId[]): Promise<void>;
    /**
     * Get the sourceIds for the texts in this index that are nearest to the given value
     * Ids are returned in sorted order, with duplicates removed
     * @param text
     * @param maxMatches
     * @param minScore
     */
    getNearest(text: string, maxMatches?: number, minScore?: number): Promise<TSourceId[]>;
    /**
     * Get the sourceIds for the texts nearest to the given values
     * Ids are returned in sorted order, with duplicates removed
     * @param values
     * @param maxMatches
     * @param minScore
     */
    getNearestMultiple(values: string[], maxMatches?: number, minScore?: number): Promise<TSourceId[]>;
    getNearestHits(value: string, hitTable: HitTable<TSourceId>, maxMatches?: number, minScore?: number, scoreBoost?: number, aliases?: TextMatcher<TTextId>): Promise<void>;
    getNearestHitsMultiple(values: string[], hitTable: HitTable<TSourceId>, maxMatches?: number, minScore?: number, scoreBoost?: number, aliases?: TextMatcher<TTextId>): Promise<void>;
    nearestNeighbors(value: string, maxMatches: number, minScore?: number): Promise<ScoredItem<TSourceId[]>[]>;
    /**
     * Return the TextIds of the text nearest to the given value.
     * @param value
     * @param maxMatches
     * @param minScore
     */
    getNearestText(value: string, maxMatches: number, minScore?: number, aliases?: TextMatcher<TTextId>): Promise<TTextId[]>;
    /**
     * Return the TextIds of the texts nearest to the given values.
     * @param value
     * @param maxMatches
     * @param minScore
     */
    getNearestTextMultiple(values: string[], maxMatches: number, minScore?: number): Promise<TTextId[]>;
    /**
     * Return the TextIds of the nearest matching text + their scores
     * @param value
     * @param maxMatches
     * @param minScore
     */
    nearestNeighborsText(value: string, maxMatches: number, minScore?: number): Promise<ScoredItem<TTextId>[]>;
    nearestNeighborsPairs(value: string, maxMatches: number, minScore?: number): Promise<ScoredItem<TextBlock<TSourceId>>[]>;
    remove(textId: TTextId, postings: TSourceId | TSourceId[]): Promise<void>;
}
export type TextIndexSettings = {
    caseSensitive: boolean;
    concurrency: number;
    semanticIndex?: boolean | undefined;
    embeddingModel?: TextEmbeddingModel | undefined;
};
export declare function createTextIndex<TSourceId = any>(settings: TextIndexSettings, folderPath: string, folderSettings?: ObjectFolderSettings, fSys?: FileSystem, textFolder?: ObjectFolder<string>): Promise<TextIndex<string, TSourceId>>;
export declare function searchIndex<TTextId = any, TSourceId = any>(index: TextIndex<TTextId, TSourceId>, value: string, exact: boolean, count?: number, minScore?: number): Promise<ScoredItem<TSourceId[]>[]>;
export declare function searchIndexText<TTextId = any, TSourceId = any>(index: TextIndex<TTextId, TSourceId>, value: string, exact: boolean, count?: number, minScore?: number): Promise<ScoredItem<TTextId>[]>;
export declare function createSemanticIndexFolder(folderPath: string, folderSettings?: ObjectFolderSettings, concurrency?: number, model?: TextEmbeddingModel, fSys?: FileSystem): Promise<SemanticIndex>;
export declare function removeSemanticIndexFolder(folderPath: string, fSys?: FileSystem): Promise<void>;
export interface TermSet {
    has(term: string): boolean;
    put(term: string): void;
}
export declare function createTermSet(caseSensitive?: boolean): {
    has(term: string): boolean;
    put(term: string): void;
};
export interface TermMap {
    size(): number;
    get(term: string): string | undefined;
    put(term: string, value: string): void;
}
export declare function createTermMap(caseSensitive?: boolean): {
    size(): number;
    get(term: string): string | undefined;
    put(term: string, value: string): void;
};
//# sourceMappingURL=textIndex.d.ts.map