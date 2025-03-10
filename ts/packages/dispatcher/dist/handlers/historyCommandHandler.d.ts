import { ActionContext, ParsedCommandParams } from "@typeagent/agent-sdk";
import {
    CommandHandler,
    CommandHandlerNoParams,
    CommandHandlerTable,
} from "@typeagent/agent-sdk/helpers/command";
import { CommandHandlerContext } from "./common/commandHandlerContext.js";
export declare class HistoryListCommandHandler
    implements CommandHandlerNoParams
{
    readonly description = "List history";
    run(context: ActionContext<CommandHandlerContext>): Promise<void>;
}
export declare class HistoryClearCommandHandler
    implements CommandHandlerNoParams
{
    readonly description = "Clear the history";
    run(context: ActionContext<CommandHandlerContext>): Promise<void>;
}
export declare class HistoryDeleteCommandHandler implements CommandHandler {
    readonly description = "Delete a specific message from the chat history";
    readonly parameters: {
        readonly args: {
            readonly index: {
                readonly description: "Chat history index to delete.";
                readonly type: "number";
            };
        };
    };
    run(
        context: ActionContext<CommandHandlerContext>,
        param: ParsedCommandParams<typeof this.parameters>,
    ): Promise<void>;
}
export declare function getHistoryCommandHandlers(): CommandHandlerTable;
//# sourceMappingURL=historyCommandHandler.d.ts.map
