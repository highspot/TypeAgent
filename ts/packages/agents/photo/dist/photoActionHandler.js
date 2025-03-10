// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { createActionResult } from "@typeagent/agent-sdk/helpers/action";
export function instantiate() {
    return {
        initializeAgentContext: initializePhotoContext,
        updateAgentContext: updatePhotoContext,
        executeAction: executePhotoAction,
        validateWildcardMatch: photoValidateWildcardMatch,
    };
}
async function executePhotoAction(action, context) {
    let result = await handlePhotoAction(action, context);
    return result;
}
async function photoValidateWildcardMatch(action, context) {
    return true;
}
async function initializePhotoContext() {
    return {};
}
async function updatePhotoContext(enable, context) { }
async function handlePhotoAction(action, photoContext) {
    let result = undefined;
    switch (action.actionName) {
        case "takePhoto": {
            result = createActionResult("Showing camera...");
            photoContext.actionIO.takeAction("show-camera");
            break;
        }
        default:
            throw new Error(`Unknown action: ${action.actionName}`);
    }
    return result;
}
//# sourceMappingURL=photoActionHandler.js.map