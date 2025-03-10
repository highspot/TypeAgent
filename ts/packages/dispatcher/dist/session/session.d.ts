import { DeepPartialUndefined } from "common-utils";
import { CacheConfig, AgentCache } from "agent-cache";
import ExifReader from "exifreader";
import {
    AppAgentState,
    AppAgentStateOptions,
} from "../agent/appAgentManager.js";
export declare function getSessionsDirPath(): string;
export declare function getSessionDirPath(dir: string): string;
export declare function getSessionCacheDirPath(dir: string): string;
type DispatcherConfig = {
    translation: {
        enabled: boolean;
        model: string;
        stream: boolean;
        promptConfig: {
            additionalInstructions: boolean;
        };
        switch: {
            inline: boolean;
            search: boolean;
        };
        multipleActions: boolean;
        history: boolean;
        schema: {
            generation: boolean;
            firstUseEmbedding: boolean;
            optimize: {
                enabled: boolean;
                numInitialActions: number;
            };
        };
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
export type SessionConfig = AppAgentState & DispatcherConfig;
export type SessionOptions = AppAgentStateOptions &
    DeepPartialUndefined<DispatcherConfig>;
export declare function getDefaultSessionConfig(): SessionConfig;
export declare class Session {
    readonly dir?: string | undefined;
    private config;
    private cacheData;
    static create(
        config: SessionConfig | undefined,
        persist: boolean,
    ): Promise<Session>;
    static load(dir: string): Promise<Session>;
    static restoreLastSession(): Promise<Session | undefined>;
    private constructor();
    get explainerName(): string;
    get explanation(): boolean;
    get cacheConfig(): CacheConfig;
    getConfig(): Readonly<SessionConfig>;
    setConfig(options: SessionOptions): SessionOptions;
    getSessionDirPath(): string | undefined;
    getCacheDataFilePath(): string | undefined;
    setCacheDataFilePath(
        filePath: string | undefined,
        explainerName?: string,
    ): void;
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
export declare function setupAgentCache(
    session: Session,
    agentCache: AgentCache,
): Promise<void>;
export declare function setupBuiltInCache(
    session: Session,
    agentCache: AgentCache,
    enable: boolean,
): Promise<void>;
export declare function deleteSession(dir: string): Promise<void>;
export declare function deleteAllSessions(): Promise<void>;
export declare function getSessionNames(): Promise<string[]>;
export declare function getSessionCaches(dir: string): Promise<
    {
        explainer: string;
        name: string;
        current: boolean;
    }[]
>;
export {};
//# sourceMappingURL=session.d.ts.map
