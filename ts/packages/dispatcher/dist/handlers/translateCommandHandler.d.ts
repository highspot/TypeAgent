import { CommandHandlerContext } from "./common/commandHandlerContext.js";
import { ActionContext, ParsedCommandParams } from "@typeagent/agent-sdk";
import { CommandHandler } from "@typeagent/agent-sdk/helpers/command";
export declare class TranslateCommandHandler implements CommandHandler {
    readonly description = "Translate a request";
    readonly parameters: {
        readonly args: {
            readonly request: {
                readonly description: "Request to translate";
                readonly implicitQuotes: true;
            };
        };
    };
    run(
        context: ActionContext<CommandHandlerContext>,
        params: ParsedCommandParams<typeof this.parameters>,
    ): Promise<void>;
}
//# sourceMappingURL=translateCommandHandler.d.ts.map
