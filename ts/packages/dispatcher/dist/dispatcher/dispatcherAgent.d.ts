import { AppAction, AppAgent } from "@typeagent/agent-sdk";
import { UnknownAction } from "./schema/dispatcherActionSchema.js";
export declare function isUnknownAction(
    action: AppAction,
): action is UnknownAction;
export declare const dispatcherAgent: AppAgent;
//# sourceMappingURL=dispatcherAgent.d.ts.map
