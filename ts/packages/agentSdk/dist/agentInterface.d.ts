import { AppAction, ActionResult, TypeAgentAction } from "./action.js";
import { AppAgentCommandInterface } from "./command.js";
import { ActionIO, DisplayType, DynamicDisplay } from "./display.js";
import { Profiler } from "./profiler.js";
import { TemplateSchema } from "./templateInput.js";
export type AppAgentManifest = {
    emojiChar: string;
    description: string;
    commandDefaultEnabled?: boolean;
} & ActionManifest;
export type SchemaManifest = {
    description: string;
    schemaType: string;
    schemaFile: string | {
        type: "ts";
        content: string;
    };
    injected?: boolean;
    cached?: boolean;
    streamingActions?: string[];
};
export type ActionManifest = {
    defaultEnabled?: boolean;
    schemaDefaultEnabled?: boolean;
    actionDefaultEnabled?: boolean;
    transient?: boolean;
    schema?: SchemaManifest;
    subActionManifests?: {
        [key: string]: ActionManifest;
    };
};
export interface AppAgent extends Partial<AppAgentCommandInterface> {
    initializeAgentContext?(): Promise<unknown>;
    updateAgentContext?(enable: boolean, context: SessionContext, schemaName: string): Promise<void>;
    closeAgentContext?(context: SessionContext): Promise<void>;
    streamPartialAction?(actionName: string, name: string, value: string, delta: string | undefined, context: ActionContext<unknown>): void;
    executeAction?(action: TypeAgentAction, context: ActionContext<unknown>): Promise<ActionResult | undefined>;
    validateWildcardMatch?(action: AppAction, context: SessionContext): Promise<boolean>;
    getTemplateSchema?(templateName: string, data: unknown, context: SessionContext): Promise<TemplateSchema>;
    getTemplateCompletion?(templateName: string, data: unknown, propertyName: string, context: SessionContext): Promise<string[]>;
    getActionCompletion?(partialAction: AppAction, // action translatorName and actionName are validated by the dispatcher.
    propertyName: string, context: SessionContext): Promise<string[]>;
    getDynamicDisplay?(type: DisplayType, dynamicDisplayId: string, context: SessionContext): Promise<DynamicDisplay>;
}
export declare enum AppAgentEvent {
    Error = "error",
    Warning = "warning",
    Info = "info",
    Debug = "debug"
}
export interface SessionContext<T = unknown> {
    readonly agentContext: T;
    readonly sessionStorage: Storage | undefined;
    readonly instanceStorage: Storage | undefined;
    notify(event: AppAgentEvent, message: string): void;
    toggleTransientAgent(agentName: string, active: boolean): Promise<void>;
    addDynamicAgent(agentName: string, manifest: AppAgentManifest, appAgent: AppAgent): Promise<void>;
    removeDynamicAgent(agentName: string): Promise<void>;
}
export type StorageEncoding = "utf8" | "base64";
export type StorageListOptions = {
    dirs?: boolean;
    fullPath?: boolean;
};
export interface TokenCachePersistence {
    load(): Promise<string | null>;
    save(token: string): Promise<void>;
}
export interface Storage {
    read(storagePath: string, options: StorageEncoding): Promise<string>;
    write(storagePath: string, data: string): Promise<void>;
    list(storagePath: string, options?: StorageListOptions): Promise<string[]>;
    exists(storagePath: string): Promise<boolean>;
    delete(storagePath: string): Promise<void>;
    getTokenCachePersistence(): Promise<TokenCachePersistence>;
}
export interface ActionContext<T = void> {
    profiler?: Profiler | undefined;
    streamingContext: unknown;
    readonly actionIO: ActionIO;
    readonly sessionContext: SessionContext<T>;
}
//# sourceMappingURL=agentInterface.d.ts.map