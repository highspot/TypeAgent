import { ActionContext, AppAgent } from "@typeagent/agent-sdk";
import { CommandHandlerNoParams } from "@typeagent/agent-sdk/helpers/command";
import { Result } from "typechat";
import { GreetingAction } from "./greetingActionSchema.js";
export declare function instantiate(): AppAgent;
/**
 * Implements the @greeting command.
 */
export declare class GreetingCommandHandler implements CommandHandlerNoParams {
    readonly description = "Have the agent generate a personalized greeting.";
    private instructions;
    /**
     * Handle the @greeting command
     *
     * @param context The command context.
     */
    run(context: ActionContext): Promise<void>;
    private createModel;
    getTypeChatResponse(context: ActionContext): Promise<Result<GreetingAction>>;
}
//# sourceMappingURL=greetingCommandHandler.d.ts.map