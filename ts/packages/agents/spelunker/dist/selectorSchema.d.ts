export type ChunkId = string;
export type ChunkDescription = {
    chunkId: ChunkId;
    relevance: number;
};
export type SelectorSpecs = {
    chunkDescs: ChunkDescription[];
    error?: string;
};
//# sourceMappingURL=selectorSchema.d.ts.map