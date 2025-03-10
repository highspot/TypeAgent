// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { generateSchemaTypeDefinition, } from "action-schema";
import { ActionSchemaCreator as sc } from "action-schema";
// Multiple Action is what is used and returned from the LLM
const multipleActionName = "multiple";
const multipleActionType = "MultipleAction";
export function isPendingRequest(entry) {
    return "pendingResultEntityId" in entry;
}
export function isMultipleAction(action) {
    return action.actionName === multipleActionName;
}
export function createMultipleActionSchema(types, multipleActionOptions) {
    const result = typeof multipleActionOptions === "object"
        ? multipleActionOptions.result
        : true;
    const pending = result &&
        (typeof multipleActionOptions === "object"
            ? multipleActionOptions.pending
            : true);
    const actionRequestEntryFields = {
        request: sc.string(),
        action: types,
    };
    if (result) {
        actionRequestEntryFields.resultEntityId = sc.optional(sc.string(), "if the action has a result, the result entity id can be used in future action parameters");
    }
    const actionRequestEntryType = sc.obj(actionRequestEntryFields);
    let requestEntryType = pending
        ? sc.union(actionRequestEntryType, sc.obj({
            request: sc.string(),
            pendingResultEntityId: sc.field(sc.string(), "The request references result of previous action, but the content of the result will be needed to generate an action for the request."),
        }))
        : actionRequestEntryType;
    const schema = sc.type(multipleActionType, sc.obj({
        actionName: sc.string(multipleActionName),
        parameters: sc.obj({
            requests: sc.array(requestEntryType),
        }),
    }), undefined, true);
    return schema;
}
export function getMultipleActionSchemaDef(types, multipleActionOptions) {
    const union = sc.union(types.map((type) => sc.ref(type)));
    const multipleActionSchema = createMultipleActionSchema(union, multipleActionOptions);
    return {
        kind: "inline",
        typeName: multipleActionType,
        schema: generateSchemaTypeDefinition(multipleActionSchema, {
            strict: false, // have unresolved references.
            exact: true,
        }),
    };
}
//# sourceMappingURL=multipleActionSchema.js.map