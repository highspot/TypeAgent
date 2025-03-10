export type HighspotConversationAction = QueryPeopleAction | QueryContentAction | LoadCSVAction;
export interface QueryAction {
    actionName: "query";
    parameters?: {
        query: string;
    };
}
export interface LoadCSVAction {
    actionName: "loadCSV";
    parameters: {
        filename: string;
    };
}
export interface QueryPeopleAction {
    actionName: "queryPeople";
    parameters?: {
        query: string;
    };
}
export interface QueryContentAction {
    actionName: "queryContent";
    parameters?: {
        query: string;
    };
}
//# sourceMappingURL=highspotConversationSchema.d.ts.map