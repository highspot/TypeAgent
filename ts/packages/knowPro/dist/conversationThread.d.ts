import { IConversationThreads, ScoredThreadIndex, Thread, ThreadIndex } from "./interfaces.js";
import { TextEmbeddingIndex, TextEmbeddingIndexSettings } from "./fuzzyIndex.js";
export interface IConversationThreadData {
    threads?: IThreadDataItem[] | undefined;
}
export interface IThreadDataItem {
    thread: Thread;
    embedding: number[];
}
export declare class ConversationThreads implements IConversationThreads {
    settings: TextEmbeddingIndexSettings;
    threads: Thread[];
    embeddingIndex: TextEmbeddingIndex;
    constructor(settings: TextEmbeddingIndexSettings);
    addThread(thread: Thread): Promise<void>;
    lookupThread(text: string, maxMatches?: number, thresholdScore?: number): Promise<ScoredThreadIndex[]>;
    removeThread(threadIndex: ThreadIndex): void;
    clear(): void;
    buildIndex(): Promise<void>;
    serialize(): IConversationThreadData;
    deserialize(data: IConversationThreadData): void;
}
//# sourceMappingURL=conversationThread.d.ts.map