import { TranslatorSchemaDef } from "common-utils";
import { AppAction } from "@typeagent/agent-sdk";
import { TranslatedAction } from "./agentTranslators.js";
import { ActionSchemaTypeDefinition, ActionSchemaUnion } from "action-schema";
export type PendingRequestEntry = {
    request: string;
    pendingResultEntityId: string;
};
type ActionRequestEntry = {
    request: string;
    action: TranslatedAction;
    resultEntityId?: string;
};
export type RequestEntry = ActionRequestEntry | PendingRequestEntry;
export declare function isPendingRequest(entry: RequestEntry): entry is PendingRequestEntry;
export type MultipleAction = {
    actionName: "multiple";
    parameters: {
        requests: RequestEntry[];
    };
};
export declare function isMultipleAction(action: AppAction): action is MultipleAction;
export type MultipleActionConfig = {
    enabled: boolean;
    result: boolean;
    pending: boolean;
};
export type MultipleActionOptions = MultipleActionConfig | boolean;
export declare function createMultipleActionSchema(types: ActionSchemaUnion, multipleActionOptions: MultipleActionOptions): ActionSchemaTypeDefinition;
export declare function getMultipleActionSchemaDef(types: string[], multipleActionOptions: MultipleActionOptions): TranslatorSchemaDef;
export {};
//# sourceMappingURL=multipleActionSchema.d.ts.map