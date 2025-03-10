import { ChatModel } from "aiclient";
import { FileDocumentation } from "./fileDocSchema.js";
import { Chunk } from "./pythonChunker.js";
export interface FileDocumenter {
    document(chunks: Chunk[]): Promise<FileDocumentation>;
}
export declare function createFileDocumenter(model: ChatModel): FileDocumenter;
//# sourceMappingURL=fileDocumenter.d.ts.map