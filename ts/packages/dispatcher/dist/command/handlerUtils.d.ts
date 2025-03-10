import { ActionContext } from "@typeagent/agent-sdk";
import { CommandHandlerContext } from "../context/commandHandlerContext.js";
import { CommandHandlerNoParams, CommandHandlerTable } from "@typeagent/agent-sdk/helpers/command";
export declare function getToggleCommandHandlers(name: string, toggle: (context: ActionContext<CommandHandlerContext>, enable: boolean) => Promise<void>): Record<string, CommandHandlerNoParams>;
export declare function getToggleHandlerTable(name: string, toggle: (context: ActionContext<CommandHandlerContext>, enable: boolean) => Promise<void>): CommandHandlerTable;
//# sourceMappingURL=handlerUtils.d.ts.map