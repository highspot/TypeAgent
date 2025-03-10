import { Chunk } from "./chunkSchema.js";
import { ChunkDescription } from "./selectorSchema.js";
export declare function makeBatches(chunks: Chunk[], batchSize: number, // In characters
maxChunks: number): Chunk[][];
export declare function keepBestChunks(chunkDescs: ChunkDescription[], // Sorted by descending relevance
allChunks: Chunk[], batchSize: number): Chunk[];
//# sourceMappingURL=batching.d.ts.map