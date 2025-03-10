// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { createJsonTranslatorWithValidator, enableJsonTranslatorStreaming, } from "common-utils";
import { getPackageFilePath } from "../utils/getPackageFilePath.js";
import { getMultipleActionSchemaDef, } from "./multipleActionSchema.js";
import { composeTranslatorSchemas, } from "common-utils";
import { createTypeAgentRequestPrompt } from "../context/chatHistoryPrompt.js";
import { composeActionSchema, composeSelectedActionSchema, createActionSchemaJsonValidator, } from "./actionSchemaJsonTranslator.js";
import { generateActionSchema, generateSchemaTypeDefinition, ActionSchemaCreator as sc, } from "action-schema";
import { createTypeScriptJsonValidator } from "typechat/ts";
export function getAppAgentName(schemaName) {
    return schemaName.split(".")[0];
}
const additionalActionLookupTypeName = "AdditionalActionLookupAction";
const additionalActionLookup = "additionalActionLookup";
export function isAdditionalActionLookupAction(action) {
    return action.actionName === additionalActionLookup;
}
const additionalActionLookupTypeComments = [
    ` Use this ${additionalActionLookupTypeName} to look up additional actions in schema groups`,
    " The schema group will be chosen based on the schemaName parameter",
];
export function createChangeAssistantActionSchema(actionConfigs) {
    const schemaNameParameterComments = actionConfigs.map((actionConfig) => ` ${actionConfig.schemaName} - ${actionConfig.description}`);
    const obj = sc.obj({
        actionName: sc.string(additionalActionLookup),
        parameters: sc.obj({
            schemaName: sc.field(sc.string(actionConfigs.map((actionConfig) => actionConfig.schemaName)), schemaNameParameterComments),
            request: sc.string(),
        }),
    });
    return sc.intf(additionalActionLookupTypeName, obj, additionalActionLookupTypeComments, true);
}
function getChangeAssistantSchemaDef(switchActionConfigs) {
    if (switchActionConfigs.length === 0) {
        return undefined;
    }
    const definition = createChangeAssistantActionSchema(switchActionConfigs);
    if (definition === undefined) {
        return undefined;
    }
    return {
        kind: "inline",
        typeName: additionalActionLookupTypeName,
        schema: generateSchemaTypeDefinition(definition, { exact: true }),
    };
}
function getTranslatorSchemaDef(actionConfig) {
    if (typeof actionConfig.schemaFile === "string") {
        return {
            kind: "file",
            typeName: actionConfig.schemaType,
            fileName: getPackageFilePath(actionConfig.schemaFile),
        };
    }
    if (actionConfig.schemaFile.type === "ts") {
        return {
            kind: "inline",
            typeName: actionConfig.schemaType,
            schema: actionConfig.schemaFile.content,
        };
    }
    throw new Error(`Unsupported schema source type: ${actionConfig.schemaFile.type}"`);
}
function getTranslatorSchemaDefs(actionConfigs, switchActionConfigs, multipleActionOptions) {
    const translationSchemaDefs = actionConfigs.map(getTranslatorSchemaDef);
    // subAction for multiple action
    const subActionType = actionConfigs.map((s) => s.schemaType);
    // Add change assistant schema if needed
    const changeAssistantSchemaDef = getChangeAssistantSchemaDef(switchActionConfigs);
    if (changeAssistantSchemaDef) {
        translationSchemaDefs.push(changeAssistantSchemaDef);
        subActionType.push(changeAssistantSchemaDef.typeName);
    }
    // Add multiple action schema
    const multipleActionSchemaDef = multipleActionOptions
        ? getMultipleActionSchemaDef(subActionType, multipleActionOptions)
        : undefined;
    if (multipleActionSchemaDef) {
        translationSchemaDefs.push(multipleActionSchemaDef);
    }
    return translationSchemaDefs;
}
function createTypeAgentValidator(actionConfigs, switchActionConfigs, provider, multipleActionOptions, generated = true, generateOptions) {
    return generated
        ? createActionSchemaJsonValidator(composeActionSchema(actionConfigs, switchActionConfigs, provider, multipleActionOptions), generateOptions)
        : createTypeScriptJsonValidator(composeTranslatorSchemas("AllActions", getTranslatorSchemaDefs(actionConfigs, switchActionConfigs, multipleActionOptions)), "AllActions");
}
function collectSchemaName(actionConfigs, provider, definitions, actionConfig) {
    const schemaNameMap = new Map();
    for (const actionConfig of actionConfigs) {
        const schemaFile = provider.getActionSchemaFileForConfig(actionConfig);
        for (const actionName of schemaFile.actionSchemas.keys()) {
            const existing = schemaNameMap.get(actionName);
            if (existing) {
                throw new Error(`Conflicting action name '${actionName}' from schema '${schemaFile.schemaName}' and '${existing}'`);
            }
            schemaNameMap.set(actionName, actionConfig.schemaName);
        }
    }
    if (definitions !== undefined && actionConfig !== undefined) {
        for (const definition of definitions) {
            const actionName = definition.type.fields.actionName.type.typeEnum[0];
            const existing = schemaNameMap.get(actionName);
            if (existing) {
                throw new Error(`Conflicting action name '${actionName}' from schema '${actionConfig.schemaName}' and '${existing}'`);
            }
            schemaNameMap.set(actionName, actionConfig.schemaName);
        }
    }
    return schemaNameMap;
}
/**
 *
 * @param schemaName name to get the translator for.
 * @param activeSchemas The set of active translators to include for injected and change assistant actions. Default to false if undefined.
 * @param multipleActions Add the multiple action schema if true. Default to false.
 * @returns
 */
