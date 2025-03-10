import { ScoredItem } from "../memory";
import { SimilarityType, NormalizedEmbedding, Embedding } from "./embeddings";
import { EmbeddingModel, TextEmbeddingModel } from "aiclient";
/**
 * An index that allows lookup of nearest neighbors of T using vector similarity matching
 */
export interface VectorIndex<ID = number> {
    /**
     * Return the nearest neighbor for value
     * @param value
     */
    nearestNeighbor(value: Embedding, similarity: SimilarityType, minScore?: number): Promise<ScoredItem<ID> | undefined>;
    /**
     * Return upto maxMatches nearest neighbors
     * @param value
     * @param maxMatches
     */
    nearestNeighbors(value: Embedding, maxMatches: number, similarity: SimilarityType, minScore?: number): Promise<ScoredItem<ID>[]>;
}
/**
 * Generates a normalized embedding for the given value from the embedding model
 * Batch support is available for text embeddings (see generateTextEmbeddings)
 * @param model embedding model
 * @param value value to generate an embedding for
 * @returns
 */
export declare function generateEmbedding<T = string>(model: EmbeddingModel<T>, value: T | NormalizedEmbedding): Promise<NormalizedEmbedding>;
/**
 * Generate an embedding for a single value
 * Batch support is available for text embeddings (see generateTextEmbeddings)
 * @param model embedding model
 * @param value value to generate an embedding for
 */
export declare function generateEmbeddingWithRetry<T>(model: EmbeddingModel<T>, value: T | NormalizedEmbedding, retryMaxAttempts?: number, retryPauseMs?: number): Promise<Float32Array>;
/**
 * Generate embeddings in parallel
 * Uses batching if model supports it
 * @param model
 * @param values strings for which to generate embeddings
 * @param maxCharsPerChunk Models can limit the total # of chars per batch
 * @param concurrency default is 2
 * @returns
 */
export declare function generateTextEmbeddings(model: TextEmbeddingModel, values: string[], concurrency?: number, maxCharsPerChunk?: number): Promise<NormalizedEmbedding[]>;
/**
 * Same as generateTextEmbeddings, but with retries
 * @param model
 * @param values
 * @param retryMaxAttempts
 * @param retryPauseMs
 * @param maxCharsPerChunk
 * @returns
 */
export declare function generateTextEmbeddingsWithRetry(model: TextEmbeddingModel, values: string[], retryMaxAttempts?: number, retryPauseMs?: number, maxCharsPerChunk?: number): Promise<NormalizedEmbedding[]>;
export type EmbeddedValue<T> = {
    value: T;
    embedding: NormalizedEmbedding;
};
export interface VectorStore<ID = string> extends VectorIndex<ID> {
    exists(id: ID): boolean;
    put(value: Embedding, id?: ID | undefined): Promise<ID>;
    get(id: ID): Promise<Embedding | undefined>;
    remove(id: ID): Promise<void>;
}
//# sourceMappingURL=vectorIndex.d.ts.map