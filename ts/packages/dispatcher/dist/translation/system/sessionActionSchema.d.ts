export type SessionAction =
    | NewAction
    | ListAction
    | ShowInfoAction
    | ToggleHistoryAction;
export type NewAction = {
    actionName: "new";
    parameters: {
        name?: string;
    };
};
export type ListAction = {
    actionName: "list";
};
export type ShowInfoAction = {
    actionName: "showInfo";
};
export type ToggleHistoryAction = {
    actionName: "toggleHistory";
    parameters: {
        enable: boolean;
    };
};
//# sourceMappingURL=sessionActionSchema.d.ts.map
