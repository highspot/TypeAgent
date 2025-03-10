// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { getPrompt, getSettingSummary, getTranslatorNameToEmojiMap, processCommand, } from "./command/command.js";
import { getCommandCompletion, } from "./command/completion.js";
import { closeCommandHandlerContext, initializeCommandHandlerContext, } from "./context/commandHandlerContext.js";
async function getDynamicDisplay(context, appAgentName, type, displayId) {
    const appAgent = context.agents.getAppAgent(appAgentName);
    if (appAgent.getDynamicDisplay === undefined) {
        throw new Error(`Dynamic display not supported by '${appAgentName}'`);
    }
    const sessionContext = context.agents.getSessionContext(appAgentName);
    return appAgent.getDynamicDisplay(type, displayId, sessionContext);
}
function getTemplateSchema(context, templateAgentName, templateName, data) {
    const appAgent = context.agents.getAppAgent(templateAgentName);
    if (appAgent.getTemplateSchema === undefined) {
        throw new Error(`Template schema not supported by '${templateAgentName}'`);
    }
    const sessionContext = context.agents.getSessionContext(templateAgentName);
    return appAgent.getTemplateSchema(templateName, data, sessionContext);
}
async function getTemplateCompletion(templateAgentName, templateName, data, propertyName, context) {
    const appAgent = context.agents.getAppAgent(templateAgentName);
    if (appAgent.getTemplateCompletion === undefined) {
        throw new Error(`Template schema not supported by '${templateAgentName}'`);
    }
    const sessionContext = context.agents.getSessionContext(templateAgentName);
    return appAgent.getTemplateCompletion(templateName, data, propertyName, sessionContext);
}
export async function createDispatcher(hostName, options) {
    const context = await initializeCommandHandlerContext(hostName, options);
    return {
        processCommand(command, requestId, attachments) {
            return processCommand(command, context, requestId, attachments);
        },
        getCommandCompletion(prefix) {
            return getCommandCompletion(prefix, context);
        },
        getDynamicDisplay(appAgentName, type, id) {
            return getDynamicDisplay(context, appAgentName, type, id);
        },
        getTemplateSchema(templateAgentName, templateName, data) {
            return getTemplateSchema(context, templateAgentName, templateName, data);
        },
        getTemplateCompletion(templateAgentName, templateName, data, propertyName) {
            return getTemplateCompletion(templateAgentName, templateName, data, propertyName, context);
        },
        async close() {
            await closeCommandHandlerContext(context);
        },
        getPrompt() {
            return getPrompt(context);
        },
        getSettingSummary() {
            return getSettingSummary(context);
        },
        getTranslatorNameToEmojiMap() {
            return getTranslatorNameToEmojiMap(context);
        },
    };
}
//# sourceMappingURL=dispatcher.js.map