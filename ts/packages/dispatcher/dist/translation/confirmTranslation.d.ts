import { ActionContext } from "@typeagent/agent-sdk";
import { ExecutableAction, RequestAction } from "agent-cache";
import { CommandHandlerContext } from "../context/commandHandlerContext.js";
export declare function confirmTranslation(elapsedMs: number, source: string, requestAction: RequestAction, context: ActionContext<CommandHandlerContext>): Promise<{
    requestAction: RequestAction | undefined | null;
    replacedAction?: ExecutableAction[];
}>;
//# sourceMappingURL=confirmTranslation.d.ts.map