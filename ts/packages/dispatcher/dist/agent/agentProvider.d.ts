import { AppAgent, AppAgentManifest } from "@typeagent/agent-sdk";
export interface AppAgentProvider {
    getAppAgentNames(): string[];
    getAppAgentManifest(appAgentName: string): Promise<AppAgentManifest>;
    loadAppAgent(appAgentName: string): Promise<AppAgent>;
    unloadAppAgent(appAgentName: string): void;
}
//# sourceMappingURL=agentProvider.d.ts.map
