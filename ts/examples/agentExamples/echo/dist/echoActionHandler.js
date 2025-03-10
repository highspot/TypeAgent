// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { createActionResultFromTextDisplay, createActionResultFromError, } from "@typeagent/agent-sdk/helpers/action";
export function instantiate() {
    return {
        initializeAgentContext: initializeEchoContext,
        executeAction: executeEchoAction,
    };
}
async function initializeEchoContext() {
    return { echoCount: 0 };
}
async function executeEchoAction(action, context) {
    // The context created in initializeEchoContext is returned in the action context.
    const echoContext = context.sessionContext.agentContext;
    switch (action.actionName) {
        case "echoGen":
            const displayText = `>> Echo ${++echoContext.echoCount}: ${action.parameters.text}`;
            return createActionResultFromTextDisplay(displayText, displayText);
        default:
            return createActionResultFromError("Unable to process the action");
    }
}
//# sourceMappingURL=echoActionHandler.js.map