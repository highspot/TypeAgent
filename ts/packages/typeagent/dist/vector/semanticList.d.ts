import { TextEmbeddingModel } from "aiclient";
import { ScoredItem } from "../memory";
import { NormalizedEmbedding } from "./embeddings";
import { EmbeddedValue, VectorIndex } from "./vectorIndex";
/**
 * An in-memory list of T, {stringValue of T} items that also maintains embeddings of stringValue
 * You can semantic search this list using query stringValues
 *
 * {stringValue could be a Description of T, or any other string forms}
 */
export interface SemanticList<T> extends VectorIndex<T> {
    values: EmbeddedValue<T>[];
    indexOf(value: string | NormalizedEmbedding): Promise<ScoredItem>;
    indexesOf(value: string | NormalizedEmbedding, maxMatches: number, minScore?: number): Promise<ScoredItem[]>;
    nearestNeighbor(value: string | NormalizedEmbedding): Promise<ScoredItem<T> | undefined>;
    nearestNeighbors(value: string | NormalizedEmbedding, maxMatches: number, minScore?: number): Promise<ScoredItem<T>[]>;
    /**
     * Push an item onto the semantic list.
     * @param value
     * @param stringValue
     * @param retryMaxAttempts (optional) Default is 2
     * @param retryPauseMs (optional) Default is 1000ms with exponential backoff
     */
    push(value: T, stringValue?: string, retryMaxAttempts?: number, retryPauseMs?: number): Promise<void>;
    pushMultiple(values: T[], retryMaxAttempts?: number, retryPauseMs?: number, concurrency?: number): Promise<void>;
    pushValue(value: EmbeddedValue<T>): void;
}
export declare function createSemanticList<T = any>(model: TextEmbeddingModel, existingValues?: EmbeddedValue<T>[], stringify?: (value: T) => string): SemanticList<T>;
//# sourceMappingURL=semanticList.d.ts.map