export type ChunkId = string;
export type OracleSpecs = {
    question: string;
    answer: string;
    references: ChunkId[];
    confidence: number;
    message?: string;
};
//# sourceMappingURL=oracleSchema.d.ts.map