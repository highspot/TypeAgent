import { AppAgentProvider } from "./agentProvider.js";
declare const enum ExecutionMode {
    SeparateProcess = "separate",
    DispatcherProcess = "dispatcher",
}
export type ModuleAppAgentInfo = {
    name: string;
    path?: string;
    execMode?: ExecutionMode;
};
export type AgentInfo = ModuleAppAgentInfo & {
    imports?: string[];
};
export declare function createNpmAppAgentProvider(
    configs: Record<string, ModuleAppAgentInfo>,
    requirePath: string,
): AppAgentProvider;
export {};
//# sourceMappingURL=npmAgentProvider.d.ts.map
