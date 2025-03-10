import { TextEmbeddingModel } from "aiclient";
import { ScoredItem } from "../memory";
import { VectorStore } from "./vectorIndex";
import { NormalizedEmbedding } from "./embeddings";
export interface SemanticIndex<ID = string> {
    readonly store: VectorStore<ID>;
    /**
     * Return an embedding for the given text
     * @param text
     */
    getEmbedding(text: string): Promise<NormalizedEmbedding>;
    /**
     *
     * @param text
     * @param id
     * @param onlyIfNew Only update the embedding if the "id" does not exist
     */
    put(text: string, id?: ID | undefined, onlyIfNew?: boolean): Promise<ID>;
    putMultiple(items: [string, ID | undefined][], onlyIfNew?: boolean, concurrency?: number): Promise<[string, ID][]>;
    /**
     * Return the nearest neighbor of value
     * @param value
     * @param minScore
     */
    nearestNeighbor(value: string, minScore?: number): Promise<ScoredItem<ID> | undefined>;
    /**
     * Return upto maxMatches nearest neighbors
     * @param value
     * @param maxMatches
     */
    nearestNeighbors(value: string, maxMatches: number, minScore?: number): Promise<ScoredItem<ID>[]>;
}
/**
 * Creates a SemanticIndex OVER an implementation of a VectorStore but does embedding generation itself.
 * Automatically creates embeddings for text... both at time of put and at time of nearestNeighbor
 * The store can be in-memory (such as in this library), local, remote (Azure) etc.
 * @param store vector store to use
 * @param model model to embed with
 * @returns
 */
export declare function createSemanticIndex<ID = string>(store: VectorStore<ID>, model?: TextEmbeddingModel): SemanticIndex<ID>;
//# sourceMappingURL=semanticIndex.d.ts.map