import { ConstructionPart, WildcardMode } from "./constructions.js";
export type MatchSetJSON = {
    matches: string[];
    basename: string;
    namespace?: string | undefined;
    canBeMerged: boolean;
    index: number;
};
export type TransformInfo = {
    namespace: string;
    transformName: string;
    actionIndex?: number | undefined;
};
export declare function toTransformInfoKey(transformInfo: TransformInfo): string;
/**
 * MatchSet
 *
 * Merge policy:
 * - If canBeMerged is false, it will never be substituted with other matchset unless it is an exact match.
 * - If canBeMerged is true, it will be merged with other match set with the same name AND transformInfo if any
 *
 * See mergedUid and unmergedUid for the look up key for them
 *
 * Additionally, merge can be enabled/disabled via a flag when construction is added to the cache.
 */
export declare class MatchSet {
    readonly name: string;
    readonly canBeMerged: boolean;
    readonly namespace: string | undefined;
    private readonly index;
    readonly matches: Set<string>;
    private _regExp;
    constructor(matches: Iterable<string>, name: string, // note: characters "_", ",", "|", ":" are reserved for internal use
    canBeMerged: boolean, namespace: string | undefined, index?: number);
    get fullName(): string;
    get mergedUid(): string;
    get unmergedUid(): string;
    private get matchSetString();
    get regexPart(): string;
    get regExp(): RegExp;
    forceRegexp(): void;
    clearRegexp(): void;
    clone(canBeMerged: boolean, index: number): MatchSet;
    toJSON(): MatchSetJSON;
}
export type MatchPartJSON = {
    matchSet: string;
    optional: true | undefined;
    wildcardMode: WildcardMode | undefined;
    transformInfos?: TransformInfo[] | undefined;
};
export declare class MatchPart {
    readonly matchSet: MatchSet;
    readonly optional: boolean;
    readonly wildcardMode: WildcardMode;
    readonly transformInfos: Readonly<TransformInfo>[] | undefined;
    constructor(matchSet: MatchSet, optional: boolean, wildcardMode: WildcardMode, transformInfos: Readonly<TransformInfo>[] | undefined);
    get capture(): boolean;
    get regExp(): RegExp;
    toString(verbose?: boolean): string;
    toJSON(): MatchPartJSON;
    equals(e: ConstructionPart): boolean;
}
export declare function createMatchPart(matches: string[], name: string, options?: {
    transformInfos?: TransformInfo[];
    optional?: boolean;
    canBeMerged?: boolean;
    wildcardMode?: WildcardMode;
}): ConstructionPart;
export declare function isMatchPart(part: ConstructionPart): part is MatchPart;
type TransformInfoV2 = {
    translatorName: string;
    transformNames: ReadonlyArray<string>;
};
export type MatchSetJSONV2 = {
    matches: string[];
    basename: string;
    transformInfo?: TransformInfoV2 | undefined;
    canBeMerged: boolean;
    index: number;
};
export declare function convertMatchSetV2ToV3(matchSetsV2: MatchSetJSONV2[]): {
    matchSets: MatchSetJSON[];
    matchSetToTransformInfo: Map<string, TransformInfo[]>;
};
export {};
//# sourceMappingURL=matchPart.d.ts.map