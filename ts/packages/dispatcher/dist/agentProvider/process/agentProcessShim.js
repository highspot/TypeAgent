// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import child_process from "child_process";
import { createAgentRpcClient } from "agent-rpc/client";
import { createChannelProvider } from "agent-rpc/channel";
import { fileURLToPath } from "url";
export async function createAgentProcess(agentName, modulePath) {
    const process = child_process.fork(fileURLToPath(new URL(`./agentProcess.js`, import.meta.url)), [agentName, modulePath]);
    return {
        process,
        appAgent: await createAgentRpcClient(agentName, createChannelProvider(process)),
        count: 1,
    };
}
//# sourceMappingURL=agentProcessShim.js.map