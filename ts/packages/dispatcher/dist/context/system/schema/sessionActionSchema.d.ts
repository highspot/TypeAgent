export type SessionAction = NewSessionAction | ListSessionAction | ShowSessionInfoAction;
export type NewSessionAction = {
    actionName: "newSession";
    parameters: {
        name?: string;
    };
};
export type ListSessionAction = {
    actionName: "listSession";
};
export type ShowSessionInfoAction = {
    actionName: "showSessionInfo";
};
//# sourceMappingURL=sessionActionSchema.d.ts.map