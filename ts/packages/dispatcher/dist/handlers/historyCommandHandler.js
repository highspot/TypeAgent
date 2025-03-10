// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { displayResult } from "@typeagent/agent-sdk/helpers/display";
export class HistoryListCommandHandler {
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
export class HistoryClearCommandHandler {
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
export class HistoryDeleteCommandHandler {
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
            throw new Error(
                `The supplied index (${index}) is outside the range of available indicies (0, ${systemContext.chatHistory.entries.length})`,
            );
        } else if (isNaN(index)) {
            throw new Error(
                `The supplied value '${index}' is not a valid index.`,
            );
        }
        systemContext.chatHistory.entries.splice(index, 1);
        displayResult(
            `Message ${index} deleted. ${systemContext.chatHistory.entries.length} messages remain in the chat history.`,
            context,
        );
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
        },
    };
}
//# sourceMappingURL=historyCommandHandler.js.map