export function loadAgentJsonTranslator(actionConfigs, switchActionConfigs, provider, multipleActionOptions, generated = true, model, generateOptions) {
    const validator = createTypeAgentValidator(actionConfigs, switchActionConfigs, provider, multipleActionOptions, generated, generateOptions);
    // Collect schema name mapping.
    const schemaNameMap = collectSchemaName(actionConfigs, provider);
    return createTypeAgentTranslator(validator, schemaNameMap, { model });
}
function createTypeAgentTranslator(validator, schemaNameMap, options) {
    const translator = createJsonTranslatorWithValidator(validator.getTypeName().toLowerCase(), validator, options);
    const streamingTranslator = enableJsonTranslatorStreaming(translator);
    // the request prompt is already expanded by the override replacement below
    // So just return the request as is.
    streamingTranslator.createRequestPrompt = (request) => {
        return request;
    };
    // Create another translator so that we can have a different
    // debug/token count tag
    const altTranslator = createJsonTranslatorWithValidator("check", translator.validator, options);
    altTranslator.createRequestPrompt = (request) => {
        return request;
    };
    const typeAgentTranslator = {
        translate: async (request, history, attachments, cb, usageCallback) => {
            // Expand the request prompt up front with the history and attachments
            const requestPrompt = createTypeAgentRequestPrompt(streamingTranslator, request, history, attachments);
            return streamingTranslator.translate(requestPrompt, history?.promptSections, attachments, cb, usageCallback);
        },
        // No streaming, no history, no attachments.
        checkTranslate: async (request) => {
            const requestPrompt = createTypeAgentRequestPrompt(altTranslator, request, undefined, undefined, false);
            return altTranslator.translate(requestPrompt);
        },
        getSchemaName(actionName) {
            return schemaNameMap.get(actionName);
        },
    };
    return typeAgentTranslator;
}
export function createTypeAgentTranslatorForSelectedActions(definitions, actionConfig, additionalActionConfigs, switchActionConfigs, provider, multipleActionOptions, model) {
    const validator = createActionSchemaJsonValidator(composeSelectedActionSchema(definitions, actionConfig, additionalActionConfigs, switchActionConfigs, provider, multipleActionOptions));
    const schemaNameMap = collectSchemaName(additionalActionConfigs, provider, definitions, actionConfig);
    return createTypeAgentTranslator(validator, schemaNameMap, { model });
}
// For CLI, replicate the behavior of loadAgentJsonTranslator to get the schema
export function getFullSchemaText(schemaName, provider, activeSchemas = [], changeAgentAction, multipleActionOptions, generated) {
    const actionConfigs = [
        provider.getActionConfig(schemaName),
    ];
    const switchActionConfigs = [];
    for (const actionConfig of provider.getActionConfigs()) {
        if (schemaName === actionConfig.schemaName ||
            !activeSchemas.includes(actionConfig.schemaName)) {
            continue;
        }
        if (actionConfig.injected) {
            actionConfigs.push(actionConfig);
        }
        else if (changeAgentAction) {
            switchActionConfigs.push(actionConfig);
        }
    }
    if (generated) {
        return generateActionSchema(composeActionSchema(actionConfigs, switchActionConfigs, provider, multipleActionOptions), { exact: true });
    }
    const schemaDefs = getTranslatorSchemaDefs(actionConfigs, switchActionConfigs, multipleActionOptions);
    return composeTranslatorSchemas("AllActions", schemaDefs);
}
//# sourceMappingURL=agentTranslators.js.map