export type Entity = {
    name: string;
    type: string[];
};
export type ChatResponseAction = LookupAndGenerateResponseAction | GenerateResponseAction;
export type DateVal = {
    day: number;
    month: number;
    year: number;
};
export type TimeVal = {
    hour: number;
    minute: number;
    seconds: number;
};
export type DateTime = {
    date: DateVal;
    time?: TimeVal | undefined;
};
export type DateTimeRange = {
    startDate: DateTime;
    stopDate?: DateTime | undefined;
};
export type TermFilter = {
    verbs?: string[];
    terms: string[];
    timeRange?: DateTimeRange | undefined;
};
export interface LookupAndGenerateResponseAction {
    actionName: "lookupAndGenerateResponse";
    parameters: {
        originalRequest: string;
        conversationLookupFilters?: TermFilter[];
        internetLookups?: string[];
        relatedFiles?: string[];
        retrieveRelatedFilesFromStorage?: boolean;
    };
}
export interface GenerateResponseAction {
    actionName: "generateResponse";
    parameters: {
        originalRequest: string;
        generatedText: string;
        userRequestEntities: Entity[];
        generatedTextEntities: Entity[];
        relatedFiles?: string[];
    };
}
//# sourceMappingURL=chatResponseActionSchema.d.ts.map