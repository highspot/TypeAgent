// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { processCommandNoLock } from "../../../command/command.js";
export async function executeConfigAction(action, context) {
    const configAction = action;
    switch (configAction.actionName) {
        case "listAgents":
            await processCommandNoLock(`@config agent`, context.sessionContext.agentContext);
            break;
        case "toggleAgent":
            const cmdParam = configAction.parameters.enable
                ? ``
                : `--off`;
            await processCommandNoLock(`@config agent ${cmdParam} ${configAction.parameters.agentNames.join(" ")}`, context.sessionContext.agentContext);
            break;
        case "toggleExplanation":
            await processCommandNoLock(`@config explainer ${configAction.parameters.enable ? "on" : "off"}`, context.sessionContext.agentContext);
            break;
        case "toggleDeveloperMode":
            await processCommandNoLock(`@config dev ${configAction.parameters.enable ? "on" : "off"}`, context.sessionContext.agentContext);
            break;
        default:
            throw new Error(`Invalid action name: ${action.actionName}`);
    }
    return undefined;
}
//# sourceMappingURL=configActionHandler.js.map