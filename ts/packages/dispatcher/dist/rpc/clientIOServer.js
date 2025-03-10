// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { createRpc } from "agent-rpc/rpc";
export function createClientIORpcServer(clientIO, channel) {
    const clientIOInvokeFunctions = {
        askYesNo: async (params) => {
            return clientIO.askYesNo(params.message, params.requestId, params.defaultValue);
        },
        proposeAction: async (params) => {
            return clientIO.proposeAction(params.actionTemplates, params.requestId, params.source);
        },
    };
    const clientIOCallFunctions = {
        clear: () => clientIO.clear(),
        exit: () => clientIO.exit(),
        setDisplayInfo: (params) => clientIO.setDisplayInfo(params.source, params.requestId, params.actionIndex, params.action),
        setDisplay: (params) => clientIO.setDisplay(params.message),
        appendDisplay: (params) => clientIO.appendDisplay(params.message, params.mode),
        appendDiagnosticData: (params) => {
            clientIO.appendDiagnosticData(params.requestId, params.data);
        },
        setDynamicDisplay: (params) => clientIO.setDynamicDisplay(params.source, params.requestId, params.actionIndex, params.displayId, params.nextRefreshMs),
        notify: (params) => clientIO.notify(params.event, params.requestId, params.data, params.source),
        takeAction: (params) => clientIO.takeAction(params.action, params.data),
    };
    createRpc(channel, clientIOInvokeFunctions, clientIOCallFunctions);
}
//# sourceMappingURL=clientIOServer.js.map