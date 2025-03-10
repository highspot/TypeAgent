import { AppAction } from "@typeagent/agent-sdk";
import { PendingRequestEntry } from "./multipleActionSchema.js";
export type PendingRequestAction = {
    actionName: "pendingRequestAction";
    parameters: {
        pendingRequest: string;
        pendingResultEntityId: string;
    };
};
export declare function isPendingRequestAction(action: AppAction): action is PendingRequestAction;
export declare function createPendingRequestAction(entry: PendingRequestEntry): import("agent-cache").ExecutableAction;
//# sourceMappingURL=pendingRequest.d.ts.map