/// <reference types="node" resolution-mode="require"/>
/// <reference types="node" resolution-mode="require"/>
import child_process from "node:child_process";
import { ProgramNameIndex } from "./programNameIndex.js";
import { Storage } from "@typeagent/agent-sdk";
import { DesktopActions } from "./actionsSchema.js";
export type DesktopActionContext = {
    desktopProcess: child_process.ChildProcess | undefined;
    programNameIndex: ProgramNameIndex | undefined;
    refreshPromise: Promise<void> | undefined;
    abortRefresh: AbortController | undefined;
};
export declare function runDesktopActions(action: DesktopActions, agentContext: DesktopActionContext, sessionStorage: Storage): Promise<string>;
export declare function setupDesktopActionContext(agentContext: DesktopActionContext, storage?: Storage): Promise<void>;
export declare function disableDesktopActionContext(agentContext: DesktopActionContext): Promise<void>;
//# sourceMappingURL=connector.d.ts.map