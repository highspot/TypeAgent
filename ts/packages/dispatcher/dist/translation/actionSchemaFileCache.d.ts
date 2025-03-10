import { ActionSchemaFile, ActionSchemaTypeDefinition } from "action-schema";
import { ActionConfig } from "./actionConfig.js";
import { ActionConfigProvider } from "./actionConfigProvider.js";
import { AppAction } from "@typeagent/agent-sdk";
import { DeepPartialUndefined } from "common-utils";
import { SchemaInfoProvider } from "agent-cache";
export declare class ActionSchemaFileCache {
    private readonly cacheFilePath?;
    private readonly actionSchemaFiles;
    private readonly prevSaved;
    constructor(cacheFilePath?: string | undefined);
    private getSchemaSource;
    getActionSchemaFile(actionConfig: ActionConfig): ActionSchemaFile;
    unloadActionSchemaFile(schemaName: string): void;
    private addToCache;
    private loadExistingCache;
}
export declare function getActionSchema(action: DeepPartialUndefined<AppAction>, provider: ActionConfigProvider): ActionSchemaTypeDefinition | undefined;
export declare function createSchemaInfoProvider(provider: ActionConfigProvider): SchemaInfoProvider;
//# sourceMappingURL=actionSchemaFileCache.d.ts.map