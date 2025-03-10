// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { getCommandInterface, } from "@typeagent/agent-sdk/helpers/command";
import { loadHistoryFile } from "../client.js";
const loadHandlerParameters = {
    args: {
        file: {
            description: "File to load",
        },
    },
};
const loadHandler = {
    description: "Load spotify user data",
    parameters: loadHandlerParameters,
    run: async (context, params) => {
        const sessionContext = context.sessionContext;
        const agentContext = sessionContext.agentContext;
        if (agentContext.spotify === undefined) {
            throw new Error("Spotify integration is not enabled.");
        }
        if (sessionContext.instanceStorage === undefined) {
            throw new Error("User data storage disabled.");
        }
        context.actionIO.setDisplay("Loading Spotify user data...");
        await loadHistoryFile(sessionContext.instanceStorage, params.args.file, agentContext.spotify);
        context.actionIO.setDisplay("Spotify user data loaded.");
    },
};
const handlers = {
    description: "Player App Agent Commands",
    commands: {
        spotify: {
            description: "Configure spotify integration",
            commands: {
                load: loadHandler,
            },
        },
    },
};
export function getPlayerCommandInterface() {
    return getCommandInterface(handlers);
}
//# sourceMappingURL=playerCommands.js.map