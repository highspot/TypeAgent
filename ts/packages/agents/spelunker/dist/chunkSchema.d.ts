import { FileDocumentation } from "./fileDocSchema.js";
export type ChunkId = string;
export interface Blob {
    start: number;
    lines: string[];
    breadcrumb?: ChunkId | undefined;
}
export interface Chunk {
    chunkId: ChunkId;
    treeName: string;
    codeName: string;
    blobs: Blob[];
    parentId: ChunkId;
    children: ChunkId[];
    fileName: string;
    lineNo: number;
    docs?: FileDocumentation;
}
export interface ChunkedFile {
    fileName: string;
    chunks: Chunk[];
}
export interface ChunkerErrorItem {
    error: string;
    filename?: string;
    output?: string;
}
//# sourceMappingURL=chunkSchema.d.ts.map