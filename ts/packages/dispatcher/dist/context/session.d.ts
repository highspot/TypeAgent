import { DeepPartialUndefined, DeepPartialUndefinedAndNull } from "common-utils";
import { CacheConfig, AgentCache } from "agent-cache";
import ExifReader from "exifreader";
import { AppAgentStateConfig } from "./appAgentManager.js";
import { ConstructionProvider } from "../agentProvider/agentProvider.js";
import { MultipleActionConfig } from "../translation/multipleActionSchema.js";
export declare function getSessionsDirPath(instanceDir: string): string;
export declare function getSessionDirPath(instanceDir: string, dir: string): string;
export declare function getSessionConstructionDirPath(sessionDirPath: string): string;
export type DispatcherConfig = {
    request: string;
    translation: {
        enabled: boolean;
        model: string;
        stream: boolean;
        promptConfig: {
            additionalInstructions: boolean;
        };
        switch: {
            embedding: boolean;
            inline: boolean;
            search: boolean;
        };
        multiple: MultipleActionConfig;
        history: {
            enabled: boolean;
            limit: number;
        };
        schema: {
            generation: {
                enabled: boolean;
                jsonSchema: boolean;
                jsonSchemaFunction: boolean;
                jsonSchemaWithTs: boolean;
                jsonSchemaValidate: boolean;
            };
            optimize: {
                enabled: boolean;
                numInitialActions: number;
            };
        };
    };
    execution: {
        history: boolean;
    };
    explainer: {
        enabled: boolean;
        model: string;
        name: string;
        filter: {
            multiple: boolean;
            reference: {
                value: boolean;
                list: boolean;
                translate: boolean;
            };
        };
    };
    cache: CacheConfig & {
        enabled: boolean;
        autoSave: boolean;
        builtInCache: boolean;
        matchWildcard: boolean;
    };
};
export type SessionConfig = AppAgentStateConfig & DispatcherConfig;
export type SessionSettings = DeepPartialUndefined<SessionConfig>;
export type SessionOptions = DeepPartialUndefinedAndNull<SessionConfig> | null;
export type SessionChanged = DeepPartialUndefined<SessionConfig> | undefined;
export declare function getSessionName(dirPath: string): string;
export declare class Session {
    readonly sessionDirPath?: string | undefined;
    private readonly defaultConfig;
    private readonly settings;
    private config;
    private cacheData;
    static create(settings?: SessionSettings, instanceDir?: string): Promise<Session>;
    static load(instanceDir: string, dir: string): Promise<Session>;
    static restoreLastSession(instanceDir: string): Promise<Session | undefined>;
    private constructor();
    get explainerName(): string;
    get explanation(): boolean;
    get cacheConfig(): CacheConfig;
    getSettings(): Readonly<SessionSettings>;
    updateSettings(options: SessionOptions): SessionChanged;
    getConfig(): Readonly<SessionConfig>;
    updateConfig(settings: SessionSettings): SessionChanged;
    updateDefaultConfig(settings: SessionSettings): SessionChanged;
    getSessionDirPath(): string | undefined;
    getConstructionDataFilePath(): string | undefined;
    setConstructionDataFilePath(filePath: string | undefined, explainerName?: string): void;
    ensureCacheDataFilePath(): Promise<string | undefined>;
    clear(): Promise<void>;
    private newCacheDataFilePath;
    save(): void;
    storeUserSuppliedFile(file: string): Promise<[string, ExifReader.Tags]>;
    getFileExtensionForMimeType(mime: string): string;
}
/**
 * Clear existing cache state and setup the cache again.
 */
export declare function setupAgentCache(session: Session, agentCache: AgentCache, provider?: ConstructionProvider): Promise<void>;
export declare function setupBuiltInCache(session: Session, agentCache: AgentCache, enable: boolean, provider?: ConstructionProvider): Promise<void>;
export declare function deleteSession(instanceDir: string, dir: string): Promise<void>;
export declare function deleteAllSessions(instanceDir: string): Promise<void>;
export declare function getSessionNames(instanceDir: string): Promise<string[]>;
export declare function getSessionConstructionDirPaths(dirPath: string): Promise<{
    explainer: string;
    name: string;
    current: boolean;
}[]>;
//# sourceMappingURL=session.d.ts.map