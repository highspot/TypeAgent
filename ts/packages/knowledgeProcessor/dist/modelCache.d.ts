import { TextEmbeddingModel } from "aiclient";
import { collections } from "typeagent";
export interface TextEmbeddingModelWithCache extends TextEmbeddingModel {
    readonly cache: collections.Cache<string, number[]>;
}
/**
 * Create an embedding model that leverages a cache to improve performance
 * @param model
 * @param cacheSize
 * @returns
 */
export declare function createEmbeddingCache(model: TextEmbeddingModel, cacheSize: number): TextEmbeddingModelWithCache;
//# sourceMappingURL=modelCache.d.ts.map