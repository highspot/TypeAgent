// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { getCommandInterface } from "@typeagent/agent-sdk/helpers/command";
import { RequestCommandHandler } from "../handlers/requestCommandHandler.js";
import { TranslateCommandHandler } from "../handlers/translateCommandHandler.js";
import { ExplainCommandHandler } from "../handlers/explainCommandHandler.js";
import { CorrectCommandHandler } from "../handlers/correctCommandHandler.js";
import { createActionResultNoDisplay } from "@typeagent/agent-sdk/helpers/action";
export function isUnknownAction(action) {
    return action.actionName === "unknown";
}
const dispatcherHandlers = {
    description: "Type Agent Dispatcher Commands",
    commands: {
        request: new RequestCommandHandler(),
        translate: new TranslateCommandHandler(),
        explain: new ExplainCommandHandler(),
        correct: new CorrectCommandHandler(),
    },
};
async function executeDispatcherAction(action, context) {
    if (action.actionName === "clarifyRequest") {
        return clarifyRequestAction(action, context);
    }
    throw new Error(`Unknown dispatcher action: ${action.actionName}`);
}
function clarifyRequestAction(action, context) {
    const { request, clarifyingQuestion } = action.parameters;
    context.actionIO.appendDisplay({
        type: "text",
        speak: true,
        content: clarifyingQuestion,
    });
    const result = createActionResultNoDisplay(clarifyingQuestion);
    result.additionalInstructions = [
        `Asked the user to clarify the request '${request}'`,
    ];
    return result;
}
export const dispatcherAgent = {
    executeAction: executeDispatcherAction,
    ...getCommandInterface(dispatcherHandlers),
};
//# sourceMappingURL=dispatcherAgent.js.map
