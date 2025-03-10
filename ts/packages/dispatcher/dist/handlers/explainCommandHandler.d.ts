import { ActionContext, ParsedCommandParams } from "@typeagent/agent-sdk";
import { CommandHandler } from "@typeagent/agent-sdk/helpers/command";
import { CommandHandlerContext } from "./common/commandHandlerContext.js";
export declare class ExplainCommandHandler implements CommandHandler {
    readonly description = "Explain a translated request with action";
    readonly parameters: {
        readonly args: {
            readonly requestAction: {
                readonly description: "Request to explain";
                readonly implicitQuotes: true;
            };
        };
    };
    run(
        context: ActionContext<CommandHandlerContext>,
        params: ParsedCommandParams<typeof this.parameters>,
    ): Promise<void>;
}
//# sourceMappingURL=explainCommandHandler.d.ts.map
