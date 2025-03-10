// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { createRpc } from "agent-rpc/rpc";
export function createClientIORpcClient(channel) {
    const rpc = createRpc(channel);
    return {
        clear() {
            return rpc.send("clear", undefined);
        },
        exit() {
            return rpc.send("exit", undefined);
        },
        setDisplayInfo(source, requestId, actionIndex, action) {
            return rpc.send("setDisplayInfo", {
                source,
                requestId,
                actionIndex,
                action,
            });
        },
        setDisplay(message) {
            return rpc.send("setDisplay", { message });
        },
        appendDisplay(message, mode) {
            return rpc.send("appendDisplay", { message, mode });
        },
        appendDiagnosticData(requestId, data) {
            return rpc.send("appendDiagnosticData", { requestId, data });
        },
        setDynamicDisplay(source, requestId, actionIndex, displayId, nextRefreshMs) {
            return rpc.send("setDynamicDisplay", {
                source,
                requestId,
                actionIndex,
                displayId,
                nextRefreshMs,
            });
        },
        // Input
        askYesNo(message, requestId, defaultValue) {
            return rpc.invoke("askYesNo", { message, requestId, defaultValue });
        },
        proposeAction(actionTemplates, requestId, source) {
            return rpc.invoke("proposeAction", {
                actionTemplates,
                requestId,
                source,
            });
        },
        notify(event, requestId, data, source) {
            return rpc.send("notify", { event, requestId, data, source });
        },
        takeAction(action, data) {
            return rpc.send("takeAction", { action, data });
        },
    };
}
//# sourceMappingURL=clientIOClient.js.map