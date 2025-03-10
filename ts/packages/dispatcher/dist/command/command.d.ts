import { RequestId } from "../context/interactiveIO.js";
import { CommandHandlerContext } from "../context/commandHandlerContext.js";
import { CommandDescriptor, CommandDescriptorTable } from "@typeagent/agent-sdk";
import { CommandResult } from "../dispatcher.js";
export type ResolveCommandResult = {
    parsedAppAgentName: string | undefined;
    actualAppAgentName: string;
    commands: string[];
    suffix: string;
    table: CommandDescriptorTable | undefined;
    descriptor: CommandDescriptor | undefined;
    matched: boolean;
};
export declare function getDefaultSubCommandDescriptor(table: CommandDescriptorTable): CommandDescriptor | undefined;
export declare function resolveCommand(input: string, context: CommandHandlerContext): Promise<ResolveCommandResult>;
export declare function getParsedCommand(result: ResolveCommandResult): string;
export declare function processCommandNoLock(originalInput: string, context: CommandHandlerContext, attachments?: string[]): Promise<void>;
export declare function processCommand(originalInput: string, context: CommandHandlerContext, requestId?: RequestId, attachments?: string[]): Promise<CommandResult | undefined>;
export declare const enum unicodeChar {
    wood = "\uD83E\uDEB5",
    robotFace = "\uD83E\uDD16",
    constructionSign = "\uD83D\uDEA7",
    floppyDisk = "\uD83D\uDCBE",
    stopSign = "\uD83D\uDED1",
    convert = "\uD83D\uDD04"
}
export declare function getSettingSummary(context: CommandHandlerContext): string;
export declare function getTranslatorNameToEmojiMap(context: CommandHandlerContext): Map<string, string>;
export declare function getPrompt(context: CommandHandlerContext): string;
//# sourceMappingURL=command.d.ts.map