import { NormalizedEmbedding, ScoredItem, NameValue } from "typeagent";
export interface VscodeActionsIndex {
    addOrUpdate(actionName: string): Promise<void>;
    remove(actionName: string): Promise<void>;
    reset(): Promise<void>;
    search(query: string | NormalizedEmbedding, maxMatches: number): Promise<ScoredItem<NameValue<number>>[]>;
}
export declare function createVscodeActionsIndex(): {
    addOrUpdate: (actionName: string, actionData: any) => Promise<Float32Array>;
    remove: (actionName: string) => Promise<void>;
    reset: () => Promise<void>;
    search: (query: string | NormalizedEmbedding, maxMatches: number) => Promise<ScoredItem<NameValue<string>>[]>;
};
//# sourceMappingURL=embedActions.d.ts.map