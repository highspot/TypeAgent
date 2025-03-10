import { ArgDef, CommandHandler, CommandMetadata } from "interactive-app";
import { ChatContext, Models } from "./chatMemory.js";
import * as knowLib from "knowledge-processor";
export declare function createImageMemory(models: Models, storePath: string, settings: knowLib.conversation.ConversationSettings, useSqlite?: boolean, createNew?: boolean): Promise<knowLib.conversation.ConversationManager<string, string>>;
export declare function argPause(defaultValue?: number): ArgDef;
export declare function importImageDef(): CommandMetadata;
export declare function buildImageCountHistogramDef(): CommandMetadata;
export declare function createImageCommands(context: ChatContext, commands: Record<string, CommandHandler>): void;
//# sourceMappingURL=imageMemory.d.ts.map