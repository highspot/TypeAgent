// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { createActionResult } from "@typeagent/agent-sdk/helpers/action";
import { disableDesktopActionContext, runDesktopActions, setupDesktopActionContext, } from "./connector.js";
export function instantiate() {
    return {
        initializeAgentContext: initializeDesktopContext,
        updateAgentContext: updateDesktopContext,
        executeAction: executeDesktopAction,
    };
}
function initializeDesktopContext() {
    return {
        desktopProcess: undefined,
        programNameIndex: undefined,
        refreshPromise: undefined,
        abortRefresh: undefined,
    };
}
async function updateDesktopContext(enable, context) {
    const agentContext = context.agentContext;
    if (enable) {
        await setupDesktopActionContext(agentContext, context.instanceStorage);
    }
    else {
        await disableDesktopActionContext(agentContext);
    }
}
async function executeDesktopAction(action, context) {
    const message = await runDesktopActions(action, context.sessionContext.agentContext, context.sessionContext.sessionStorage);
    return createActionResult(message);
}
//# sourceMappingURL=actionHandler.js.map