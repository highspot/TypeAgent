export type CodeDebugActions = ShowDebugAction | ToggleBreakpointAction | StartOrContinueDebugAction | StepAction | StopDebugAction | ShowHoverAction;
export type ShowDebugAction = {
    actionName: "showDebugPanel";
};
export type ToggleBreakpointAction = {
    actionName: "toggleBreakpoint";
};
export type StartOrContinueDebugAction = {
    actionName: "startDebugging";
};
export type StepAction = {
    actionName: "step";
    parameters: {
        stepType: "into" | "out" | "over";
    };
};
export type StopDebugAction = {
    actionName: "stopDebugging";
};
export type ShowHoverAction = {
    actionName: "showHover";
};
//# sourceMappingURL=debugActionsSchema.d.ts.map