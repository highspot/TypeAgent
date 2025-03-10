import * as sqlite from "better-sqlite3";
import { TypeChatJsonTranslator } from "typechat";
import { ChatModel, TextEmbeddingModel } from "aiclient";
import { OracleSpecs } from "./oracleSchema.js";
import { SelectorSpecs } from "./selectorSchema.js";
import { SummarizerSpecs } from "./summarizerSchema.js";
export interface QueryContext {
    chatModel: ChatModel;
    miniModel: ChatModel;
    embeddingModel: TextEmbeddingModel;
    oracle: TypeChatJsonTranslator<OracleSpecs>;
    chunkSelector: TypeChatJsonTranslator<SelectorSpecs>;
    chunkSummarizer: TypeChatJsonTranslator<SummarizerSpecs>;
    databaseLocation: string;
    database: sqlite.Database | undefined;
}
export declare function createQueryContext(dbFile?: string): QueryContext;
//# sourceMappingURL=queryContext.d.ts.map