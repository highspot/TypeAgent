import { FileDocumentation } from "./fileDocSchema.js";
export type ChunkId = string;
export interface Blob {
    start: number;
    lines: string[];
    breadcrumb?: boolean;
}
export interface Chunk {
    id: ChunkId;
    treeName: string;
    blobs: Blob[];
    parentId: ChunkId;
    children: ChunkId[];
    fileName: string;
    docs?: FileDocumentation;
}
export interface ChunkedFile {
    fileName: string;
    chunks: Chunk[];
}
export interface ErrorItem {
    error: string;
    filename?: string;
    output?: string;
}
export declare function chunkifyPythonFiles(filenames: string[]): Promise<(ChunkedFile | ErrorItem)[]>;
//# sourceMappingURL=pythonChunker.d.ts.map