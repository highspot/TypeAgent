import { DateTimeRange } from "./dateTimeSchema.js";
export type TopicFilter = {
    filterType: "Topic";
    topics?: string;
    timeRange?: DateTimeRange | undefined;
};
export type EntityFilter = {
    filterType: "Entity";
    name?: string;
    type?: string[];
    timeRange?: DateTimeRange | undefined;
};
export type VerbFilter = {
    verbs: string[];
    verbTense?: "past" | "present" | "future" | undefined;
};
export type ActionFilter = {
    filterType: "Action";
    verbFilter?: VerbFilter | undefined;
    subjectEntityName: string | "none";
    objectEntityName?: string | undefined;
    indirectObjectEntityName?: string | undefined;
};
export type Filter = TopicFilter | EntityFilter | ActionFilter;
export type ResponseType = "Entities" | "Entity_Facets" | "Topics" | "Answer";
export type ResponseStyle = "Paragraph" | "List";
export type GetAnswerAction = {
    actionName: "getAnswer";
    parameters: {
        filters: Filter[];
        responseType: ResponseType;
        responseStyle: ResponseStyle;
    };
};
export type UnknownAction = {
    actionName: "unknown";
};
export type SearchAction = GetAnswerAction | UnknownAction;
//# sourceMappingURL=knowledgeSearchSchema.d.ts.map