import { ConstructionCache } from "./constructionCache.js";
import { ConstructionPart } from "./constructions.js";
export declare function getMatchPartNames(parts: ConstructionPart[], verbose: boolean): Map<ConstructionPart, string>;
export type PrintOptions = {
    builtin: boolean;
    all: boolean;
    verbose: boolean;
    match?: string[] | undefined;
    part?: string[] | undefined;
    id?: number[] | undefined;
};
export declare function printConstructionCache(cache: ConstructionCache, options: PrintOptions): void;
//# sourceMappingURL=constructionPrint.d.ts.map