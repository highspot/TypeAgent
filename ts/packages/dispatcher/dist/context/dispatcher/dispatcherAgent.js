// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { getCommandInterface, } from "@typeagent/agent-sdk/helpers/command";
import { RequestCommandHandler } from "./handlers/requestCommandHandler.js";
import { TranslateCommandHandler } from "./handlers/translateCommandHandler.js";
import { ExplainCommandHandler } from "./handlers/explainCommandHandler.js";
import { createActionResultNoDisplay } from "@typeagent/agent-sdk/helpers/action";
const dispatcherHandlers = {
    description: "Type Agent Dispatcher Commands",
    commands: {
        request: new RequestCommandHandler(),
        translate: new TranslateCommandHandler(),
        explain: new ExplainCommandHandler(),
    },
};
async function executeDispatcherAction(action, context) {
    if (action.actionName === "clarifyMultiplePossibleActionName" ||
        action.actionName === "clarifyMissingParameter" ||
        action.actionName === "clarifyUnresolvedReference") {
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
export const dispatcherManifest = {
    emojiChar: "🤖",
    description: "Built-in agent to dispatch requests",
    schema: {
        description: "",
        schemaType: "DispatcherActions",
        schemaFile: "./src/context/dispatcher/schema/dispatcherActionSchema.ts",
        injected: true,
        cached: false,
    },
    subActionManifests: {
        clarify: {
            schema: {
                description: "Action that helps you clarify your request.",
                schemaFile: "./src/context/dispatcher/schema/clarifyActionSchema.ts",
                schemaType: "ClarifyRequestAction",
                injected: true,
                cached: false,
            },
        },
    },
};
export const dispatcherAgent = {
    executeAction: executeDispatcherAction,
    ...getCommandInterface(dispatcherHandlers),
};
//# sourceMappingURL=dispatcherAgent.js.map