import { createActionResultFromTextDisplay, } from "@typeagent/agent-sdk/helpers/action";
import { createSqliteDb } from "../sqliteHandler.js";
import { parseAndExecuteQuery } from "../queryHandler.js";
async function initizalizeHighspotConversationContext() {
    return {
        db: await createSqliteDb(),
    };
}
export function instantiate() {
    return {
        executeAction: executeHighspotConversationAction,
        initializeAgentContext: initizalizeHighspotConversationContext,
    };
}
async function executeHighspotConversationAction(action, context) {
    const result = await handleHighspotConversationAction(action, context.sessionContext);
    return result;
}
async function handleQueryPeopleAction(action, context) {
    console.log(`Querying people with query: ${action.parameters?.query}`);
    if (!action.parameters) {
        return createActionResultFromTextDisplay("ERROR: No query provided", undefined);
    }
    // TODO these are bad hardcoded but just for poc
    const tableName = "user";
    const result = await parseAndExecuteQuery(action.parameters.query, tableName, context);
    return createActionResultFromTextDisplay(result, action.parameters?.query || "");
}
async function handleQueryContentAction(action, context) {
    console.log(`Querying items with query: ${action.parameters?.query}`);
    if (!action.parameters) {
        return createActionResultFromTextDisplay("ERROR: No query provided", undefined);
    }
    // TODO these are bad hardcoded but just for poc
    const tableName = "content";
    const result = await parseAndExecuteQuery(action.parameters.query, tableName, context);
    return createActionResultFromTextDisplay(result, action.parameters?.query || "");
}
async function handleLoadCSVAction(action, context) {
    if (!context.agentContext.db) {
        return createActionResultFromTextDisplay("ERROR: Database not initialized", action.parameters.filename);
    }
    const result = await context.agentContext.db.loadCSV(action.parameters.filename) || "ERROR";
    return createActionResultFromTextDisplay(result, action.parameters.filename);
}
async function handleHighspotConversationAction(action, context) {
    switch (action.actionName) {
        case "queryPeople":
            return await handleQueryPeopleAction(action, context);
        case "queryContent":
            return await handleQueryContentAction(action, context);
        case "loadCSV":
            return await handleLoadCSVAction(action, context);
        default:
            throw new Error(`Unsupported action: ${action}`);
    }
}
//# sourceMappingURL=highspotConversationActionHandler.js.map