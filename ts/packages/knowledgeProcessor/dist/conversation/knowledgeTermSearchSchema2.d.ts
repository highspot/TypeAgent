import { DateTimeRange } from "./dateTimeSchema.js";
export type SearchTerm = string;
export type VerbsTerm = {
    words: string[];
    verbTense: "past" | "present" | "future";
};
export type SubjectTerm = {
    subject: string;
    isPronoun: boolean;
};
export type ActionTerm = {
    verbs?: VerbsTerm | undefined;
    subject: SubjectTerm | "none";
    object?: string | undefined;
};
export type TermFilterV2 = {
    action?: ActionTerm;
    searchTerms?: SearchTerm[];
    timeRange?: DateTimeRange | undefined;
};
export type GetAnswerWithTermsActionV2 = {
    actionName: "getAnswer";
    parameters: {
        question: string;
        filters: TermFilterV2[];
        summarize?: boolean | undefined;
    };
};
export type UnknownSearchActionV2 = {
    actionName: "unknown";
};
export type SearchTermsActionV2 = GetAnswerWithTermsActionV2 | UnknownSearchActionV2;
//# sourceMappingURL=knowledgeTermSearchSchema2.d.ts.map