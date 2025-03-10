// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { processCommandNoLock } from "../../command/command.js";
export async function executeConfigAction(action, context) {
    const configAction = action;
    switch (configAction.actionName) {
        case "toggleBot":
            await processCommandNoLock(
                `@config bot ${configAction.parameters.enable ? "on" : "off"}`,
                context.sessionContext.agentContext,
            );
            break;
        case "toggleExplanation":
            await processCommandNoLock(
                `@config explanation ${configAction.parameters.enable ? "on" : "off"}`,
                context.sessionContext.agentContext,
            );
            break;
        case "toggleDeveloperMode":
            await processCommandNoLock(
                `@config dev ${configAction.parameters.enable ? "on" : "off"}`,
                context.sessionContext.agentContext,
            );
            break;
        default:
            throw new Error(`Invalid action name: ${action.actionName}`);
    }
    return undefined;
}
//# sourceMappingURL=configActionHandler.js.map
