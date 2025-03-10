// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { createRpc } from "agent-rpc/rpc";
function remoteCallNotSupported() {
    throw new Error("Remote call not supported");
}
export function createDispatcherRpcClient(channel) {
    const rpc = createRpc(channel);
    return {
        async processCommand(command, requestId, attachments) {
            return rpc.invoke("processCommand", {
                command,
                requestId,
                attachments,
            });
        },
        async getDynamicDisplay(appAgentName, type, id) {
            return rpc.invoke("getDynamicDisplay", { appAgentName, type, id });
        },
        async getTemplateSchema(templateAgentName, templateName, data) {
            return rpc.invoke("getTemplateSchema", {
                templateAgentName,
                templateName,
                data,
            });
        },
        async getTemplateCompletion(templateAgentName, templateName, data, propertyName) {
            return rpc.invoke("getTemplateCompletion", {
                templateAgentName,
                templateName,
                data,
                propertyName,
            });
        },
        async getCommandCompletion(prefix) {
            return rpc.invoke("getCommandCompletion", { prefix });
        },
        async close() {
            return rpc.invoke("close", undefined);
        },
        getPrompt: remoteCallNotSupported,
        getSettingSummary: remoteCallNotSupported,
        getTranslatorNameToEmojiMap: remoteCallNotSupported,
    };
}
//# sourceMappingURL=dispatcherClient.js.map