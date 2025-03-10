// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { processCommandNoLock } from "../../../command/command.js";
export async function executeSessionAction(action, context) {
    switch (action.actionName) {
        case "newSession":
            await processCommandNoLock(`@session new ${action.parameters.name ?? ""}`, context.sessionContext.agentContext);
            break;
        case "listSession":
            await processCommandNoLock("@session list", context.sessionContext.agentContext);
            break;
        case "showSessionInfo":
            await processCommandNoLock("@session info", context.sessionContext.agentContext);
            break;
        default:
            throw new Error(`Invalid action name: ${action.actionName}`);
    }
    return undefined;
}
//# sourceMappingURL=sessionActionHandler.js.map