import { FlagDefinition, FlagDefinitions } from "../parameters.js";
export declare function getFlagMultiple(def: FlagDefinition): boolean;
export declare function getFlagType(def: FlagDefinition): "string" | "number" | "boolean" | "json";
export declare function resolveFlag(definitions: FlagDefinitions, flag: string): [string, FlagDefinition] | undefined;
//# sourceMappingURL=parameterHelpers.d.ts.map