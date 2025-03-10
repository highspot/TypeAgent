export type HistoryAction = ListHistoryAction | ClearHistoryAction | DeleteHistoryAction;
export type ListHistoryAction = {
    actionName: "listHistory";
};
export type ClearHistoryAction = {
    actionName: "clearHistory";
};
export type DeleteHistoryAction = {
    actionName: "deleteHistory";
    parameters: {
        messageNumber: number;
    };
};
//# sourceMappingURL=historyActionSchema.d.ts.map