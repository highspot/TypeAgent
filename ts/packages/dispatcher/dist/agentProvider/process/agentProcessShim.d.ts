/// <reference types="node" resolution-mode="require"/>
import child_process from "child_process";
import { AppAgent } from "@typeagent/agent-sdk";
export type AgentProcess = {
    appAgent: AppAgent;
    process: child_process.ChildProcess | undefined;
    count: number;
};
export declare function createAgentProcess(agentName: string, modulePath: string): Promise<AgentProcess>;
//# sourceMappingURL=agentProcessShim.d.ts.map