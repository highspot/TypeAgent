import { CommandHandlerNoParams } from "@typeagent/agent-sdk/helpers/command";
import { CommandHandlerContext } from "./common/commandHandlerContext.js";
import { ActionContext } from "@typeagent/agent-sdk";
export declare class DebugCommandHandler implements CommandHandlerNoParams {
    readonly description = "Start node inspector";
    private debugging;
    run(context: ActionContext<CommandHandlerContext>): Promise<void>;
}
//# sourceMappingURL=debugCommandHandlers.d.ts.map
