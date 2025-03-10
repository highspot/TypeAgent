import { HistoryContext } from "../explanation/requestAction.js";
import { Construction, ConstructionJSON, MatchResult } from "./constructions.js";
import { MatchSet, MatchSetJSON, MatchSetJSONV2 } from "./matchPart.js";
import { Transforms, TransformsJSON } from "./transforms.js";
type AddConstructionResult = {
    added: true;
    existing: Construction[];
    construction: Construction;
} | {
    added: false;
    existing: Construction[];
};
type ConstructionCacheJSON = {
    version: number;
    explainerName: string;
    matchSets: MatchSetJSON[];
    constructionNamespaces: {
        name: string;
        constructions: ConstructionJSON[];
    }[];
    transformNamespaces: {
        name: string;
        transforms: TransformsJSON;
    }[];
};
type Constructions = {
    constructions: Construction[];
    maxId: number;
};
export type NamespaceKeyFilter = (namespaceKey: string) => boolean;
export type MatchOptions = {
    namespaceKeys?: string[] | undefined;
    wildcard?: boolean;
    rejectReferences?: boolean;
    conflicts?: boolean;
    history?: HistoryContext | undefined;
};
export declare class ConstructionCache {
    readonly explainerName: string;
    private readonly matchSetsByUid;
    private readonly constructionNamespaces;
    private readonly transformNamespaces;
    constructor(explainerName: string);
    get count(): number;
    getFilteredCount(filter: NamespaceKeyFilter): number;
    private addMatchSet;
    private ensureConstructionNamespace;
    private mergeTransformNamespaces;
    addConstruction(namespaceKeys: string[], construction: Construction, mergeMatchSets: boolean, cacheConflicts?: boolean): AddConstructionResult;
    forceRegexp(): void;
    delete(namespace: string, id: number): number;
    private getMatches;
    prune(filter: NamespaceKeyFilter): number;
    match(request: string, options?: MatchOptions): MatchResult[];
    get matchSets(): IterableIterator<MatchSet>;
    toJSON(): {
        version: number;
        explainerName: string;
        matchSets: MatchSet[];
        constructionNamespaces: {
            name: string;
            constructions: Construction[];
        }[];
        transformNamespaces: {
            name: string;
            transforms: Transforms;
        }[];
    };
    static fromJSON(originalJSON: ConstructionCacheJSON | ConstructionCacheJSONV2): ConstructionCache;
    getConstructionNamespace(namespace: string): Constructions | undefined;
    getConstructionNamespaces(): string[];
    getTransformNamespaces(): Map<string, Transforms>;
}
type ConstructionCacheJSONV2 = {
    version: number;
    explainerName: string;
    matchSets: MatchSetJSONV2[];
    translators: {
        name: string;
        transforms: TransformsJSON;
        constructions: ConstructionJSON[];
    }[];
};
export {};
//# sourceMappingURL=constructionCache.d.ts.map