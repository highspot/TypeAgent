import { TextEmbeddingModel } from "aiclient";
import { Chunk, ChunkId } from "./chunkSchema.js";
import { SpelunkerContext } from "./spelunkerActionHandler.js";
export declare function makeEmbeddingModel(): TextEmbeddingModel;
export declare function loadEmbeddings(context: SpelunkerContext, chunks: Chunk[]): Promise<void>;
export declare function preSelectChunks(context: SpelunkerContext, input: string, maxChunks?: number): Promise<ChunkId[]>;
//# sourceMappingURL=embeddings.d.ts.map