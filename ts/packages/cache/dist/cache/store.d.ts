import { Construction, MatchResult } from "../constructions/constructions.js";
import { ExplanationData } from "../explanation/explanationData.js";
import { CacheConfig, CacheOptions } from "./cache.js";
import { ExplainerFactory } from "./factory.js";
import { SchemaInfoProvider } from "../explanation/schemaInfoProvider.js";
import { MatchOptions, NamespaceKeyFilter } from "../constructions/constructionCache.js";
import { PrintOptions } from "../constructions/constructionPrint.js";
type ConstructionStoreInfo = {
    filePath: string | undefined;
    modified: boolean;
    constructionCount: number;
    filteredConstructionCount: number;
    builtInCacheFilePath: string | undefined;
    builtInConstructionCount: number | undefined;
    filteredBuiltInConstructionCount: number | undefined;
    config: CacheConfig;
};
export interface ConstructionStore {
    isEnabled(): boolean;
    isModified(): boolean;
    getFilePath(): string | undefined;
    getConfig(): CacheConfig;
    setConfig(options: CacheOptions): void;
    isAutoSave(): boolean;
    setAutoSave(autoSave: boolean): Promise<void>;
    setBuiltInCache(builtInCacheFilePath: string | undefined): Promise<void>;
    newCache(filePath?: string, defaultConst?: boolean): Promise<void>;
    load(filePath?: string): Promise<void>;
    save(filePath?: string): Promise<boolean>;
    clear(): void;
    print(options: PrintOptions): void;
    delete(translatorName: string, id: number): Promise<void>;
    match(request: string, options?: MatchOptions): MatchResult[];
}
export declare class ConstructionStoreImpl implements ConstructionStore {
    private readonly explainerName;
    private cache;
    private builtInCache;
    private builtInCacheFilePath;
    private modified;
    private filePath;
    private autoSave;
    private config;
    constructor(explainerName: string, cacheOptions?: CacheOptions);
    private ensureCache;
    private createCache;
    isEnabled(): boolean;
    isModified(): boolean;
    getFilePath(): string | undefined;
    isAutoSave(): boolean;
    private doAutoSave;
    getConfig(): CacheConfig;
    setConfig(options: CacheOptions): {
        mergeMatchSets?: boolean | undefined;
        cacheConflicts?: boolean | undefined;
    };
    setBuiltInCache(builtInCacheFilePath: string | undefined): Promise<void>;
    newCache(filePath?: string): Promise<void>;
    import(data: ExplanationData[], getExplainer: ExplainerFactory, schemaInfoProvider?: SchemaInfoProvider, ignoreSourceHash?: boolean): Promise<import("../constructions/importConstructions.js").ImportConstructionResult>;
    load(filePath: string): Promise<void>;
    save(filePath?: string): Promise<boolean>;
    setAutoSave(autoSave: boolean): Promise<void>;
    clear(): void;
    delete(namespace: string, id: number): Promise<void>;
    getInfo(filter?: NamespaceKeyFilter): ConstructionStoreInfo | undefined;
    print(options: PrintOptions): void;
    /**
     * Add a construction to the cache
     * @param namespaceKeys separate the construction based on the schema name and hash in the action.  Used to quickly enable/disable construction based on translator is enabled
     * @param construction the construction to add
     * @returns the result of the construction addition
     */
    addConstruction(namespaceKeys: string[], construction: Construction): Promise<{
        added: true;
        existing: Construction[];
        construction: Construction;
    } | {
        added: false;
        existing: Construction[];
    }>;
    /**
     * Try to match the request and transform it into action using constructions
     *
     * @param request The request to match
     * @param translatorName optional scoping to only match against single translator
     * @returns All possible matches sorted by some heuristics of the likeliest match
     */
    match(request: string, options?: MatchOptions): MatchResult[];
    prune(filter: (namespaceKey: string) => boolean): Promise<number>;
}
export {};
//# sourceMappingURL=store.d.ts.map