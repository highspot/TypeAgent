// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { processCommandNoLock } from "../../command/command.js";
export async function executeSessionAction(action, context) {
    const sessionAction = action;
    switch (sessionAction.actionName) {
        case "new":
            await processCommandNoLock(
                `@session new ${sessionAction.parameters.name ?? ""}`,
                context.sessionContext.agentContext,
            );
            break;
        case "list":
            await processCommandNoLock(
                "@session list",
                context.sessionContext.agentContext,
            );
            break;
        case "showInfo":
            await processCommandNoLock(
                "@session info",
                context.sessionContext.agentContext,
            );
            break;
        case "toggleHistory":
            await processCommandNoLock(
                `@session history ${sessionAction.parameters.enable ? "on" : "off"}`,
                context.sessionContext.agentContext,
            );
            break;
        default:
            throw new Error(`Invalid action name: ${action.actionName}`);
    }
    return undefined;
}
//# sourceMappingURL=sessionActionHandler.js.map
