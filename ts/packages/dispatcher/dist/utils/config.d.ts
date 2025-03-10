import type { AgentInfo } from "../agentProvider/npmAgentProvider.js";
export type ExplainerConfig = {
    constructions?: {
        data: string[];
        file: string;
    };
};
export type Config = {
    agents: {
        [key: string]: AgentInfo;
    };
    explainers: {
        [key: string]: ExplainerConfig;
    };
    tests: string[];
};
export declare function getDispatcherConfig(): Config;
export declare function getBuiltinConstructionConfig(explainerName: string): {
    data: string[];
    file: string;
} | undefined;
export declare function getTestDataFiles(): Promise<string[]>;
//# sourceMappingURL=config.d.ts.map