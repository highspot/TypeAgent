export type ChunkDoc = {
    fileName?: string;
    lineNumber: number;
    name: string;
    bases?: string[];
    parameters?: string[];
    returnType?: string;
    summary: string;
    keywords?: string[];
    tags?: string[];
    synonyms?: string[];
    dependencies?: string[];
};
export type FileDocumentation = {
    chunkDocs?: ChunkDoc[];
};
//# sourceMappingURL=fileDocSchema.d.ts.map