// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { dispatcherAgent, dispatcherManifest, } from "./dispatcher/dispatcherAgent.js";
import { systemAgent, systemManifest } from "./system/systemAgent.js";
const inlineHandlers = {
    dispatcher: dispatcherAgent,
    system: systemAgent,
};
export const inlineAgentManifests = {
    dispatcher: dispatcherManifest,
    system: systemManifest,
};
export function createInlineAppAgentProvider(context) {
    return {
        getAppAgentNames() {
            return Object.keys(inlineAgentManifests);
        },
        async getAppAgentManifest(appAgentName) {
            const manifest = inlineAgentManifests[appAgentName];
            if (manifest === undefined) {
                throw new Error(`Invalid app agent: ${appAgentName}`);
            }
            return manifest;
        },
        async loadAppAgent(appAgentName) {
            if (context === undefined) {
                throw new Error("Context is required to load inline agent");
            }
            const handlers = inlineHandlers[appAgentName];
            if (handlers === undefined) {
                throw new Error(`Invalid app agent: ${appAgentName}`);
            }
            return { ...handlers, initializeAgentContext: async () => context };
        },
        unloadAppAgent(appAgentName) {
            // Inline agents are always loaded
            if (inlineAgentManifests[appAgentName] === undefined) {
                throw new Error(`Invalid app agent: ${appAgentName}`);
            }
        },
    };
}
//# sourceMappingURL=inlineAgentProvider.js.map