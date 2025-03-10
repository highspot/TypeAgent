import * as knowLib from "knowledge-processor";
import { conversation } from "knowledge-processor";
import { ChatContext, Models } from "./chatMemory.js";
import { CommandHandler } from "interactive-app";
export declare function createEmailMemory(models: Models, storePath: string, settings: conversation.ConversationSettings, useSqlite?: boolean, createNew?: boolean): Promise<knowLib.conversation.ConversationManager<string, string>>;
export declare function createEmailCommands(context: ChatContext, commands: Record<string, CommandHandler>): void;
export type EmailActionItem = {
    action: conversation.Action;
    sourceBlocks: knowLib.TextBlock[];
};
export declare function emailActionItemsFromConversation(cm: conversation.ConversationManager, subject: string, action?: string, timePeriod?: conversation.VerbTense): Promise<EmailActionItem[] | undefined>;
//# sourceMappingURL=emailMemory.d.ts.map