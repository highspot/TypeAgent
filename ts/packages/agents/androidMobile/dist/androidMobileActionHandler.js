// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { createActionResult } from "@typeagent/agent-sdk/helpers/action";
export function instantiate() {
    return {
        initializeAgentContext,
        updateAgentContext,
        executeAction,
        validateWildcardMatch,
    };
}
async function executeAction(action, context) {
    let result = await handlePhotoAction(action, context);
    return result;
}
async function validateWildcardMatch(action, context) {
    return true;
}
async function initializeAgentContext() {
    return {};
}
async function updateAgentContext(enable, context) { }
async function handlePhotoAction(action, context) {
    let result = undefined;
    switch (action.actionName) {
        case "sendSMS": {
            let smsAction = action;
            result = createActionResult(`Sending SMS to ${smsAction.parameters.phoneNumber} message '${smsAction.parameters.message}'`);
            context.actionIO.takeAction("send-sms", smsAction.parameters);
            break;
        }
        case "callPhoneNumber": {
            let callAction = action;
            result = createActionResult(`Calling ${callAction.parameters.phoneNumber}`);
            context.actionIO.takeAction("call-phonenumber", callAction.parameters);
            break;
        }
        case "setAlarm": {
            let alarmAction = action;
            result = createActionResult("Setting Alarm");
            context.actionIO.takeAction("set-alarm", alarmAction.parameters);
            break;
        }
        case "searchNearby": {
            let nearbySearchAction = action;
            result = createActionResult("Local search");
            context.actionIO.takeAction("search-nearby", nearbySearchAction.parameters);
            break;
        }
        case "automateUI": {
            let automateAction = action;
            result = createActionResult("Automating phone UI");
            context.actionIO.takeAction("automate-phone-ui", automateAction.parameters);
            break;
        }
        default:
            throw new Error(`Unknown action: ${action}`);
    }
    return result;
}
//# sourceMappingURL=androidMobileActionHandler.js.map