/// <reference types="node" resolution-mode="require"/>
import { ChildProcess } from "child_process";
import { DeepPartialUndefined, Limiter } from "common-utils";
import { Logger } from "telemetry";
import { AgentCache } from "agent-cache";
import { DispatcherConfig, Session, SessionOptions } from "./session.js";
import { TypeAgentTranslator } from "../translation/agentTranslators.js";
import { ClientIO, RequestId } from "./interactiveIO.js";
import { ChatHistory } from "./chatHistory.js";
import { ActionContext } from "@typeagent/agent-sdk";
import { Profiler } from "telemetry";
import { conversation as Conversation } from "knowledge-processor";
import { AppAgentManager, AppAgentStateInitSettings } from "./appAgentManager.js";
import { AppAgentInstaller, AppAgentProvider, ConstructionProvider } from "../agentProvider/agentProvider.js";
import { RequestMetricsManager } from "../utils/metrics.js";
import { ActionContextWithClose } from "../execute/actionHandlers.js";
import { CommandResult } from "../dispatcher.js";
export type EmptyFunction = () => void;
export type SetSettingFunction = (name: string, value: any) => void;
export interface ClientSettingsProvider {
    set: SetSettingFunction | null;
}
export declare function getCommandResult(context: CommandHandlerContext): CommandResult | undefined;
export declare function ensureCommandResult(context: CommandHandlerContext): CommandResult;
export type CommandHandlerContext = {
    readonly agents: AppAgentManager;
    readonly agentInstaller: AppAgentInstaller | undefined;
    session: Session;
    readonly persistDir: string | undefined;
    readonly cacheDir: string | undefined;
    readonly embeddingCacheDir: string | undefined;
    conversationManager?: Conversation.ConversationManager | undefined;
    developerMode?: boolean;
    explanationAsynchronousMode: boolean;
    dblogging: boolean;
    clientIO: ClientIO;
    collectCommandResult: boolean;
    commandLock: Limiter;
    lastActionSchemaName: string;
    translatorCache: Map<string, TypeAgentTranslator>;
    agentCache: AgentCache;
    currentScriptDir: string;
    logger?: Logger | undefined;
    serviceHost: ChildProcess | undefined;
    requestId?: RequestId;
    commandResult?: CommandResult | undefined;
    chatHistory: ChatHistory;
    constructionProvider?: ConstructionProvider | undefined;
    batchMode: boolean;
    streamingActionContext?: ActionContextWithClose | undefined;
    metricsManager?: RequestMetricsManager | undefined;
    commandProfiler?: Profiler | undefined;
    instanceDirLock: (() => Promise<void>) | undefined;
};
export type DispatcherOptions = DeepPartialUndefined<DispatcherConfig> & {
    appAgentProviders?: AppAgentProvider[];
    persistDir?: string | undefined;
    persistSession?: boolean;
    clientId?: string;
    clientIO?: ClientIO | undefined;
    agentInstaller?: AppAgentInstaller;
    agents?: AppAgentStateInitSettings;
    enableServiceHost?: boolean;
    metrics?: boolean;
    dblogging?: boolean;
    constructionProvider?: ConstructionProvider;
    explanationAsynchronousMode?: boolean;
    collectCommandResult?: boolean;
    embeddingCacheDir?: string | undefined;
};
export declare function installAppProvider(context: CommandHandlerContext, provider: AppAgentProvider): Promise<void>;
export declare function initializeCommandHandlerContext(hostName: string, options?: DispatcherOptions): Promise<CommandHandlerContext>;
export declare function closeCommandHandlerContext(context: CommandHandlerContext): Promise<void>;
export declare function setSessionOnCommandHandlerContext(context: CommandHandlerContext, session: Session): Promise<void>;
export declare function reloadSessionOnCommandHandlerContext(context: CommandHandlerContext, persist: boolean): Promise<void>;
export declare function changeContextConfig(options: SessionOptions, context: ActionContext<CommandHandlerContext>): Promise<{
    schemas?: {
        [x: string]: boolean | undefined;
    } | undefined;
    actions?: {
        [x: string]: boolean | undefined;
    } | undefined;
    commands?: {
        [x: string]: boolean | undefined;
    } | undefined;
    request?: string | undefined;
    translation?: {
        enabled?: boolean | undefined;
        model?: string | undefined;
        stream?: boolean | undefined;
        promptConfig?: {
            additionalInstructions?: boolean | undefined;
        } | undefined;
        switch?: {
            embedding?: boolean | undefined;
            inline?: boolean | undefined;
            search?: boolean | undefined;
        } | undefined;
        multiple?: {
            enabled?: boolean | undefined;
            result?: boolean | undefined;
            pending?: boolean | undefined;
        } | undefined;
        history?: {
            enabled?: boolean | undefined;
            limit?: number | undefined;
        } | undefined;
        schema?: {
            generation?: {
                enabled?: boolean | undefined;
                jsonSchema?: boolean | undefined;
                jsonSchemaFunction?: boolean | undefined;
                jsonSchemaWithTs?: boolean | undefined;
                jsonSchemaValidate?: boolean | undefined;
            } | undefined;
            optimize?: {
                enabled?: boolean | undefined;
                numInitialActions?: number | undefined;
            } | undefined;
        } | undefined;
    } | undefined;
    execution?: {
        history?: boolean | undefined;
    } | undefined;
    explainer?: {
        enabled?: boolean | undefined;
        model?: string | undefined;
        name?: string | undefined;
        filter?: {
            multiple?: boolean | undefined;
            reference?: {
                value?: boolean | undefined;
                list?: boolean | undefined;
                translate?: boolean | undefined;
            } | undefined;
        } | undefined;
    } | undefined;
    cache?: {
        mergeMatchSets?: boolean | undefined;
        cacheConflicts?: boolean | undefined;
        enabled?: boolean | undefined;
        autoSave?: boolean | undefined;
        builtInCache?: boolean | undefined;
        matchWildcard?: boolean | undefined;
    } | undefined;
} | undefined>;
//# sourceMappingURL=commandHandlerContext.d.ts.map