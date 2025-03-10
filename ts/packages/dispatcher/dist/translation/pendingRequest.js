// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { createExecutableAction } from "agent-cache";
import { DispatcherName } from "../context/dispatcher/dispatcherUtils.js";
export function isPendingRequestAction(action) {
    return (action.translatorName === DispatcherName &&
        action.actionName === "pendingRequestAction");
}
export function createPendingRequestAction(entry) {
    return createExecutableAction(DispatcherName, "pendingRequestAction", {
        pendingRequest: entry.request,
        pendingResultEntityId: entry.pendingResultEntityId,
    });
}
//# sourceMappingURL=pendingRequest.js.map