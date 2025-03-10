import { ActionContext, AppAction, SessionContext } from "@typeagent/agent-sdk";
import { DesktopActionContext } from "./connector.js";
export declare function instantiate(): {
    initializeAgentContext: typeof initializeDesktopContext;
    updateAgentContext: typeof updateDesktopContext;
    executeAction: typeof executeDesktopAction;
};
declare function initializeDesktopContext(): DesktopActionContext;
declare function updateDesktopContext(enable: boolean, context: SessionContext<DesktopActionContext>): Promise<void>;
declare function executeDesktopAction(action: AppAction, context: ActionContext<DesktopActionContext>): Promise<import("@typeagent/agent-sdk").ActionResultSuccess>;
export {};
//# sourceMappingURL=actionHandler.d.ts.map