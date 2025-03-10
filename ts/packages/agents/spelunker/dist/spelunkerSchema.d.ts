export type SpelunkerAction = SetFocusAction | GetFocusAction | SearchCodeAction;
export type SetFocusAction = {
    actionName: "setFocus";
    parameters: {
        folders: string[];
    };
};
export type GetFocusAction = {
    actionName: "getFocus";
};
export type SearchCodeAction = {
    actionName: "searchCode";
    parameters: {
        question: string;
    };
};
//# sourceMappingURL=spelunkerSchema.d.ts.map