import { ParamSpec } from "action-schema";
import { ConstructionPart, WildcardMode } from "./constructions.js";
import { PropertyParser } from "./propertyParser.js";
export declare class ParsePart implements ConstructionPart {
    readonly propertyName: string;
    private readonly parser;
    constructor(propertyName: string, parser: PropertyParser);
    get wildcardMode(): WildcardMode;
    get capture(): boolean;
    get regExp(): RegExp;
    get optional(): boolean;
    convertToValue(match: string): any;
    equals(e: ConstructionPart): boolean;
    toJSON(): ParsePartJSON;
    toString(verbose?: boolean): string;
}
export type ParsePartJSON = {
    propertyName: string;
    parserName: ParamSpec;
};
export declare function createParsePart(propertyName: string, parser: PropertyParser): ConstructionPart;
export declare function createParsePartFromJSON(json: ParsePartJSON): ConstructionPart;
export declare function isParsePart(part: ConstructionPart): part is ParsePart;
//# sourceMappingURL=parsePart.d.ts.map