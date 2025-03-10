// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { createWebSocket } from "common-utils";
import { WebSocket } from "ws";
export function instantiate() {
    return {
        initializeAgentContext: initializeCodeContext,
        updateAgentContext: updateCodeContext,
        executeAction: executeCodeAction,
    };
}
async function initializeCodeContext() {
    return {
        enabled: new Set(),
        webSocket: undefined,
        nextCallId: 0,
        pendingCall: new Map(),
    };
}
async function updateCodeContext(enable, context, schemaName) {
    const agentContext = context.agentContext;
    if (enable) {
        agentContext.enabled.add(schemaName);
        if (agentContext.webSocket?.readyState === WebSocket.OPEN) {
            return;
        }
        const webSocket = await createWebSocket("code", "dispatcher");
        if (webSocket) {
            agentContext.webSocket = webSocket;
            agentContext.pendingCall = new Map();
            webSocket.onclose = (event) => {
                console.error("Code webSocket connection closed.");
                agentContext.webSocket = undefined;
            };
            webSocket.onmessage = async (event) => {
                const text = event.data.toString();
                const data = JSON.parse(text);
                if (data.id !== undefined && data.result !== undefined) {
                    const pendingCall = agentContext.pendingCall.get(Number(data.id));
                    if (pendingCall) {
                        agentContext.pendingCall.delete(Number(data.id));
                        const { resolve, context } = pendingCall;
                        context.actionIO.setDisplay(data.result);
                        resolve();
                    }
                }
            };
        }
    }
    else {
        agentContext.enabled.delete(schemaName);
        if (agentContext.enabled.size === 0) {
            const webSocket = context.agentContext.webSocket;
            if (webSocket) {
                webSocket.onclose = null;
                webSocket.close();
            }
            context.agentContext.webSocket = undefined;
        }
    }
}
async function executeCodeAction(action, context) {
    const agentContext = context.sessionContext.agentContext;
    const webSocketEndpoint = agentContext.webSocket;
    if (webSocketEndpoint) {
        try {
            const callId = agentContext.nextCallId++;
            return new Promise((resolve) => {
                agentContext.pendingCall.set(callId, {
                    resolve,
                    context,
                });
                webSocketEndpoint.send(JSON.stringify({
                    id: callId,
                    method: `code/${action.actionName}`,
                    params: action.parameters,
                }));
            });
        }
        catch {
            throw new Error("Unable to contact code backend.");
        }
    }
    else {
        throw new Error("No websocket connection.");
    }
}
//# sourceMappingURL=codeActionHandler.js.map