// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { processCommandNoLock } from "../../../command/command.js";
export async function executeHistoryAction(action, context) {
    const historyAction = action;
    switch (historyAction.actionName) {
        case "deleteHistory":
            const deleteAction = historyAction;
            await processCommandNoLock(`@history delete ${deleteAction.parameters.messageNumber}`, context.sessionContext.agentContext);
            break;
        case "clearHistory":
            await processCommandNoLock(`@history clear`, context.sessionContext.agentContext);
            break;
        case "listHistory":
            await processCommandNoLock(`@history list`, context.sessionContext.agentContext);
            break;
        default:
            throw new Error(`Invalid action name: ${action.actionName}`);
    }
    return undefined;
}
//# sourceMappingURL=historyActionHandler.js.map