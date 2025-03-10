import { DateTimeRange } from "./dateTimeSchema.js";
export type FacetTerm = {
    name: string;
    value: string;
};
export type EntityTerm = {
    name: string;
    type: string[];
    facets?: FacetTerm[];
};
export type VerbsTerm = {
    words: string[];
};
export type SourceTerm = {
    text: string;
    isPronoun: boolean;
};
export type ActionTerm = {
    verbs?: VerbsTerm | undefined;
    from: SourceTerm | "none";
    to?: SourceTerm | undefined;
};
export type SearchFilter = {
    action?: ActionTerm;
    entities?: EntityTerm[];
    searchTerms?: string[];
    timeRange?: DateTimeRange | undefined;
};
//# sourceMappingURL=searchSchema.d.ts.map