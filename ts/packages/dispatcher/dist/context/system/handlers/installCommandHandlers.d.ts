import { ActionContext, ParsedCommandParams } from "@typeagent/agent-sdk";
import { CommandHandler } from "@typeagent/agent-sdk/helpers/command";
import { CommandHandlerContext } from "../../commandHandlerContext.js";
export declare class InstallCommandHandler implements CommandHandler {
    readonly description = "Install an agent";
    readonly parameters: {
        readonly args: {
            readonly name: {
                readonly description: "Name of the agent";
                readonly type: "string";
            };
            readonly agent: {
                readonly description: "Path of agent package directory or tar file to install";
                readonly type: "string";
            };
        };
    };
    run(context: ActionContext<CommandHandlerContext>, params: ParsedCommandParams<typeof this.parameters>): Promise<void>;
}
export declare class UninstallCommandHandler implements CommandHandler {
    readonly description = "Uninstall an agent";
    readonly parameters: {
        readonly args: {
            readonly name: {
                readonly description: "Name of the agent";
                readonly type: "string";
            };
        };
    };
    run(context: ActionContext<CommandHandlerContext>, params: ParsedCommandParams<typeof this.parameters>): Promise<void>;
}
//# sourceMappingURL=installCommandHandlers.d.ts.map