export type CodeDisplayActions = ZoomInAction | ZoomOutAction | ZoomResetAction | ShowExplorerPane | ShowTextSearchAction | ShowSourceControlAction | ShowExtensionsAction | ShowOutputPanelAction | ToggleSearchDetailsAction | ReplaceInFilesAction | OpenMarkdownPreviewAction | OpenMarkdownPreviewToSideAction | ZenModeAction | CloseEditorAction | OpenSettingsAction;
export type ZoomInAction = {
    actionName: "zoomIn";
};
export type ZoomOutAction = {
    actionName: "zoomOut";
};
export type ZoomResetAction = {
    actionName: "fontZoomReset";
};
export type ShowExplorerPane = {
    actionName: "showExplorer";
};
export type ShowTextSearchAction = {
    actionName: "showSearch";
};
export type ShowSourceControlAction = {
    actionName: "showSourceControl";
};
export type ShowExtensionsAction = {
    actionName: "showExtensions";
};
export type ShowOutputPanelAction = {
    actionName: "showOutputPanel";
};
export type ToggleSearchDetailsAction = {
    actionName: "toggleSearchDetails";
};
export type ReplaceInFilesAction = {
    actionName: "replaceInFiles";
};
export type OpenMarkdownPreviewAction = {
    actionName: "openMarkdownPreview";
};
export type OpenMarkdownPreviewToSideAction = {
    actionName: "openMarkdownPreviewToSide";
};
export type ZenModeAction = {
    actionName: "zenMode";
};
export type CloseEditorAction = {
    actionName: "closeEditor";
};
export type OpenSettingsAction = {
    actionName: "openSettings";
};
//# sourceMappingURL=displayActionsSchema.d.ts.map