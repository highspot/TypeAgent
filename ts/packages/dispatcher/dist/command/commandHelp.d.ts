import { ActionContext, CommandDescriptor, CommandDescriptorTable } from "@typeagent/agent-sdk";
import { CommandHandlerContext } from "../context/commandHandlerContext.js";
export declare function getUsage(command: string, descriptor: CommandDescriptor): string;
export declare function getHandlerTableUsage(table: CommandDescriptorTable, command: string | undefined, systemContext: CommandHandlerContext): string;
export declare function printStructuredHandlerTableUsage(table: CommandDescriptorTable, command: string | undefined, context: ActionContext<CommandHandlerContext>): void;
//# sourceMappingURL=commandHelp.d.ts.map