import { NormalizedEmbedding, ScoredItem, NameValue } from "typeagent";
export interface ProgramNameIndex {
    addOrUpdate(programName: string): Promise<void>;
    remove(tabId: number): Promise<void>;
    reset(): Promise<void>;
    search(query: string | NormalizedEmbedding, maxMatches: number): Promise<ScoredItem<NameValue<string>>[]>;
    toJSON(): Record<string, string>;
}
export declare function loadProgramNameIndex(vals: Record<string, string | undefined>, json?: Record<string, string>): {
    addOrUpdate: (programName: string) => Promise<void>;
    remove: (tabId: number) => Promise<void>;
    reset: () => Promise<void>;
    search: (query: string | Float32Array, maxMatches: number) => Promise<ScoredItem<NameValue<string>>[]>;
    toJSON: () => {
        [k: string]: string;
    };
};
export declare function createProgramNameIndex(vals: Record<string, string | undefined>, initialEmbeddings?: Record<string, Float32Array>): {
    addOrUpdate: (programName: string) => Promise<void>;
    remove: (tabId: number) => Promise<void>;
    reset: () => Promise<void>;
    search: (query: string | NormalizedEmbedding, maxMatches: number) => Promise<ScoredItem<NameValue<string>>[]>;
    toJSON: () => {
        [k: string]: string;
    };
};
//# sourceMappingURL=programNameIndex.d.ts.map