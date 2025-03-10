import { ActionContext, AppAgent } from "@typeagent/agent-sdk";
import { GreetingAction } from "./greetingActionSchema.js";
import { CommandHandlerNoParams } from "@typeagent/agent-sdk/helpers/command";
import { Result, TypeChatJsonTranslator } from "typechat";
export declare function instantiate(): AppAgent;
export declare class GreetingCommandHandler implements CommandHandlerNoParams {
    readonly description = "Have the agent generate a personalized greeting.";
    private instructions;
    run(context: ActionContext): Promise<void>;
    private createModel;
    getTypeChatResponse(userInput: string, chat: TypeChatJsonTranslator<GreetingAction>): Promise<Result<GreetingAction>>;
}
//# sourceMappingURL=greetingActionHandler.d.ts.map