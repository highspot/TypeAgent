import { CommandHandlerContext } from "./common/commandHandlerContext.js";
import { ActionContext, ParsedCommandParams } from "@typeagent/agent-sdk";
import { CommandHandler } from "@typeagent/agent-sdk/helpers/command";
export declare class CorrectCommandHandler implements CommandHandler {
    readonly description = "Correct the last explanation";
    readonly parameters: {
        args: {
            correction: {
                description: string;
                implicitQuotes: boolean;
            };
        };
    };
    run(
        context: ActionContext<CommandHandlerContext>,
        params: ParsedCommandParams<typeof this.parameters>,
    ): Promise<void>;
}
//# sourceMappingURL=correctCommandHandler.d.ts.map
