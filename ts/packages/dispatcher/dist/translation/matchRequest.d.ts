import { HistoryContext } from "agent-cache";
import { CommandHandlerContext } from "../context/commandHandlerContext.js";
import { ActionContext } from "@typeagent/agent-sdk";
import { TranslationResult } from "./translateRequest.js";
export declare function matchRequest(request: string, context: ActionContext<CommandHandlerContext>, history?: HistoryContext): Promise<TranslationResult | undefined | null>;
//# sourceMappingURL=matchRequest.d.ts.map