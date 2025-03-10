import * as vector from "./vector";
import { ScoredItem } from "../memory";
export type Embedding = Float32Array;
/**
 * A normalized embedding has unit length.
 * This lets us use Dot Products instead of Cosine Similarity in nearest neighbor searches
 */
export type NormalizedEmbedding = Float32Array;
export declare enum SimilarityType {
    Cosine = 0,// Note: Use Dot if working with Normalized Embeddings
    Dot = 1
}
/**
 * Converts the given vector into a NormalizedEmbedding
 * @param src source vector
 * @returns a normalized embedding
 */
export declare function createNormalized(src: vector.Vector): NormalizedEmbedding;
/**
 * Returns the similarity between x and y
 * @param x
 * @param y
 * @param type
 * @returns
 */
export declare function similarity(x: Embedding, y: Embedding, type: SimilarityType): number;
/**
 * Returns the nearest neighbor to target from the given list of embeddings
 * @param list
 * @param other
 * @param type
 * @returns
 */
export declare function indexOfNearest(list: Embedding[], other: Embedding, type: SimilarityType): ScoredItem;
/**
 * Given a list of embeddings and a test embedding, return at most maxMatches ordinals
 * of the nearest items that meet the provided minScore threshold
 * @param list
 * @param other
 * @param maxMatches
 * @param type Note: Most of our embeddings are *normalized* which will run significantly faster with Dot
 * @returns
 */
export declare function indexesOfNearest(list: Embedding[], other: Embedding, maxMatches: number, type: SimilarityType, minScore?: number): ScoredItem[];
/**
 * Given a list of embeddings and a test embedding, return ordinals
 * of the nearest items that meet the provided minScore threshold
 * @param list
 * @param other
 * @param similarityType
 * @param minScore
 * @returns
 */
export declare function indexesOfAllNearest(list: Embedding[], other: Embedding, similarityType: SimilarityType, minScore?: number): ScoredItem[];
export interface TopNList<T> {
    push(item: T, score: number): void;
    byRank(): ScoredItem<T>[];
    valuesByRank(): T[];
    reset(): void;
}
export declare function createTopNList<T>(maxMatches: number): TopNList<T>;
export declare function getTopK<T>(items: IterableIterator<ScoredItem<T>>, topK: number): ScoredItem<T>[];
/**
 * Uses a minHeap to maintain only the TopN matches - by rank - in memory at any time.
 * Automatically purges matches that no longer meet the bar
 * This allows us to iterate over very large collections without having to retain every score for a final rank sort
 */
export declare class TopNCollection<T = number> {
    private _items;
    private _count;
    private _maxCount;
    constructor(maxCount: number, nullValue: T);
    get length(): number;
    reset(): void;
    get pop(): ScoredItem<T>;
    get top(): ScoredItem<T>;
    push(item: T, score: number): void;
    byRank(): ScoredItem<T>[];
    valuesByRank(): T[];
    private sortDescending;
    private removeTop;
    private upHeap;
    private downHeap;
}
//# sourceMappingURL=embeddings.d.ts.map