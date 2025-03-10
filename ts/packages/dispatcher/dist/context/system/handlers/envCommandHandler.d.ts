import { CommandHandler, CommandHandlerNoParams, CommandHandlerTable } from "@typeagent/agent-sdk/helpers/command";
import { CommandHandlerContext } from "../../commandHandlerContext.js";
import { ActionContext, ParsedCommandParams } from "@typeagent/agent-sdk";
export declare class EnvCommandHandler implements CommandHandlerNoParams {
    readonly description = "Echos environment variables to the user interface.";
    run(context: ActionContext<CommandHandlerContext>): Promise<void>;
}
export declare class EnvVarCommandHandler implements CommandHandler {
    readonly description: string;
    readonly parameters: {
        readonly args: {
            readonly name: {
                readonly description: "The name of the environment variable.";
            };
        };
    };
    run(context: ActionContext<CommandHandlerContext>, params: ParsedCommandParams<typeof this.parameters>): Promise<void>;
}
export declare function getEnvCommandHandlers(): CommandHandlerTable;
//# sourceMappingURL=envCommandHandler.d.ts.map