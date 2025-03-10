import { CommandHandlerContext } from "../context/commandHandlerContext.js";
import { ActionContext } from "@typeagent/agent-sdk";
import { HistoryContext, RequestAction } from "agent-cache";
import { CachedImageWithDetails } from "common-utils";
import { TypeAgentTranslator } from "./agentTranslators.js";
import { PendingRequestAction } from "./pendingRequest.js";
import { openai as ai } from "aiclient";
export declare function getTranslatorForSchema(context: CommandHandlerContext, schemaName: string): TypeAgentTranslator;
export declare function getChatHistoryForTranslation(context: CommandHandlerContext): HistoryContext;
export type TranslationResult = {
    requestAction: RequestAction;
    elapsedMs: number;
    fromUser: boolean;
    fromCache: boolean;
    tokenUsage?: ai.CompletionUsageStats;
};
export declare function translateRequest(request: string, context: ActionContext<CommandHandlerContext>, history?: HistoryContext, attachments?: CachedImageWithDetails[], streamingActionIndex?: number): Promise<TranslationResult | undefined | null>;
export declare function translatePendingRequestAction(action: PendingRequestAction, context: ActionContext<CommandHandlerContext>, actionIndex?: number): Promise<TranslationResult | null | undefined>;
//# sourceMappingURL=translateRequest.d.ts.map