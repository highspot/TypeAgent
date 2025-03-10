import { CommandHandlerContext } from "../context/commandHandlerContext.js";
export type CommandCompletionResult = {
    partial: string;
    space: boolean;
    prefix: string;
    completions: string[];
};
export declare function getCommandCompletion(input: string, context: CommandHandlerContext): Promise<CommandCompletionResult | undefined>;
//# sourceMappingURL=completion.d.ts.map