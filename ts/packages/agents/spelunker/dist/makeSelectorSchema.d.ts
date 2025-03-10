export type ChunkId = string;
export type ChunkDescription = {
    chunkId: ChunkId;
    relevance: number;
};
export type SelectorSpecs = {
    chunks: ChunkDescription[];
    error?: string;
};
//# sourceMappingURL=makeSelectorSchema.d.ts.map