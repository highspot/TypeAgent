import { ActionContext, SessionContext } from "../agentInterface.js";
import { AppAgentCommandInterface, CommandDescriptor, CommandDescriptors, CommandDescriptorTable } from "../command.js";
import { ParameterDefinitions, ParsedCommandParams, PartialParsedCommandParams } from "../parameters.js";
export { resolveFlag, getFlagMultiple, getFlagType, } from "./parameterHelpers.js";
export type CommandHandlerNoParams = CommandDescriptor & {
    parameters?: undefined | false;
    run(context: ActionContext<unknown>, params: undefined, attachments?: string[]): Promise<void>;
    getCompletion?: undefined;
};
export type CommandHandler = CommandDescriptor & {
    parameters: ParameterDefinitions;
    run(context: ActionContext<unknown>, params: ParsedCommandParams<ParameterDefinitions>, attachments?: string[]): Promise<void>;
    getCompletion?(context: SessionContext<unknown>, params: PartialParsedCommandParams<ParameterDefinitions>, names: string[]): Promise<string[]>;
};
type CommandHandlerTypes = CommandHandlerNoParams | CommandHandler;
type CommandDefinitions = CommandHandlerTypes | CommandHandlerTable;
export interface CommandHandlerTable extends CommandDescriptorTable {
    description: string;
    commands: Record<string, CommandDefinitions>;
    defaultSubCommand?: CommandHandlerTypes | string | undefined;
}
export declare function isCommandDescriptorTable(entry: CommandDescriptors): entry is CommandDescriptorTable;
export declare function getCommandInterface(handlers: CommandDefinitions): AppAgentCommandInterface;
//# sourceMappingURL=commandHelpers.d.ts.map