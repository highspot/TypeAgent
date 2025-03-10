import { CommandHandlerContext } from "../../commandHandlerContext.js";
import { SessionAction } from "../schema/sessionActionSchema.js";
import { ActionContext, TypeAgentAction } from "@typeagent/agent-sdk";
export declare function executeSessionAction(action: TypeAgentAction<SessionAction>, context: ActionContext<CommandHandlerContext>): Promise<undefined>;
//# sourceMappingURL=sessionActionHandler.d.ts.map