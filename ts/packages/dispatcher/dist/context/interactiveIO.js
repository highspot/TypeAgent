// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { getCommandResult, } from "./commandHandlerContext.js";
export var NotifyCommands;
(function (NotifyCommands) {
    NotifyCommands["ShowSummary"] = "summarize";
    NotifyCommands["Clear"] = "clear";
    NotifyCommands["ShowUnread"] = "unread";
    NotifyCommands["ShowAll"] = "all";
})(NotifyCommands || (NotifyCommands = {}));
export function makeClientIOMessage(context, message, requestId, source, actionIndex) {
    if (typeof message === "object" &&
        !Array.isArray(message) &&
        message.kind === "error") {
        const commandResult = getCommandResult(context);
        if (commandResult !== undefined) {
            commandResult.hasError = true;
        }
    }
    return {
        message,
        requestId,
        source,
        actionIndex,
        metrics: requestId !== undefined
            ? context.metricsManager?.getMetrics(requestId)
            : undefined,
    };
}
export async function askYesNoWithContext(context, message, defaultValue = false) {
    return context?.batchMode
        ? defaultValue
        : context.clientIO.askYesNo(message, context.requestId, defaultValue);
}
export const nullClientIO = {
    clear: () => { },
    exit: () => process.exit(0),
    setDisplayInfo: () => { },
    setDisplay: () => { },
    appendDisplay: () => { },
    appendDiagnosticData: () => { },
    setDynamicDisplay: () => { },
    askYesNo: async (message, requestId, defaultValue = false) => defaultValue,
    proposeAction: async () => undefined,
    notify: () => { },
    takeAction: (action) => {
        throw new Error(`Action ${action} not supported`);
    },
};
//# sourceMappingURL=interactiveIO.js.map