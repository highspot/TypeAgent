// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { createJsonTranslatorFromSchemaDef, } from "common-utils";
import { success } from "typechat";
import registerDebug from "debug";
import { generateSchemaTypeDefinition, ActionSchemaCreator as sc, } from "action-schema";
const debugSwitchSearch = registerDebug("typeagent:switch:search");
function createSelectionActionTypeDefinition(schemaName, provider) {
    const actionConfig = provider.getActionConfig(schemaName);
    // Skip injected schemas except for chat; investigate whether we can get chat always on first pass
    if (actionConfig.injected && schemaName !== "chat") {
        // No need to select for injected schemas
        return undefined;
    }
    const actionSchemaFile = provider.getActionSchemaFileForConfig(actionConfig);
    const actionNames = [];
    const actionComments = [];
    for (const [name, info] of actionSchemaFile.actionSchemas.entries()) {
        actionNames.push(name);
        actionComments.push(` "${name}"${info.comments ? ` - ${info.comments[0].trim()}` : ""}`);
    }
    if (actionNames.length === 0) {
        return undefined;
    }
    const typeName = `${actionConfig.schemaType}Assistant`;
    const schema = sc.type(typeName, sc.obj({
        assistant: sc.field(sc.string(schemaName), ` ${actionConfig.description}`),
        action: sc.field(sc.string(actionNames), actionComments),
    }));
    return schema;
}
function createSelectionSchema(translatorName, provider) {
    const schema = createSelectionActionTypeDefinition(translatorName, provider);
    if (schema === undefined) {
        return undefined;
    }
    const typeName = schema.name;
    return {
        kind: "inline",
        typeName,
        schema: generateSchemaTypeDefinition(schema),
    };
}
const selectSchemaCache = new Map();
function getSelectionSchema(translatorName, provider) {
    if (selectSchemaCache.has(translatorName)) {
        return selectSchemaCache.get(translatorName);
    }
    const result = createSelectionSchema(translatorName, provider);
    selectSchemaCache.set(translatorName, result);
    return result;
}
const unknownAssistantSelectionSchemaDef = {
    kind: "inline",
    typeName: "UnknownAssistantSelection",
    schema: `
export type UnknownAssistantSelection = {
    assistant: "unknown";
    action: "unknown";
};`,
};
export function getAssistantSelectionSchemas(schemaNames, provider) {
    return schemaNames
        .map((name) => {
        return { name, schema: getSelectionSchema(name, provider) };
    })
        .filter((entry) => entry.schema !== undefined);
}
// GPT-4 has 8192 token window, with an estimated 4 chars per token, so use only 3 times to leave room for output.
const assistantSelectionLimit = 8192 * 3;
export function loadAssistantSelectionJsonTranslator(schemaNames, provider) {
    const schemas = getAssistantSelectionSchemas(schemaNames, provider);
    let currentLength = 0;
    let current = [];
    const limit = assistantSelectionLimit; // TODO: this should be adjusted based on model used.
    const partitions = [current];
    for (const entry of schemas) {
        const schema = entry.schema.schema;
        if (currentLength + schema.length > limit) {
            if (current.length === 0) {
                throw new Error(`The assistant section schema for '${entry.name}' is too large to fit in the limit ${limit}`);
            }
            current = [];
            currentLength = 0;
            partitions.push(current);
        }
        current.push(entry);
        currentLength += schema.length;
    }
    const translators = partitions.map((entries) => {
        return {
            names: entries.map((entry) => entry.name),
            translator: createJsonTranslatorFromSchemaDef("AllAssistantSelection", entries
                .map((entry) => entry.schema)
                .concat(unknownAssistantSelectionSchemaDef), {
                instructions: [
                    {
                        role: "system",
                        content: "Select the assistant to handle the request",
                    },
                ],
            }),
        };
    });
    return {
        translate: async (request) => {
            for (const { names, translator } of translators) {
                // TODO: we can parallelize this
                debugSwitchSearch(`Switch: searching ${names.join(", ")}`);
                const result = await translator.translate(request);
                if (!result.success) {
                    return result;
                }
                if (result.data.assistant !== "unknown") {
                    return result;
                }
            }
            return success({
                assistant: "unknown",
                action: "unknown",
            });
        },
    };
}
//# sourceMappingURL=unknownSwitcher.js.map