import { RequestAction, ParamValueType } from "../explanation/requestAction.js";
import { MatchConfig } from "./constructionMatch.js";
import { ParsePartJSON } from "./parsePart.js";
import { MatchPartJSON, MatchSet, TransformInfo } from "./matchPart.js";
import { Transforms } from "./transforms.js";
import { MatchedValueTranslator } from "./constructionValue.js";
type ImplicitParameter = {
    paramName: string;
    paramValue: ParamValueType;
};
export declare const enum WildcardMode {
    Disabled = 0,
    Enabled = 1,
    Checked = 2
}
export type ConstructionPart = {
    readonly wildcardMode: WildcardMode;
    readonly capture: boolean;
    readonly regExp: RegExp;
    readonly optional: boolean;
    equals(other: ConstructionPart): boolean;
    toString(verbose?: boolean): string;
};
export declare class Construction {
    readonly parts: ConstructionPart[];
    readonly transformNamespaces: Map<string, Transforms>;
    readonly implicitParameters: ImplicitParameter[] | undefined;
    readonly implicitActionName: string | undefined;
    readonly id: number;
    static create(parts: ConstructionPart[], transformNamespaces: Map<string, Transforms>, implicitParameters?: ImplicitParameter[], implicitActionName?: string): Construction;
    constructor(parts: ConstructionPart[], transformNamespaces: Map<string, Transforms>, implicitParameters: ImplicitParameter[] | undefined, implicitActionName: string | undefined, id: number);
    get implicitParameterCount(): number;
    match(request: string, config: MatchConfig): MatchResult[];
    getMatchedValues(matched: string[], config: MatchConfig, matchValueTranslator: MatchedValueTranslator): import("./constructionValue.js").MatchedValues | undefined;
    private collectImplicitProperties;
    toString(verbose?: boolean): string;
    isSupersetOf(others: ConstructionPart[], implicitParameters: ImplicitParameter[] | undefined): boolean;
    static fromJSON(construction: ConstructionJSON, allMatchSets: Map<string, MatchSet>, transformNamespaces: Map<string, Transforms>, index: number): Construction;
    toJSON(): {
        parts: ConstructionPart[];
        implicitParameters: ImplicitParameter[] | undefined;
        implicitActionName: string | undefined;
    };
}
type ConstructionPartJSON = MatchPartJSON | ParsePartJSON;
export type ConstructionJSON = {
    parts: ConstructionPartJSON[];
    implicitParameters?: ImplicitParameter[];
    implicitActionName?: string;
};
export type MatchResult = {
    construction: Construction;
    match: RequestAction;
    matchedCount: number;
    wildcardCharCount: number;
    nonOptionalCount: number;
    conflictValues?: [string, ParamValueType[]][] | undefined;
};
export declare function convertConstructionV2ToV3(constructions: ConstructionJSON[], matchSetToTransformInfo: Map<string, TransformInfo[]>): void;
export {};
//# sourceMappingURL=constructions.d.ts.map