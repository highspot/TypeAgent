import * as sqlite from "better-sqlite3";
import { Chunk } from "./chunkSchema.js";
import { SpelunkerContext } from "./spelunkerActionHandler.js";
export declare function summarizeChunks(context: SpelunkerContext, chunks: Chunk[]): Promise<void>;
export declare function prepareChunks(chunks: Chunk[]): string;
export declare function prepareSummaries(db: sqlite.Database): string;
//# sourceMappingURL=summarizing.d.ts.map