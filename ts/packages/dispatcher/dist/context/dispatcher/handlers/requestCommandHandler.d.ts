import { CommandHandlerContext } from "../../commandHandlerContext.js";
import { ActionContext, ParsedCommandParams } from "@typeagent/agent-sdk";
import { CommandHandler } from "@typeagent/agent-sdk/helpers/command";
export declare class RequestCommandHandler implements CommandHandler {
    readonly description = "Translate and explain a request";
    readonly parameters: {
        readonly args: {
            readonly request: {
                readonly description: "Request to translate";
                readonly implicitQuotes: true;
                readonly optional: true;
            };
        };
    };
    run(context: ActionContext<CommandHandlerContext>, params: ParsedCommandParams<typeof this.parameters>, attachments?: string[]): Promise<void>;
}
//# sourceMappingURL=requestCommandHandler.d.ts.map