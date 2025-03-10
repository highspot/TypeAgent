import { DeepPartialUndefined } from "common-utils";
import * as Telemetry from "telemetry";
import { ExplanationData } from "../explanation/explanationData.js";
import { RequestAction } from "../explanation/requestAction.js";
import { SchemaInfoProvider } from "../explanation/schemaInfoProvider.js";
import { ConstructionStore } from "./store.js";
import { ExplainerFactory } from "./factory.js";
import { ExplanationOptions, ProcessExplanationResult } from "./explainWorkQueue.js";
export type ProcessRequestActionResult = {
    explanationResult: ProcessExplanationResult;
    constructionResult?: {
        added: boolean;
        message: string;
    };
};
export type CacheConfig = {
    mergeMatchSets: boolean;
    cacheConflicts: boolean;
};
export type CacheOptions = DeepPartialUndefined<CacheConfig>;
export declare function getSchemaNamespaceKeys(schemaNames: string[], schemaInfoProvider?: SchemaInfoProvider): string[];
export declare class AgentCache {
    readonly explainerName: string;
    private readonly schemaInfoProvider?;
    private _constructionStore;
    private readonly explainWorkQueue;
    private readonly namespaceKeyFilter?;
    private readonly logger;
    model?: string;
    constructor(explainerName: string, getExplainerForTranslator: ExplainerFactory, schemaInfoProvider?: SchemaInfoProvider | undefined, cacheOptions?: CacheOptions, logger?: Telemetry.Logger);
    get constructionStore(): ConstructionStore;
    getNamespaceKeys(schemaNames: string[]): string[];
    getInfo(): {
        filePath: string | undefined;
        modified: boolean;
        constructionCount: number;
        filteredConstructionCount: number;
        builtInCacheFilePath: string | undefined;
        builtInConstructionCount: number | undefined;
        filteredBuiltInConstructionCount: number | undefined;
        config: CacheConfig;
    } | undefined;
    prune(): Promise<number>;
    processRequestAction(requestAction: RequestAction, cache?: boolean, options?: ExplanationOptions): Promise<ProcessRequestActionResult>;
    import(data: ExplanationData[], ignoreSourceHash?: boolean): Promise<import("../index.js").ImportConstructionResult>;
}
//# sourceMappingURL=cache.d.ts.map