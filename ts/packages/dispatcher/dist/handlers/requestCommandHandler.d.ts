import { RequestAction, HistoryContext, ParamObjectType } from "agent-cache";
import { CommandHandlerContext } from "./common/commandHandlerContext.js";
import { CachedImageWithDetails } from "common-utils";
import { ActionContext, ParsedCommandParams } from "@typeagent/agent-sdk";
import { CommandHandler } from "@typeagent/agent-sdk/helpers/command";
export interface TranslatedAction {
    actionName: string;
    parameters?: ParamObjectType;
}
type TranslationResult = {
    requestAction: RequestAction;
    elapsedMs: number;
    fromUser: boolean;
    fromCache: boolean;
};
export declare function translateRequest(
    request: string,
    context: ActionContext<CommandHandlerContext>,
    history?: HistoryContext,
    attachments?: CachedImageWithDetails[],
): Promise<TranslationResult | undefined | null>;
export declare class RequestCommandHandler implements CommandHandler {
    readonly description = "Translate and explain a request";
    readonly parameters: {
        readonly args: {
            readonly request: {
                readonly description: "Request to translate";
                readonly implicitQuotes: true;
                readonly optional: true;
            };
        };
    };
    run(
        context: ActionContext<CommandHandlerContext>,
        params: ParsedCommandParams<typeof this.parameters>,
        attachments?: string[],
    ): Promise<void>;
}
export {};
//# sourceMappingURL=requestCommandHandler.d.ts.map
