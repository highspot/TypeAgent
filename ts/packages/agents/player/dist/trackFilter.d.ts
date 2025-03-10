/// <reference types="spotify-api" />
import { TypeChatLanguageModel } from "typechat";
import { IClientContext } from "./client.js";
export declare enum FilterTokenType {
    Genre = 0,
    Artist = 1,
    Year = 2,
    Description = 3,
    Colon = 4,
    AND = 5,
    OR = 6,
    LParen = 7,
    RParen = 8,
    Value = 9
}
export declare enum FilterConstraintType {
    Genre = "genre",
    Artist = "artist",
    Year = "year",
    Description = "description"
}
export declare enum FilterCombinerType {
    AND = "AND",
    OR = "OR"
}
export interface FilterCombiner {
    type: "combiner";
    combinerType: FilterCombinerType;
    operands: FilterNode[];
}
export interface FilterConstraint {
    type: "constraint";
    constraintType: FilterConstraintType;
    constraintValue: string;
}
export type FilterNode = FilterConstraint | FilterCombiner;
export interface IFilterResult {
    diagnostics?: string[];
    ast?: FilterNode;
}
export declare function filterNodeToString(node: FilterNode, depth?: number): string;
export declare function parseFilter(filter: string): IFilterResult;
export declare function applyFilterExpr(clientContext: IClientContext, model: TypeChatLanguageModel, filterExpr: FilterNode, tracks: SpotifyApi.TrackObjectFull[], negate?: boolean): Promise<SpotifyApi.TrackObjectFull[]>;
export declare function tests(): void;
//# sourceMappingURL=trackFilter.d.ts.map