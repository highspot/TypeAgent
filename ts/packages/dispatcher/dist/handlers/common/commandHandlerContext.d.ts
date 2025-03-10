/// <reference types="node" resolution-mode="require"/>
import { ChildProcess } from "child_process";
import { Limiter } from "common-utils";
import { Logger } from "telemetry";
import {
    AgentCache,
    GenericExplanationResult,
    RequestAction,
} from "agent-cache";
import { Session, SessionOptions } from "../../session/session.js";
import { TypeAgentTranslator } from "../../translation/agentTranslators.js";
import { ClientIO, RequestId } from "./interactiveIO.js";
import { ChatHistory } from "./chatHistory.js";
import { ActionContext } from "@typeagent/agent-sdk";
import { Profiler } from "telemetry";
import { conversation as Conversation } from "knowledge-processor";
import { AppAgentManager } from "../../agent/appAgentManager.js";
import { AppAgentProvider } from "../../agent/agentProvider.js";
import { RequestMetricsManager } from "../../utils/metrics.js";
export interface CommandResult {
    error?: boolean;
    message?: string;
    html?: boolean;
}
export type EmptyFunction = () => void;
export type SetSettingFunction = (name: string, value: any) => void;
export interface ClientSettingsProvider {
    set: SetSettingFunction | null;
}
type ActionContextWithClose = {
    actionContext: ActionContext<unknown>;
    closeActionContext: () => void;
};
export type CommandHandlerContext = {
    agents: AppAgentManager;
    session: Session;
    conversationManager?: Conversation.ConversationManager | undefined;
    developerMode?: boolean;
    explanationAsynchronousMode: boolean;
    dblogging: boolean;
    clientIO: ClientIO;
    commandLock: Limiter;
    lastActionSchemaName: string;
    translatorCache: Map<string, TypeAgentTranslator>;
    agentCache: AgentCache;
    currentScriptDir: string;
    logger?: Logger | undefined;
    serviceHost: ChildProcess | undefined;
    requestId?: RequestId;
    chatHistory: ChatHistory;
    batchMode: boolean;
    lastRequestAction?: RequestAction;
    lastExplanation?: object;
    streamingActionContext?: ActionContextWithClose | undefined;
    metricsManager?: RequestMetricsManager | undefined;
    commandProfiler?: Profiler | undefined;
};
export declare function updateCorrectionContext(
    context: CommandHandlerContext,
    requestAction: RequestAction,
    explanationResult: GenericExplanationResult,
): void;
export declare function getTranslatorForSchema(
    context: CommandHandlerContext,
    translatorName: string,
): TypeAgentTranslator;
export declare function getTranslatorForSelectedActions(
    context: CommandHandlerContext,
    schemaName: string,
    request: string,
    numActions: number,
): Promise<TypeAgentTranslator | undefined>;
export type InitializeCommandHandlerContextOptions = SessionOptions & {
    appAgentProviders?: AppAgentProvider[];
    explanationAsynchronousMode?: boolean;
    persistSession?: boolean;
    clientIO?: ClientIO | undefined;
    enableServiceHost?: boolean;
    metrics?: boolean;
};
export declare function initializeCommandHandlerContext(
    hostName: string,
    options?: InitializeCommandHandlerContextOptions,
): Promise<CommandHandlerContext>;
export declare function closeCommandHandlerContext(
    context: CommandHandlerContext,
): Promise<void>;
export declare function setSessionOnCommandHandlerContext(
    context: CommandHandlerContext,
    session: Session,
): Promise<void>;
export declare function reloadSessionOnCommandHandlerContext(
    context: CommandHandlerContext,
    persist: boolean,
): Promise<void>;
export declare function changeContextConfig(
    options: SessionOptions,
    context: ActionContext<CommandHandlerContext>,
): Promise<SessionOptions>;
export {};
//# sourceMappingURL=commandHandlerContext.d.ts.map
