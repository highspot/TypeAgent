import { ActionContext, ParsedCommandParams } from "@typeagent/agent-sdk";
import { CommandHandler } from "@typeagent/agent-sdk/helpers/command";
import { CommandHandlerContext } from "../../commandHandlerContext.js";
export declare class ExplainCommandHandler implements CommandHandler {
    readonly description = "Explain a translated request with action";
    readonly parameters: {
        readonly args: {
            readonly requestAction: {
                readonly description: "Request to explain";
                readonly implicitQuotes: true;
            };
        };
        readonly flags: {
            readonly repeat: {
                readonly description: "Number of times to repeat the explanation";
                readonly default: 1;
            };
            readonly filterValueInRequest: {
                readonly description: "Filter reference value for the explanation";
                readonly default: false;
            };
            readonly filterReference: {
                readonly description: "Filter reference words";
                readonly default: false;
            };
            readonly concurrency: {
                readonly description: "Number of concurrent requests";
                readonly default: 5;
            };
        };
    };
    run(context: ActionContext<CommandHandlerContext>, params: ParsedCommandParams<typeof this.parameters>): Promise<void>;
}
//# sourceMappingURL=explainCommandHandler.d.ts.map