import * as sqlite from "better-sqlite3";
import { ActionResult } from "@typeagent/agent-sdk";
import { Chunk } from "./chunkSchema.js";
import { SpelunkerContext } from "./spelunkerActionHandler.js";
export declare function searchCode(context: SpelunkerContext, input: string): Promise<ActionResult>;
export declare function readAllChunksFromDatabase(db: sqlite.Database): Promise<Chunk[]>;
export declare function selectChunks(context: SpelunkerContext, allChunks: Chunk[], input: string): Promise<Chunk[]>;
export interface FileMtimeSize {
    file: string;
    mtime: number;
    size: number;
}
export declare function loadDatabase(context: SpelunkerContext): Promise<void>;
//# sourceMappingURL=searchCode.d.ts.map