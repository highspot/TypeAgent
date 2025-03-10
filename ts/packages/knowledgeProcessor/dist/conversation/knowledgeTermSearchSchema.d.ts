import { DateTimeRange } from "./dateTimeSchema.js";
export type TermFilter = {
    verbs?: string[];
    terms: string[];
    timeRange?: DateTimeRange | undefined;
};
export type GetAnswerWithTermsAction = {
    actionName: "getAnswer";
    parameters: {
        filters: TermFilter[];
    };
};
export type UnknownSearchAction = {
    actionName: "unknown";
};
export type SearchTermsAction = GetAnswerWithTermsAction | UnknownSearchAction;
//# sourceMappingURL=knowledgeTermSearchSchema.d.ts.map