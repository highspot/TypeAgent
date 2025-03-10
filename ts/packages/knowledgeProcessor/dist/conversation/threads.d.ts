import { NameValue } from "typeagent";
import { StorageProvider } from "../storageProvider.js";
import { DateTimeRange } from "./dateTimeSchema.js";
import { TagIndex } from "../knowledgeStore.js";
import { TermFilterV2 } from "./knowledgeTermSearchSchema2.js";
export interface ThreadDefinition {
    description: string;
    type: string;
}
export interface ThreadTimeRange extends ThreadDefinition {
    type: "temporal";
    timeRange: DateTimeRange;
}
export type ConversationThread = ThreadTimeRange;
export interface ThreadIndex<TThreadId = any> {
    readonly tagIndex: TagIndex;
    entries(): AsyncIterableIterator<NameValue<ConversationThread>>;
    add(threadDef: ConversationThread): Promise<TThreadId>;
    getIds(description: string): Promise<TThreadId[] | undefined>;
    getById(id: TThreadId): Promise<ConversationThread | undefined>;
    get(description: string): Promise<ConversationThread[] | undefined>;
    getNearest(description: string, maxMatches: number, minScore?: number): Promise<ConversationThread[]>;
    matchTags(filters: TermFilterV2[]): Promise<TThreadId[] | undefined>;
}
export declare function createThreadIndexOnStorage(rootPath: string, storageProvider: StorageProvider): Promise<ThreadIndex<string>>;
//# sourceMappingURL=threads.d.ts.map