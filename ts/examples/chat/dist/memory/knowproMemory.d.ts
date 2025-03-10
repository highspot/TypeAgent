import * as kp from "knowpro";
import { CommandHandler } from "interactive-app";
import { ChatContext } from "./chatMemory.js";
export declare function createKnowproCommands(chatContext: ChatContext, commands: Record<string, CommandHandler>): Promise<void>;
export declare function parseQueryTerms(args: string[]): kp.SearchTerm[];
//# sourceMappingURL=knowproMemory.d.ts.map