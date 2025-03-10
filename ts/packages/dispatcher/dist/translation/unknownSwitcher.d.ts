import { InlineTranslatorSchemaDef } from "common-utils";
import { Result } from "typechat";
import { ActionConfigProvider } from "./actionConfigProvider.js";
type AssistantSelectionSchemaEntry = {
    name: string;
    schema: InlineTranslatorSchemaDef;
};
export declare function getAssistantSelectionSchemas(schemaNames: string[], provider: ActionConfigProvider): AssistantSelectionSchemaEntry[];
export type AssistantSelection = {
    assistant: string;
    action: string;
};
export declare function loadAssistantSelectionJsonTranslator(schemaNames: string[], provider: ActionConfigProvider): {
    translate: (request: string) => Promise<Result<AssistantSelection>>;
};
export {};
//# sourceMappingURL=unknownSwitcher.d.ts.map