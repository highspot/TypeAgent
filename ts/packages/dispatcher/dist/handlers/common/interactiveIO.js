// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
export const DispatcherName = "dispatcher";
export var NotifyCommands;
(function (NotifyCommands) {
    NotifyCommands["ShowSummary"] = "summarize";
    NotifyCommands["Clear"] = "clear";
    NotifyCommands["ShowUnread"] = "unread";
    NotifyCommands["ShowAll"] = "all";
})(NotifyCommands || (NotifyCommands = {}));
export function makeClientIOMessage(
    context,
    message,
    requestId,
    source,
    actionIndex,
) {
    return {
        message,
        requestId,
        source,
        actionIndex,
        metrics:
            requestId !== undefined
                ? context?.metricsManager?.getMetrics(requestId)
                : undefined,
    };
}
export async function askYesNoWithContext(
    context,
    message,
    defaultValue = false,
) {
    return context?.batchMode
        ? defaultValue
        : context.clientIO.askYesNo(message, context.requestId, defaultValue);
}
export const nullClientIO = {
    clear: () => {},
    exit: () => process.exit(0),
    setDisplay: () => {},
    appendDisplay: () => {},
    setDynamicDisplay: () => {},
    askYesNo: async (message, requestId, defaultValue = false) => defaultValue,
    proposeAction: async () => undefined,
    notify: () => {},
    takeAction: (action) => {
        throw new Error(`Action ${action} not supported`);
    },
};
//# sourceMappingURL=interactiveIO.js.map
