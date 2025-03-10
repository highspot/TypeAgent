import { ActionContext, SessionContext } from "./agentInterface.js";
import { ParameterDefinitions, ParsedCommandParams } from "./parameters.js";
export type CommandDescriptor = {
    description: string;
    help?: string;
    parameters?: ParameterDefinitions | undefined;
};
export type CommandDescriptorTable = {
    description: string;
    commands: Record<string, CommandDescriptors>;
    defaultSubCommand?: CommandDescriptor | string | undefined;
};
export type CommandDescriptors = CommandDescriptor | CommandDescriptorTable;
export interface AppAgentCommandInterface {
    getCommands(context: SessionContext): Promise<CommandDescriptors>;
    getCommandCompletion?(commands: string[], // path to the command descriptors
    params: ParsedCommandParams<ParameterDefinitions> | undefined, names: string[], // array of <argName> or --<flagName> or --<jsonFlagName>.
    context: SessionContext<unknown>): Promise<string[]>;
    executeCommand(commands: string[], // path to the command descriptors
    params: ParsedCommandParams<ParameterDefinitions> | undefined, context: ActionContext<unknown>, attachments?: string[]): Promise<void>;
}
//# sourceMappingURL=command.d.ts.map