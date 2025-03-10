import { AppAgent, AppAgentManifest } from "@typeagent/agent-sdk";
export interface AppAgentProvider {
    getAppAgentNames(): string[];
    getAppAgentManifest(appAgentName: string): Promise<AppAgentManifest>;
    loadAppAgent(appAgentName: string): Promise<AppAgent>;
    unloadAppAgent(appAgentName: string): void;
}
export interface AppAgentInstaller {
    install(name: string, moduleName: string, packagePath: string): AppAgentProvider;
    uninstall(name: string): void;
}
export interface ConstructionProvider {
    getBuiltinConstructionConfig(explainerName: string): {
        data: string[];
        file: string;
    } | undefined;
    getImportTranslationFiles(extended?: boolean): Promise<string[]>;
}
//# sourceMappingURL=agentProvider.d.ts.map