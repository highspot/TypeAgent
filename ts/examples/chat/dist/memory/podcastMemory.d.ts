import { conversation } from "knowledge-processor";
import { ChatContext, Models } from "./chatMemory.js";
import { CommandHandler } from "interactive-app";
export declare function createPodcastMemory(models: Models, storePath: string, settings: conversation.ConversationSettings, useSqlite?: boolean, useElastic?: boolean, createNew?: boolean): Promise<conversation.ConversationManager<string, string>>;
export declare function createPodcastCommands(context: ChatContext, commands: Record<string, CommandHandler>): void;
//# sourceMappingURL=podcastMemory.d.ts.map