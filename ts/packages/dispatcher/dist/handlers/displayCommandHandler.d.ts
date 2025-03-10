import { ActionContext, ParsedCommandParams } from "@typeagent/agent-sdk";
import { CommandHandler } from "@typeagent/agent-sdk/helpers/command";
import { CommandHandlerContext } from "../internal.js";
export declare class DisplayCommandHandler implements CommandHandler {
    readonly description = "Send text to display";
    readonly parameters: {
        readonly flags: {
            readonly speak: {
                readonly description: "Speak the display for the host that supports TTS";
                readonly default: false;
            };
        };
        readonly args: {
            readonly text: {
                readonly description: "text to display";
                readonly multiple: true;
            };
        };
    };
    run(
        context: ActionContext<CommandHandlerContext>,
        params: ParsedCommandParams<typeof this.parameters>,
    ): Promise<void>;
}
//# sourceMappingURL=displayCommandHandler.d.ts.map
