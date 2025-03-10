export type CodeActions = ChangeColorThemeAction | SplitEditorAction | ChangeEditorLayoutAction | NewFileAction | AddCodeSnippetAction;
export type ColorTheme = "Default Light+" | "Default Dark+" | "Monokai" | "Monokai Dimmed" | "Solarized Dark" | "Solarized Light" | "Quiet Light" | "Red" | "Kimbie Dark" | "Abyss" | "Default High Contrast Light";
export type ChangeColorThemeAction = {
    actionName: "changeColorScheme";
    parameters: {
        theme: ColorTheme;
    };
};
export type SplitDirection = "right" | "left" | "up" | "down";
export type SplitEditorAction = {
    actionName: "splitEditor";
    parameters: {
        direction?: SplitDirection;
    };
};
export type LayoutColumns = "single" | "double" | "three";
export type ChangeEditorLayoutAction = {
    actionName: "changeEditorLayout";
    parameters: {
        columnCount?: LayoutColumns;
    };
};
export type CodeLanguage = "plaintext" | "html" | "python" | "javaScript" | "typeScript" | "markdown";
export type NewFileAction = {
    actionName: "newFile";
    parameters: {
        fileName: string;
        language: CodeLanguage;
        content: string;
    };
};
export type AddCodeSnippetAction = {
    actionName: "addCodeSnippet";
    parameters: {
        snippet: string;
        language: string;
    };
};
//# sourceMappingURL=codeActionsSchema.d.ts.map