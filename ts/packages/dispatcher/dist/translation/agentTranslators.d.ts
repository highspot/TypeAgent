import { CachedImageWithDetails } from "common-utils";
import { AppAction } from "@typeagent/agent-sdk";
import { Result } from "typechat";
import { MultipleActionOptions } from "./multipleActionSchema.js";
import { IncrementalJsonValueCallBack } from "common-utils";
import { HistoryContext, ParamObjectType } from "agent-cache";
import { ActionSchemaTypeDefinition, GenerateSchemaOptions } from "action-schema";
import { ActionConfig } from "./actionConfig.js";
import { ActionConfigProvider } from "./actionConfigProvider.js";
import { CompleteUsageStatsCallback } from "aiclient";
export declare function getAppAgentName(schemaName: string): string;
export type AdditionalActionLookupAction = {
    actionName: "additionalActionLookup";
    parameters: {
        schemaName: string;
        request: string;
    };
};
export declare function isAdditionalActionLookupAction(action: AppAction): action is AdditionalActionLookupAction;
export declare function createChangeAssistantActionSchema(actionConfigs: ActionConfig[]): ActionSchemaTypeDefinition;
export type TypeAgentTranslator<T = TranslatedAction> = {
    translate(request: string, history?: HistoryContext, attachments?: CachedImageWithDetails[], cb?: IncrementalJsonValueCallBack, usageCallback?: CompleteUsageStatsCallback): Promise<Result<T>>;
    checkTranslate(request: string): Promise<Result<T>>;
    getSchemaName(actionName: string): string | undefined;
};
export interface TranslatedAction {
    actionName: string;
    parameters?: ParamObjectType;
}
/**
 *
 * @param schemaName name to get the translator for.
 * @param activeSchemas The set of active translators to include for injected and change assistant actions. Default to false if undefined.
 * @param multipleActions Add the multiple action schema if true. Default to false.
 * @returns
 */
export declare function loadAgentJsonTranslator<T extends TranslatedAction = TranslatedAction>(actionConfigs: ActionConfig[], switchActionConfigs: ActionConfig[], provider: ActionConfigProvider, multipleActionOptions: MultipleActionOptions, generated?: boolean, model?: string, generateOptions?: GenerateSchemaOptions): TypeAgentTranslator<T>;
export declare function createTypeAgentTranslatorForSelectedActions<T extends TranslatedAction = TranslatedAction>(definitions: ActionSchemaTypeDefinition[], actionConfig: ActionConfig, additionalActionConfigs: ActionConfig[], switchActionConfigs: ActionConfig[], provider: ActionConfigProvider, multipleActionOptions: MultipleActionOptions, model?: string): TypeAgentTranslator<T>;
export declare function getFullSchemaText(schemaName: string, provider: ActionConfigProvider, activeSchemas: string[] | undefined, changeAgentAction: boolean, multipleActionOptions: MultipleActionOptions, generated: boolean): string;
//# sourceMappingURL=agentTranslators.d.ts.map