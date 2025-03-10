// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { error, success } from "typechat";
import { generateActionSchema, validateAction, ActionSchemaCreator as sc, generateActionJsonSchema, generateActionActionFunctionJsonSchemas, } from "action-schema";
import { createJsonTranslatorWithValidator, } from "common-utils";
import { createChangeAssistantActionSchema, } from "./agentTranslators.js";
import { createMultipleActionSchema, } from "./multipleActionSchema.js";
function convertJsonSchemaOutput(jsonObject, jsonSchema) {
    if (Array.isArray(jsonSchema)) {
        const result = jsonObject;
        return {
            actionName: result.name,
            parameters: result.arguments,
        };
    }
    return jsonObject.response;
}
export function createActionSchemaJsonValidator(actionSchemaGroup, generateOptions) {
    const schema = generateActionSchema(actionSchemaGroup, generateOptions);
    const generateJsonSchema = generateOptions?.jsonSchema ?? false;
    const jsonSchemaFunction = generateOptions?.jsonSchemaFunction ?? false;
    const jsonSchema = jsonSchemaFunction
        ? generateActionActionFunctionJsonSchemas(actionSchemaGroup)
        : generateJsonSchema
            ? generateActionJsonSchema(actionSchemaGroup)
            : undefined;
    const jsonSchemaValidate = generateOptions?.jsonSchemaValidate ?? false;
    return {
        getSchemaText: () => schema,
        getTypeName: () => actionSchemaGroup.entry.name,
        getJsonSchema: () => jsonSchema,
        validate(jsonObject) {
            try {
                // Fix up the output when we are using jsonSchema.
                const value = jsonSchema !== undefined
                    ? convertJsonSchemaOutput(jsonObject, jsonSchema)
                    : jsonObject;
                if (value.actionName === undefined) {
                    return error("Missing actionName property");
                }
                const actionSchema = actionSchemaGroup.actionSchemas.get(value.actionName);
                if (actionSchema === undefined) {
                    return error(`Unknown action name: ${value.actionName}`);
                }
                if (jsonSchemaValidate) {
                    validateAction(actionSchema, value);
                }
                // Return the unwrapped value with generateJsonSchema as the translated result
                return success(value);
            }
            catch (e) {
                return error(e.message);
            }
        },
    };
}
export function createJsonTranslatorFromActionSchema(typeName, actionSchemaGroup, options, generateOptions) {
    const validator = createActionSchemaJsonValidator(actionSchemaGroup, generateOptions);
    return createJsonTranslatorWithValidator(typeName.toLowerCase(), validator, options);
}
class ActionSchemaBuilder {
    constructor(provider) {
        this.provider = provider;
        this.files = [];
        this.definitions = [];
    }
    addActionConfig(...configs) {
        for (const config of configs) {
            const actionSchemaFile = this.provider.getActionSchemaFileForConfig(config);
            this.files.push(actionSchemaFile);
            this.definitions.push(actionSchemaFile.entry);
        }
    }
    addTypeDefinition(definition) {
        this.definitions.push(definition);
    }
    getTypeUnion() {
        return sc.union(this.definitions.map((definition) => sc.ref(definition)));
    }
    build(typeName = "AllActions") {
        const entry = sc.type(typeName, this.getTypeUnion(), undefined, true);
        const order = new Map();
        for (const file of this.files) {
            if (file.order) {
                const base = order.size;
                for (const [name, num] of file.order) {
                    if (order.has(name)) {
                        throw new Error(`Schema Builder Error: duplicate type definition '${name}'`);
                    }
                    order.set(name, base + num);
                }
            }
        }
        const actionSchemas = new Map();
        const pending = [...this.definitions];
        while (pending.length > 0) {
            const current = pending.shift();
            const currentType = current.type;
            switch (currentType.type) {
                case "type-union":
                    for (const t of currentType.types) {
                        if (t.definition === undefined) {
                            throw new Error(`Schema Builder Error: unresolved type reference '${t.name}' in entry type union`);
                        }
                        pending.push(t.definition);
                    }
                    break;
                case "type-reference":
                    if (currentType.definition === undefined) {
                        throw new Error(`Schema Builder Error: unresolved type reference '${currentType.name}' in entry type union`);
                    }
                    pending.push(currentType.definition);
                    break;
                case "object":
                    const actionName = currentType.fields.actionName.type.typeEnum[0];
                    if (actionSchemas.get(actionName)) {
                        throw new Error(`Schema Builder Error: duplicate action name '${actionName}'`);
                    }
                    actionSchemas.set(actionName, current);
                    break;
                default:
                    // Should not reach here.
                    throw new Error("Invalid type");
            }
        }
        return { entry, actionSchemas, order };
    }
}
export function composeActionSchema(actionConfigs, switchActionConfigs, provider, multipleActionOptions) {
    const builder = new ActionSchemaBuilder(provider);
    builder.addActionConfig(...actionConfigs);
    return finalizeActionSchemaBuilder(builder, switchActionConfigs, multipleActionOptions);
}
export function composeSelectedActionSchema(definitions, actionConfig, additionalActionConfigs, switchActionConfigs, provider, multipleActionOptions) {
    const builder = new ActionSchemaBuilder(provider);
    const union = sc.union(definitions.map((definition) => sc.ref(definition)));
    const typeName = `Partial${actionConfig.schemaType}`;
    const comments = `${typeName} is a partial list of actions available in schema group '${actionConfig.schemaName}'.`;
    const entry = sc.type(typeName, union, comments);
    builder.addTypeDefinition(entry);
    builder.addActionConfig(...additionalActionConfigs);
    return finalizeActionSchemaBuilder(builder, switchActionConfigs, multipleActionOptions);
}
function finalizeActionSchemaBuilder(builder, switchActionConfigs, multipleActionOptions) {
    if (switchActionConfigs.length > 0) {
        builder.addTypeDefinition(createChangeAssistantActionSchema(switchActionConfigs));
    }
    if (multipleActionOptions === true ||
        (multipleActionOptions !== false &&
            multipleActionOptions.enabled === true)) {
        builder.addTypeDefinition(createMultipleActionSchema(builder.getTypeUnion(), multipleActionOptions));
    }
    return builder.build();
}
//# sourceMappingURL=actionSchemaJsonTranslator.js.map