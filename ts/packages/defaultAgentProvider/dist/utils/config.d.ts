import { AppAgentInfo } from "agent-dispatcher/helpers/npmAgentProvider";
export type ExplainerConfig = {
    constructions?: {
        data: string[];
        file: string;
    };
};
export type AppAgentConfig = {
    agents: {
        [key: string]: AppAgentInfo;
    };
};
export type Config = AppAgentConfig & {
    explainers: {
        [key: string]: ExplainerConfig;
    };
    tests: string[];
};
export declare function getConfig(): Config;
export declare function getBuiltinConstructionConfig(explainerName: string): {
    data: string[];
    file: string;
} | undefined;
export declare function getTestDataFiles(extended?: boolean): Promise<string[]>;
//# sourceMappingURL=config.d.ts.map