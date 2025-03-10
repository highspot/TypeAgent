export type ConfigAction = ListAgents | ToggleAgent | ToggleExplanationAction | ToggleDeveloperModeAction;
export type ListAgents = {
    actionName: "listAgents";
};
export type ToggleAgent = {
    actionName: "toggleAgent";
    parameters: {
        enable: boolean;
        agentNames: string[];
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