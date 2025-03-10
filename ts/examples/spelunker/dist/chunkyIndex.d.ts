import { ChatModel, TextEmbeddingModel } from "aiclient";
import * as knowLib from "knowledge-processor";
import { ObjectFolder } from "typeagent";
import { FileDocumenter } from "./fileDocumenter.js";
import { Chunk, ChunkId } from "./pythonChunker.js";
import { QuerySpecs } from "./makeQuerySchema.js";
import { TypeChatJsonTranslator } from "typechat";
import { AnswerSpecs } from "./makeAnswerSchema.js";
export declare const IndexNames: string[];
export type IndexType = (typeof IndexNames)[number];
export type NamedIndex = [IndexType, knowLib.TextIndex<string, ChunkId>];
export declare class ChunkyIndex {
    chatModel: ChatModel;
    miniModel: ChatModel;
    embeddingModel: TextEmbeddingModel;
    fileDocumenter: FileDocumenter;
    queryMaker: TypeChatJsonTranslator<QuerySpecs>;
    answerMaker: TypeChatJsonTranslator<AnswerSpecs>;
    rootDir: string;
    answerFolder: ObjectFolder<AnswerSpecs>;
    chunkFolder: ObjectFolder<Chunk>;
    indexes: Map<IndexType, knowLib.TextIndex<string, ChunkId>>;
    private constructor();
    static createInstance(rootDir: string): Promise<ChunkyIndex>;
    reInitialize(rootDir: string): Promise<void>;
    getIndexByName(indexName: IndexType): knowLib.TextIndex<string, ChunkId>;
    allIndexes(): NamedIndex[];
}
//# sourceMappingURL=chunkyIndex.d.ts.map