// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import fs from "node:fs";
import { createJsonTranslator, success, } from "typechat";
import { createTypeScriptJsonValidator } from "typechat/ts";
import registerDebug from "debug";
import { openai as ai, } from "aiclient";
import { createIncrementalJsonParser, } from "./incrementalJsonParser.js";
import { addImagePromptContent } from "./image.js";
export function composeTranslatorSchemas(typeName, schemaDefs) {
    const schemas = schemaDefs.map((schemaDef) => {
        if (schemaDef.kind === "file") {
            return readSchemaFile(schemaDef.fileName);
        }
        return schemaDef.schema;
    });
    const types = schemaDefs.map((schemaDef) => schemaDef.typeName);
    return `export type ${typeName} = ${types.join(" | ")};\n${schemas.join("\n")}`;
}
function addModelParamSection(promptPreamble, cb, usageCallback) {
    if (cb === undefined && usageCallback === undefined) {
        return promptPreamble;
    }
    const prompts = typeof promptPreamble === "string"
        ? [{ role: "user", content: promptPreamble }]
        : promptPreamble
            ? [...promptPreamble] // Make a copy so that we don't modify the original array
            : [];
    const parser = cb
        ? createIncrementalJsonParser(cb, {
            partial: true,
        })
        : undefined;
    prompts.unshift({
        role: "model",
        content: {
            parser,
            usageCallback,
        },
    });
    return prompts;
}
function getModelParams(prompt) {
    if (typeof prompt === "string") {
        return undefined;
    }
    const internalIndex = prompt.findIndex((p) => p.role === "model");
    if (internalIndex === -1) {
        return undefined;
    }
    // Make a copy so that we don't modify the original array;
    const newPrompt = [...prompt];
    const internal = newPrompt.splice(internalIndex, 1);
    return {
        parser: internal[0].content.parser,
        usageCallback: internal[0].content.usageCallback,
        actualPrompt: newPrompt,
    };
}
export function enableJsonTranslatorStreaming(translator) {
    const model = translator.model;
    if (!ai.supportsStreaming(model)) {
        throw new Error("Model does not support streaming");
    }
    const originalComplete = model.complete.bind(model);
    model.complete = async (prompt) => {
        const modelParams = getModelParams(prompt);
        if (modelParams === undefined) {
            return originalComplete(prompt);
        }
        const { parser, usageCallback, actualPrompt } = modelParams;
        if (parser === undefined) {
            return originalComplete(actualPrompt, usageCallback);
        }
        const chunks = [];
        const result = await model.completeStream(actualPrompt, usageCallback);
        if (!result.success) {
            return result;
        }
        for await (const chunk of result.data) {
            chunks.push(chunk);
            parser.parse(chunk);
        }
        parser.complete();
        return success(chunks.join(""));
    };
    const originalTranslate = translator.translate.bind(translator);
    const translatorWithStreaming = translator;
    translatorWithStreaming.translate = async (request, promptPreamble, attachments, cb, usageCallback) => {
        await attachAttachments(attachments, promptPreamble);
        return originalTranslate(request, addModelParamSection(promptPreamble, cb, usageCallback));
    };
    return translatorWithStreaming;
}
async function attachAttachments(attachments, promptPreamble) {
    let pp = promptPreamble;
    if (attachments && attachments.length > 0 && pp) {
        for (let i = 0; i < attachments.length; i++) {
            pp.unshift((await addImagePromptContent("user", attachments[i], true, true, false, true, true)).promptSection);
        }
    }
}
/**
 *
 * @param schemas pass either a single schema text OR schema definitions to compose.
 * @param typeName a single type name to be translated to.
 * @param constraintsValidator optionally validate constraints on response
 * @param instructions Optional additional instructions
 * @param model optional, custom model impl.
 * @returns
 */
