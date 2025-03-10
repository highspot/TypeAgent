import { SchemaInfoProvider } from "../explanation/schemaInfoProvider.js";
import { ExplanationData } from "../explanation/explanationData.js";
import { ExplainerFactory } from "../cache/factory.js";
import { ConstructionCache } from "./constructionCache.js";
export type ImportConstructionResult = {
    existingCount: number;
    inputCount: number;
    newCount: number;
    addCount: number;
};
export declare function importConstructions(explanationData: ExplanationData[], constructionStore: ConstructionCache, getExplainerForTranslator: ExplainerFactory, mergeMatchSets: boolean, cacheConflicts: boolean, schemaInfoProvider?: SchemaInfoProvider, ignoreSourceHash?: boolean): ImportConstructionResult;
//# sourceMappingURL=importConstructions.d.ts.map