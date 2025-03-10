import { AppAgent, SessionContext } from "@typeagent/agent-sdk";
import { CommandHandlerContext } from "../handlers/common/commandHandlerContext.js";
import {
    ActionConfig,
    ActionConfigProvider,
} from "../translation/agentTranslators.js";
import { AppAgentProvider } from "./agentProvider.js";
import { DeepPartialUndefinedAndNull } from "common-utils";
import { EmbeddingCache } from "../translation/actionSchemaSemanticMap.js";
import { ActionSchemaFile } from "action-schema";
export type AppAgentState = {
    schemas: Record<string, boolean> | undefined;
    actions: Record<string, boolean> | undefined;
    commands: Record<string, boolean> | undefined;
};
export type AppAgentStateOptions = DeepPartialUndefinedAndNull<AppAgentState>;
export type SetStateResult = {
    changed: {
        schemas: [string, boolean][];
        actions: [string, boolean][];
        commands: [string, boolean][];
    };
    failed: {
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
    private readonly actionSementicMap?;
    private readonly actionSchemaFileCache;
    constructor(cacheDirPath: string | undefined);
    getAppAgentNames(): string[];
    getAppAgentDescription(appAgentName: string): string;
    isSchemaEnabled(schemaName: string): boolean;
    isSchemaActive(schemaName: string): boolean;
    getActiveSchemas(): string[];
    isActionActive(schemaName: string): boolean;
    isActionEnabled(schemaName: string): boolean;
    isCommandEnabled(appAgentName: string): boolean;
    getCommandEnabledState(appAgentName: string): boolean | null | undefined;
    getEmojis(): Readonly<Record<string, string>>;
    semanticSearchActionSchema(
        request: string,
        maxMatches?: number,
        filter?: (schemaName: string) => boolean,
    ): Promise<
        | import("typeagent").ScoredItem<{
              embedding: Float32Array;
              actionSchemaFile: ActionSchemaFile;
              definition: import("action-schema").ActionSchemaTypeDefinition;
          }>[]
        | undefined
    >;
    addProvider(
        provider: AppAgentProvider,
        actionEmbeddingCache?: EmbeddingCache,
    ): Promise<void>;
    getActionEmbeddings(): [string, Float32Array][] | undefined;
    tryGetActionConfig(mayBeSchemaName: string): ActionConfig | undefined;
    getActionConfig(schemaName: string): ActionConfig;
    getSchemaNames(): string[];
    getActionConfigs(): [string, ActionConfig][];
    getInjectedSchemaForActionName(actionName: string): string | undefined;
    getAppAgent(appAgentName: string): AppAgent;
    getSessionContext(appAgentName: string): SessionContext;
    setState(
        context: CommandHandlerContext,
        overrides?: AppAgentStateOptions,
        force?: AppAgentStateOptions,
        useDefault?: boolean,
    ): Promise<SetStateResult>;
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
//# sourceMappingURL=appAgentManager.d.ts.map
