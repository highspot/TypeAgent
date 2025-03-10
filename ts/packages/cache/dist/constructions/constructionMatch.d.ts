import { HistoryContext } from "../explanation/requestAction.js";
import { MatchedValues, MatchedValueTranslator } from "./constructionValue.js";
import { ConstructionPart } from "./constructions.js";
export type MatchConfig = {
    readonly enableWildcard: boolean;
    readonly rejectReferences: boolean;
    readonly history?: HistoryContext | undefined;
    readonly matchPartsCache?: MatchPartsCache | undefined;
    readonly conflicts?: boolean | undefined;
};
export declare function matchParts(request: string, parts: ConstructionPart[], config: MatchConfig, matchValueTranslator: MatchedValueTranslator): MatchedValues | undefined;
export declare function createMatchPartsCache(cachedString: string): {
    cachedString: string;
    cache: Map<RegExp, (string | null)[]>;
    cacheWithEnd: Map<number, Map<RegExp, (string | null)[]>>;
    totalTime: number;
    hit: number;
    miss: number;
};
export type MatchPartsCache = ReturnType<typeof createMatchPartsCache>;
export declare function getMatchPartsCacheStats(matchPartsCache: MatchPartsCache): string;
//# sourceMappingURL=constructionMatch.d.ts.map