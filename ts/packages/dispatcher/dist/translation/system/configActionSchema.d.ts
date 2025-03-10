export type ConfigAction =
    | ToggleBotAction
    | ToggleExplanationAction
    | ToggleDeveloperModeAction;
export type ToggleBotAction = {
    actionName: "toggleBot";
    parameters: {
        enable: boolean;
    };
};
export type ToggleExplanationAction = {
    actionName: "toggleExplanation";
    parameters: {
        enable: boolean;
    };
};
export type ToggleDeveloperModeAction = {
    actionName: "toggleDeveloperMode";
    parameters: {
        enable: boolean;
    };
};
//# sourceMappingURL=configActionSchema.d.ts.map
