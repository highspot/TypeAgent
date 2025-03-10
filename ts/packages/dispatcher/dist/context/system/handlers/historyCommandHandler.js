// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { displayResult } from "@typeagent/agent-sdk/helpers/display";
import { ActionSchemaCreator as sc, validateType } from "action-schema";
class HistoryListCommandHandler {
    constructor() {
        this.description = "List history";
    }
    async run(context) {
        const systemContext = context.sessionContext.agentContext;
        const history = systemContext.chatHistory;
        let index = 0;
        const output = [];
        for (const entry of history.entries) {
            output.push(`${index}: ${JSON.stringify(entry, undefined, 2)}`);
            index++;
        }
        displayResult(output, context);
    }
}
class HistoryClearCommandHandler {
    constructor() {
        this.description = "Clear the history";
    }
    async run(context) {
        const systemContext = context.sessionContext.agentContext;
        const history = systemContext.chatHistory;
        history.entries.length = 0;
        displayResult("Chat history cleared.", context);
    }
}
class HistoryDeleteCommandHandler {
    constructor() {
        this.description = "Delete a specific message from the chat history";
        this.parameters = {
            args: {
                index: {
                    description: "Chat history index to delete.",
                    type: "number",
                },
            },
        };
    }
    async run(context, param) {
        const systemContext = context.sessionContext.agentContext;
        const { index } = param.args;
        if (index < 0 || index >= systemContext.chatHistory.entries.length) {
            throw new Error(`The supplied index (${index}) is outside the range of available indices (0, ${systemContext.chatHistory.entries.length})`);
        }
        else if (isNaN(index)) {
            throw new Error(`The supplied value '${index}' is not a valid index.`);
        }
        systemContext.chatHistory.entries.splice(index, 1);
        displayResult(`Message ${index} deleted. ${systemContext.chatHistory.entries.length} messages remain in the chat history.`, context);
    }
}
function convertAssistantMessage(entries, message) {
    entries.push({
        role: "assistant",
        text: message.text,
        sourceAppAgentName: message.source,
        entities: message.entities,
    });
}
function convertChatHistoryInputEntry(entries, message) {
    entries.push({
        role: "user",
        text: message.user,
    });
    const assistant = message.assistant;
    if (Array.isArray(assistant)) {
        assistant.forEach((m) => convertAssistantMessage(entries, m));
    }
    else {
        convertAssistantMessage(entries, assistant);
    }
}
function getChatHistoryInput(message) {
    const entries = [];
    if (Array.isArray(message)) {
        message.forEach((m) => convertChatHistoryInputEntry(entries, m));
    }
    else {
        convertChatHistoryInputEntry(entries, message);
    }
    return entries;
}
const assistantInputSchema = sc.obj({
    text: sc.string(),
    source: sc.string(),
    entities: sc.optional(sc.array(sc.obj({
        name: sc.string(),
        type: sc.array(sc.string()),
        uniqueId: sc.optional(sc.string()),
    }))),
});
const messageInputSchema = sc.obj({
    user: sc.string(),
    assistant: sc.union(assistantInputSchema, sc.array(assistantInputSchema)),
});
const chatHistoryInputSchema = sc.union(messageInputSchema, sc.array(messageInputSchema));
class HistoryInsertCommandHandler {
    constructor() {
        this.description = "Insert messages to chat history";
        this.parameters = {
            args: {
                messages: {
                    description: "Chat history messages to insert",
                    type: "json",
                    implicitQuotes: true,
                },
            },
        };
    }
    async run(context, param) {
        const systemContext = context.sessionContext.agentContext;
        const { messages } = param.args;
        if (messages.length === 0) {
            throw new Error("No messages to insert.");
        }
        validateType(chatHistoryInputSchema, messages);
        systemContext.chatHistory.entries.push(...getChatHistoryInput(messages));
        displayResult(`Inserted ${messages.length} messages to chat history. ${systemContext.chatHistory.entries.length} messages in total.`, context);
    }
}
export function getHistoryCommandHandlers() {
    return {
        description: "History commands",
        defaultSubCommand: "list",
        commands: {
            list: new HistoryListCommandHandler(),
            clear: new HistoryClearCommandHandler(),
            delete: new HistoryDeleteCommandHandler(),
            insert: new HistoryInsertCommandHandler(),
        },
    };
}
//# sourceMappingURL=historyCommandHandler.js.map