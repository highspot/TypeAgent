import { HistoryContext, JSONAction, ParamValueType } from "../explanation/requestAction.js";
import { ConstructionPart } from "./constructions.js";
import { TransformInfo } from "./matchPart.js";
import { ParsePart } from "./parsePart.js";
import { MatchConfig } from "./constructionMatch.js";
export type MatchedValueTranslator = {
    transform(transformInfo: TransformInfo, matchedText: string[], history?: HistoryContext): ParamValueType | undefined;
    transformConflicts?(transformInfo: TransformInfo, matchedText: string[]): ParamValueType[] | undefined;
    parse(parsePart: ParsePart, match: string): ParamValueType;
};
export type MatchedValues = {
    values: [string, ParamValueType][];
    conflictValues: [string, ParamValueType[]][] | undefined;
    matchedCount: number;
    wildcardCharCount: number;
};
export declare function matchedValues(parts: ConstructionPart[], matched: string[], config: MatchConfig, matchValueTranslator: MatchedValueTranslator): MatchedValues | undefined;
export declare function createActionProps(values: [string, ParamValueType][], initial?: JSONAction | JSONAction[]): any;
//# sourceMappingURL=constructionValue.d.ts.map