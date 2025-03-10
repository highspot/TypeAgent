// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { processCommandNoLock } from "../../../command/command.js";
export async function executeNotificationAction(action, context) {
    const notificationAction = action;
    switch (notificationAction.actionName) {
        case "showNotifications":
            const showAction = notificationAction;
            await processCommandNoLock(`@notify show ${showAction.parameters.filter}`, context.sessionContext.agentContext);
            break;
        case "showNotificationSummary":
            await processCommandNoLock(`@notify info`, context.sessionContext.agentContext);
            break;
        case "clearNotifications":
            await processCommandNoLock(`@notify clear`, context.sessionContext.agentContext);
            break;
        default:
            throw new Error(`Invalid action name: ${action.actionName}`);
    }
    return undefined;
}
//# sourceMappingURL=notificationActionHandler.js.map