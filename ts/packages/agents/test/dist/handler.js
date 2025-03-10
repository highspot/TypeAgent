// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { createActionResult } from "@typeagent/agent-sdk/helpers/action";
import { getCommandInterface, } from "@typeagent/agent-sdk/helpers/command";
class RequestCommandHandler {
    constructor() {
        this.description = "Request a test";
        this.parameters = {
            args: {
                test: {
                    description: "Test to request",
                    implicitQuotes: true,
                },
            },
        };
    }
    async run(context, params) {
        context.actionIO.setDisplay(params.args.test);
    }
}
const handlers = {
    description: "Test App Agent Commands",
    commands: {
        request: new RequestCommandHandler(),
    },
};
export function instantiate() {
    return {
        executeAction,
        ...getCommandInterface(handlers),
    };
}
async function executeAction(action, context) {
    switch (action.actionName) {
        case "add":
            const { a, b } = action.parameters;
            return createActionResult(`The sum of ${a} and ${b} is ${a + b}`);
        case "random":
            return createActionResult(`Random number: ${Math.random()}`);
        default:
            throw new Error(`Unknown action: ${action.actionName}`);
    }
}
//# sourceMappingURL=handler.js.map