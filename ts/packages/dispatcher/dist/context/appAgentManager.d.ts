import { AppAgent, SessionContext, AppAgentManifest } from "@typeagent/agent-sdk";
import { CommandHandlerContext } from "./commandHandlerContext.js";
import { ActionConfig } from "../translation/actionConfig.js";
import { ActionConfigProvider } from "../translation/actionConfigProvider.js";
import { AppAgentProvider } from "../agentProvider/agentProvider.js";
import { EmbeddingCache } from "../translation/actionSchemaSemanticMap.js";
import { ActionSchemaFile } from "action-schema";
export type AppAgentStateConfig = {
    schemas: Record<string, boolean>;
    actions: Record<string, boolean>;
    commands: Record<string, boolean>;
};
export declare const appAgentStateKeys: readonly ["schemas", "actions", "commands"];
export type AppAgentStateSettings = Partial<AppAgentStateConfig>;
export type SetStateResult = {
    changed: {
        schemas: [string, boolean][];
        actions: [string, boolean][];
        commands: [string, boolean][];
    };
    failed: {
        schemas: [string, boolean, Error][];
        actions: [string, boolean, Error][];
        commands: [string, boolean, Error][];
    };
};
export declare const alwaysEnabledAgents: {
    schemas: string[];
    actions: string[];
    commands: string[];
};
export declare class AppAgentManager implements ActionConfigProvider {
    private readonly agents;
    private readonly actionConfigs;
    private readonly injectedSchemaForActionName;
    private readonly emojis;
    private readonly transientAgents;
    private readonly actionSemanticMap?;
    private readonly actionSchemaFileCache;
    constructor(cacheDir: string | undefined);
    getAppAgentNames(): string[];
    getAppAgentDescription(appAgentName: string): string;
    isAppAgentName(appAgentName: string): boolean;
    isSchemaEnabled(schemaName: string): boolean;
    isSchemaActive(schemaName: string): boolean;
    getActiveSchemas(): string[];
    isActionActive(schemaName: string): boolean;
    isActionEnabled(schemaName: string): boolean;
    isCommandEnabled(appAgentName: string): boolean;
    getCommandEnabledState(appAgentName: string): boolean | null | undefined;
    getEmojis(): Readonly<Record<string, string>>;
    semanticSearchActionSchema(request: string, maxMatches?: number, filter?: (schemaName: string) => boolean): Promise<import("typeagent").ScoredItem<{
        embedding: Float32Array;
        actionSchemaFile: ActionSchemaFile;
        definition: import("action-schema").ActionSchemaTypeDefinition;
    }>[] | undefined>;
    addProvider(provider: AppAgentProvider, actionEmbeddingCache?: EmbeddingCache): Promise<void>;
    private addAgentManifest;
    addDynamicAgent(appAgentName: string, manifest: AppAgentManifest, appAgent: AppAgent): Promise<void>;
    private cleanupAgent;
    removeAgent(appAgentName: string): Promise<void>;
    getActionEmbeddings(): [string, Float32Array][] | undefined;
    tryGetActionConfig(mayBeSchemaName: string): ActionConfig | undefined;
    getActionConfig(schemaName: string): ActionConfig;
    getSchemaNames(): string[];
    getActionConfigs(): ActionConfig[];
    getAppAgent(appAgentName: string): AppAgent;
    getSessionContext(appAgentName: string): SessionContext;
    setState(context: CommandHandlerContext, settings?: AppAgentStateSettings): Promise<SetStateResult>;
    getTransientState(schemaName: string): boolean | undefined;
    toggleTransient(schemaName: string, enable: boolean): void;
    close(): Promise<void>;
    private updateAction;
    private ensureSessionContext;
    private initializeSessionContext;
    private checkCloseSessionContext;
    private closeSessionContext;
    private ensureAppAgent;
    private getRecord;
    tryGetActionSchemaFile(schemaName: string): ActionSchemaFile | undefined;
    getActionSchemaFileForConfig(config: ActionConfig): ActionSchemaFile;
}
export type AppAgentStateInitSettings = string[] | boolean | undefined | {
    schemas?: string[] | boolean | undefined;
    actions?: string[] | boolean | undefined;
    commands?: string[] | boolean | undefined;
};
export declare function getAppAgentStateSettings(settings: AppAgentStateInitSettings, agents: AppAgentManager): AppAgentStateSettings | undefined;
//# sourceMappingURL=appAgentManager.d.ts.map