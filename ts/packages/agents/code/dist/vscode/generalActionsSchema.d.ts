export type CodeGeneralActions = ShowCommandPaletteAction | GotoFileOrLineOrSymbolAction | NewWindowAction | ShowUserSettingsAction | ShowKeyboardShortcutsAction;
export type ShowCommandPaletteAction = {
    actionName: "showCommandPalette";
};
export type GotoFileOrLineOrSymbolAction = {
    actionName: "gotoFileOrLineOrSymbol";
    parameters: {
        goto?: "file" | "line" | "symbol";
        ref?: string;
    };
};
export type NewWindowAction = {
    actionName: "newWindow";
};
export type ShowUserSettingsAction = {
    actionName: "showUserSettings";
};
export type ShowKeyboardShortcutsAction = {
    actionName: "showKeyboardShortcuts";
};
//# sourceMappingURL=generalActionsSchema.d.ts.map