export function createJsonTranslatorFromSchemaDef(typeName, schemas, options) {
    const schema = Array.isArray(schemas)
        ? composeTranslatorSchemas(typeName, schemas)
        : schemas;
    const validator = createTypeScriptJsonValidator(schema, typeName);
    return createJsonTranslatorWithValidator(typeName.toLowerCase(), validator, options);
}
export function createJsonTranslatorWithValidator(name, validator, options) {
    const model = ai.createChatModel(options?.model, {
        response_format: { type: "json_object" },
    }, undefined, ["translate", name]);
    const debugPrompt = registerDebug(`typeagent:translate:${name}:prompt`);
    const debugJsonSchema = registerDebug(`typeagent:translate:${name}:jsonschema`);
    const debugResult = registerDebug(`typeagent:translate:${name}:result`);
    const originalComplete = model.complete.bind(model);
    model.complete = async (prompt, usageCallback) => {
        debugPrompt(prompt);
        const jsonSchema = validator.getJsonSchema?.();
        if (jsonSchema !== undefined) {
            debugJsonSchema(jsonSchema);
        }
        return originalComplete(prompt, usageCallback, jsonSchema);
    };
    if (ai.supportsStreaming(model)) {
        const originalCompleteStream = model.completeStream.bind(model);
        model.completeStream = async (prompt, usageCallback) => {
            debugPrompt(prompt);
            const jsonSchema = validator.getJsonSchema?.();
            if (jsonSchema !== undefined) {
                debugJsonSchema(jsonSchema);
            }
            return originalCompleteStream(prompt, usageCallback, jsonSchema);
        };
    }
    const translator = createJsonTranslator(model, validator);
    translator.stripNulls = true;
    const constraintsValidator = options?.constraintsValidator;
    if (constraintsValidator) {
        translator.validateInstance = constraintsValidator.validateConstraints;
    }
    // Patch up the property for json schema for stream.
    // Non-streaming result is patched during validation.
    function patchStreamCallback(prompt) {
        if (prompt === undefined) {
            return;
        }
        const jsonSchema = validator.getJsonSchema?.();
        if (jsonSchema === undefined) {
            return;
        }
        const parser = getModelParams(prompt)?.parser;
        if (parser === undefined) {
            return;
        }
        const callback = parser.callback;
        parser.callback = Array.isArray(jsonSchema)
            ? (prop, value, delta) => {
                let actualPropName = "actionName";
                if (prop !== "name") {
                    const prefix = "arguments.";
                    if (!prop.startsWith(prefix)) {
                        throw new Error(`Invalid property name: ${prop}`);
                    }
                    actualPropName = `parameters.${prop.slice(prefix.length)}`;
                }
                callback(actualPropName, value, delta);
            }
            : (prop, value, delta) => {
                const prefix = "response.";
                if (!prop.startsWith(prefix)) {
                    throw new Error(`Invalid property name: ${prop}`);
                }
                const actualPropName = prop.slice(prefix.length);
                callback(actualPropName, value, delta);
            };
    }
    const innerFn = translator.translate;
    const instructions = options?.instructions;
    if (!instructions) {
        translator.translate = async (request, promptPreamble) => {
            patchStreamCallback(promptPreamble);
            const result = await innerFn(request, promptPreamble);
            debugResult(result);
            return result;
        };
        return translator;
    }
    translator.translate = async (request, promptPreamble) => {
        patchStreamCallback(promptPreamble);
        const result = await innerFn(request, toPromptSections(instructions, promptPreamble));
        debugResult(result);
        return result;
    };
    translator.createRequestPrompt = function (request) {
        return (`You are a service that translates user requests into JSON objects of type "${validator.getTypeName()}" according to the following TypeScript definitions:\n` +
            `\`\`\`\n${validator.getSchemaText()}\`\`\`\n` +
            `The following is the latest user request:\n` +
            `"""\n${request}\n"""\n` +
            `Based on all available information in our chat history including images previously provided, the following is the latest user request translated into a JSON object with 2 spaces of indentation and no properties with the value undefined:\n`);
    };
    return translator;
}
/**
 * load schema from schema file. If multiple files provided, concatenate them
 * @param schemaFiles a single or multiple file paths
 */
export function getTranslationSchemaText(schemaFiles) {
    const schemas = Array.isArray(schemaFiles)
        ? schemaFiles.map(readSchemaFile)
        : [readSchemaFile(schemaFiles)];
    if (schemas.length === 0) {
        throw new Error("No schemas provided");
    }
    return schemas.join("\n");
}
/**
 *
 * @param schemaFiles pass either a single file OR an array of files that are concatenated
 * @param typeName
 * @param constraintsValidator optionally validate constraints on response
 * @param instructions Optional additional instructions
 * @param model optional, custom model impl.
 * @returns
 */
export function createJsonTranslatorFromFile(typeName, schemaFiles, options) {
    return createJsonTranslatorFromSchemaDef(typeName, getTranslationSchemaText(schemaFiles), options);
}
const header = `// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.`;
export function readSchemaFile(schemaFile) {
    let content = fs.readFileSync(schemaFile, "utf8");
    if (content.startsWith(header)) {
        // strip copyright header for the prompt
        content = content.substring(header.length);
    }
    return content.trim();
}
/**
 * Combine instructions + any user provided preamble
 * @param instructions
 * @param prompt
 * @returns
 */
function toPromptSections(instructions, prompt) {
    const promptSections = typeof prompt === "string"
        ? [{ role: "user", content: prompt }]
        : prompt ?? [];
    return instructions.concat(promptSections);
}
//# sourceMappingURL=jsonTranslator.js.map