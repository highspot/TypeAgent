import { Entity } from "@typeagent/agent-sdk";
import { CommandHandlerTable } from "@typeagent/agent-sdk/helpers/command";
type ChatHistoryInputAssistant = {
    text: string;
    source: string;
    entities?: Entity[];
};
export type ChatHistoryInput = {
    user: string;
    assistant: ChatHistoryInputAssistant | ChatHistoryInputAssistant[];
};
export declare function getHistoryCommandHandlers(): CommandHandlerTable;
export {};
//# sourceMappingURL=historyCommandHandler.d.ts.map