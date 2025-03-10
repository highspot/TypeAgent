// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { displaySuccess } from "@typeagent/agent-sdk/helpers/display";
export function getToggleCommandHandlers(name, toggle) {
    return {
        on: {
            description: `Turn on ${name}`,
            run: async (context) => {
                await toggle(context, true);
                displaySuccess(`${name} is enabled.`, context);
            },
        },
        off: {
            description: `Turn off ${name}`,
            run: async (context) => {
                await toggle(context, false);
                displaySuccess(`${name} is disabled.`, context);
            },
        },
    };
}
export function getToggleHandlerTable(name, toggle) {
    return {
        description: `Toggle ${name}`,
        defaultSubCommand: "on",
        commands: getToggleCommandHandlers(name, toggle),
    };
}
//# sourceMappingURL=handlerUtils.js.map