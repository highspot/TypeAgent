import { ParamSpec } from "action-schema";
export type PropertyParser = {
    readonly name: ParamSpec;
    readonly valueType: string;
    readonly regExp: RegExp;
    readonly convertToValue: (str: string) => any;
};
export declare function getPropertyParser(name: ParamSpec): PropertyParser | undefined;
//# sourceMappingURL=propertyParser.d.ts.map