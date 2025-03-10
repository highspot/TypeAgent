import { AppAgentProvider } from "./agentProvider.js";
declare const enum ExecutionMode {
    SeparateProcess = "separate",
    DispatcherProcess = "dispatcher"
}
export type AppAgentInfo = {
    name: string;
    path?: string;
    execMode?: ExecutionMode;
};
export declare function createNpmAppAgentProvider(configs: Record<string, AppAgentInfo>, requirePath: string): AppAgentProvider;
export {};
//# sourceMappingURL=npmAgentProvider.d.ts.map