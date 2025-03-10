import { CommandHandlerContext } from "./common/commandHandlerContext.js";
import { ActionContext, ParsedCommandParams } from "@typeagent/agent-sdk";
import { CommandHandler } from "@typeagent/agent-sdk/helpers/command";
export declare class TraceCommandHandler implements CommandHandler {
    readonly description = "Enable or disable trace namespaces";
    readonly parameters: {
        readonly flags: {
            readonly clear: {
                readonly char: "*";
                readonly description: "Clear all trace namespaces";
                readonly type: "boolean";
                readonly default: false;
            };
        };
        readonly args: {
            readonly namespaces: {
                readonly description: "Namespaces to enable";
                readonly type: "string";
                readonly multiple: true;
                readonly optional: true;
            };
        };
    };
    run(
        context: ActionContext<CommandHandlerContext>,
        params: ParsedCommandParams<typeof this.parameters>,
    ): Promise<void>;
}
//# sourceMappingURL=traceCommandHandler.d.ts.map
