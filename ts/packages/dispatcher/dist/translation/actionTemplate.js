// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { getActionSchema } from "./actionSchemaFileCache.js";
import { getAppAgentName } from "./agentTranslators.js";
function getDefaultActionTemplate(schemas, discriminator = "") {
    const schemaNames = {
        type: "string-union",
        typeEnum: schemas,
        discriminator,
    };
    const template = {
        type: "object",
        fields: {
            translatorName: {
                type: schemaNames,
            },
        },
    };
    return template;
}
function toTemplateTypeObject(type) {
    const templateType = {
        type: "object",
        fields: {},
    };
    for (const [key, field] of Object.entries(type.fields)) {
        const type = toTemplateType(field.type);
        if (type === undefined) {
            // Skip undefined fields.
            continue;
        }
        templateType.fields[key] = { optional: field.optional, type };
    }
    return templateType;
}
function toTemplateTypeArray(type) {
    const elementType = toTemplateType(type.elementType);
    if (elementType === undefined) {
        // Skip undefined fields.
        return undefined;
    }
    const templateType = {
        type: "array",
        elementType,
    };
    return templateType;
}
function toTemplateType(type) {
    switch (type.type) {
        case "type-union":
            // TODO: smarter about type unions.
            return toTemplateType(type.types[0]);
        case "type-reference":
            // TODO: need to handle circular references (or error on circular references)
            if (type.definition === undefined) {
                throw new Error(`Unresolved type reference: ${type.name}`);
            }
            return toTemplateType(type.definition.type);
        case "object":
            return toTemplateTypeObject(type);
        case "array":
            return toTemplateTypeArray(type);
        case "undefined":
            return undefined;
        case "string":
        case "number":
        case "boolean":
            return type;
        default:
            throw new Error(`Unknown type ${type.type}`);
    }
}
function toTemplate(context, schemas, action) {
    const actionSchemaFile = context.agents.tryGetActionSchemaFile(action.action.translatorName);
    if (actionSchemaFile === undefined) {
        return getDefaultActionTemplate(schemas);
    }
    const template = getDefaultActionTemplate(schemas, action.action.translatorName);
    const actionSchemas = actionSchemaFile.actionSchemas;
    const actionName = {
        type: "string-union",
        typeEnum: Array.from(actionSchemas.keys()),
        discriminator: "",
    };
    template.fields.actionName = {
        type: actionName,
    };
    const actionSchema = actionSchemas.get(action.action.actionName);
    if (actionSchema === undefined) {
        return template;
    }
    actionName.discriminator = action.action.actionName;
    const parameterType = actionSchema.type.fields.parameters?.type;
    if (parameterType) {
        const type = toTemplateType(parameterType);
        if (type !== undefined) {
            template.fields.parameters = {
                // ActionParam types are compatible with TemplateFields
                type,
            };
        }
    }
    return template;
}
export function getActionTemplateEditConfig(context, actions, preface, editPreface) {
    const templateData = [];
    const schemas = context.agents.getActiveSchemas();
    for (const action of actions) {
        templateData.push({
            schema: toTemplate(context, schemas, action),
            data: action.action,
        });
    }
    return {
        templateAgentName: "system",
        templateName: "action",
        preface,
        editPreface,
        templateData,
        completion: true,
        defaultTemplate: getDefaultActionTemplate(schemas),
    };
}
export async function getSystemTemplateSchema(templateName, data, context) {
    if (templateName !== "action") {
        throw new Error(`Unknown template name: ${templateName}`);
    }
    const systemContext = context.agentContext;
    // check user input to make sure it is an action
    if (typeof data.translatorName !== "string") {
        data.translatorName = "";
    }
    if (typeof data.actionName !== "string") {
        data.actionName = "";
    }
    const schemas = systemContext.agents.getActiveSchemas();
    return toTemplate(systemContext, schemas, data);
}
export async function getSystemTemplateCompletion(templateName, data, propertyName, context) {
    if (templateName !== "action") {
        throw new Error(`Unknown template name: ${templateName}`);
    }
    if (!Array.isArray(data)) {
        return [];
    }
    const split = propertyName.split(".");
    const actionIndexStr = split.shift();
    if (actionIndexStr === undefined || split.length === 0) {
        // Not a valid property.
        return [];
    }
    const actionIndex = parseInt(actionIndexStr);
    if (actionIndex.toString() !== actionIndexStr) {
        // Not a valid number for action Index
        return [];
    }
    // TemplateData has the actual action in in the 'data' property
    const dataProperty = split.shift();
    if (dataProperty !== "data" || split.length === 0) {
        return [];
    }
    const action = data[actionIndex];
    const systemContext = context.agentContext;
    return getActionCompletion(systemContext, action, split.join("."));
}
export async function getActionCompletion(systemContext, action, propertyName) {
    const actionSchema = getActionSchema(action, systemContext.agents);
    if (actionSchema === undefined) {
        return [];
    }
    const appAgentName = getAppAgentName(action.translatorName);
    const appAgent = systemContext.agents.getAppAgent(appAgentName);
    if (appAgent.getActionCompletion === undefined) {
        return [];
    }
    const sessionContext = systemContext.agents.getSessionContext(appAgentName);
    return appAgent.getActionCompletion(action, propertyName, sessionContext);
}
//# sourceMappingURL=actionTemplate.js.map