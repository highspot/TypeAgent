import { ChunkId, ChunkedFile, ChunkerErrorItem } from "./chunkSchema.js";
export declare function generate_id(): ChunkId;
export declare function chunkifyTypeScriptFiles(fileNames: string[]): Promise<(ChunkedFile | ChunkerErrorItem)[]>;
export declare class Testing {
    static main(): Promise<void>;
}
//# sourceMappingURL=typescriptChunker.d.ts.map