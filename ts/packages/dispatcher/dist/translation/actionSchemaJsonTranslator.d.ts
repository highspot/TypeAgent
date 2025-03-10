import { ActionSchemaTypeDefinition, ActionSchemaGroup, GenerateSchemaOptions } from "action-schema";
import { JsonTranslatorOptions, TypeAgentJsonValidator } from "common-utils";
import { TranslatedAction } from "./agentTranslators.js";
import { MultipleActionOptions } from "./multipleActionSchema.js";
import { ActionConfig } from "./actionConfig.js";
import { ActionConfigProvider } from "./actionConfigProvider.js";
export declare function createActionSchemaJsonValidator<T extends TranslatedAction>(actionSchemaGroup: ActionSchemaGroup, generateOptions?: GenerateSchemaOptions): TypeAgentJsonValidator<T>;
export declare function createJsonTranslatorFromActionSchema<T extends TranslatedAction>(typeName: string, actionSchemaGroup: ActionSchemaGroup, options?: JsonTranslatorOptions<T>, generateOptions?: GenerateSchemaOptions): import("typechat").TypeChatJsonTranslator<T>;
export declare function composeActionSchema(actionConfigs: ActionConfig[], switchActionConfigs: ActionConfig[], provider: ActionConfigProvider, multipleActionOptions: MultipleActionOptions): ActionSchemaGroup;
export declare function composeSelectedActionSchema(definitions: ActionSchemaTypeDefinition[], actionConfig: ActionConfig, additionalActionConfigs: ActionConfig[], switchActionConfigs: ActionConfig[], provider: ActionConfigProvider, multipleActionOptions: MultipleActionOptions): ActionSchemaGroup;
//# sourceMappingURL=actionSchemaJsonTranslator.d.ts.map