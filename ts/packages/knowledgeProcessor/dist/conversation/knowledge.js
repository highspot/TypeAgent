// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { async, asyncArray, collections, loadSchema } from "typeagent";
import { createJsonTranslator, } from "typechat";
import { createTypeScriptJsonValidator } from "typechat/ts";
import { TextBlockType } from "../text.js";
import { mergeEntityFacet } from "./entities.js";
import { unionArrays } from "../setOperations.js";
export function createKnowledgeExtractor(model, extractorSettings) {
    const settings = extractorSettings ?? createKnowledgeExtractorSettings();
    const translator = createTranslator(model);
    return {
        settings,
        extract,
        extractWithRetry,
        translator,
    };
    async function extract(message) {
        const result = await extractKnowledge(message);
        if (!result.success) {
            return undefined;
        }
        return result.data;
    }
    function extractWithRetry(message, maxRetries) {
        return async.getResultWithRetry(() => extractKnowledge(message), maxRetries);
    }
    async function extractKnowledge(message) {
        const result = await translator.translate(message);
        if (result.success) {
            if (settings.mergeActionKnowledge) {
                mergeActionKnowledge(result.data);
            }
        }
        return result;
    }
    function createTranslator(model) {
        const schema = loadSchema(["knowledgeSchema.ts"], import.meta.url);
        const typeName = "KnowledgeResponse";
        const validator = createTypeScriptJsonValidator(schema, typeName);
        const translator = createJsonTranslator(model, validator);
        translator.createRequestPrompt = createRequestPrompt;
        return translator;
        function createRequestPrompt(request) {
            return (`You are a service that translates user messages in a conversation into JSON objects of type "${typeName}" according to the following TypeScript definitions:\n` +
                `\`\`\`\n${schema}\`\`\`\n` +
                `The following are messages in a conversation:\n` +
                `"""\n${request}\n"""\n` +
                `The following is the user request translated into a JSON object with 2 spaces of indentation and no properties with the value undefined:\n`);
        }
    }
    //
    // Some knowledge found via actions is actually meant for entities...
    //
    function mergeActionKnowledge(knowledge) {
        if (knowledge.actions === undefined) {
            knowledge.actions = [];
        }
        // Merge all inverse actions into regular actions.
        if (knowledge.inverseActions && knowledge.inverseActions.length > 0) {
            knowledge.actions.push(...knowledge.inverseActions);
            knowledge.inverseActions = [];
        }
        // Also merge in any facets into
        for (const action of knowledge.actions) {
            if (action.subjectEntityFacet) {
                const entity = knowledge.entities.find((c) => c.name === action.subjectEntityName);
                if (entity) {
                    mergeEntityFacet(entity, action.subjectEntityFacet);
                }
                action.subjectEntityFacet = undefined;
            }
        }
    }
}
/**
 * Return default settings
 * @param maxCharsPerChunk (optional)
 * @returns
 */
export function createKnowledgeExtractorSettings(maxCharsPerChunk = 2048) {
    return {
        maxContextLength: maxCharsPerChunk,
        mergeActionKnowledge: true,
    };
}
/**
 * Create knowledge from pre-existing entities, topics and actions
 * @param source
 * @returns
 */
export function createExtractedKnowledge(source, knowledge) {
    const sourceIds = [source.blockId];
    const ek = {};
    if (Array.isArray(knowledge)) {
        ek.entities =
            knowledge.length > 0
                ? knowledge.map((value) => {
                    return { value, sourceIds };
                })
                : undefined;
        return ek;
    }
    ek.topics =
        knowledge.topics.length > 0
            ? knowledge.topics.map((value) => {
                return {
                    value,
                    sourceIds,
                    type: TextBlockType.Sentence,
                };
            })
            : undefined;
    ek.entities =
        knowledge.entities.length > 0
            ? knowledge.entities.map((value) => {
                return { value, sourceIds };
            })
            : undefined;
    ek.actions =
        knowledge.actions && knowledge.actions.length > 0
            ? knowledge.actions.map((value) => {
                return { value, sourceIds };
            })
            : undefined;
    return ek;
}
/**
 * Extract knowledge from source text
 * @param extractor
 * @param message
 * @returns
 */
export async function extractKnowledgeFromBlock(extractor, message) {
    const messageText = message.value.trim();
    if (message.value.length === 0) {
        return undefined;
    }
    let knowledge = await extractor.extract(messageText);
    if (!knowledge) {
        return undefined;
    }
    return [message, createExtractedKnowledge(message, knowledge)];
}
/**
 * Extract knowledge from the given blocks concurrently
 * @param extractor
 * @param blocks
 * @param concurrency
 * @returns
 */
export async function extractKnowledge(extractor, blocks, concurrency) {
    return asyncArray.mapAsync(blocks, concurrency, (message) => extractKnowledgeFromBlock(extractor, message));
}
export const NoEntityName = "none";
export function knowledgeValueToString(value) {
    if (typeof value === "object") {
        return `${value.amount} ${value.units}`;
    }
    return value.toString();
}
export var KnownEntityTypes;
(function (KnownEntityTypes) {
    KnownEntityTypes["Person"] = "person";
    KnownEntityTypes["Email"] = "email";
    KnownEntityTypes["Email_Address"] = "email_address";
    KnownEntityTypes["Email_Alias"] = "alias";
    KnownEntityTypes["Memorized"] = "__memory";
    KnownEntityTypes["Message"] = "message";
})(KnownEntityTypes || (KnownEntityTypes = {}));
export function isMemorizedEntity(entityType) {
    return entityType.findIndex((t) => t === KnownEntityTypes.Memorized) >= 0;
}
export function isKnowledgeEmpty(knowledge) {
    return (knowledge.topics.length === 0 &&
        knowledge.entities.length === 0 &&
        knowledge.actions.length === 0);
}
export function mergeKnowledge(x, y) {
    const merged = new Map();
    if (x.entities && x.entities.length > 0) {
        mergeEntities(x.entities, merged);
    }
    if (y && y.entities && y.entities.length > 0) {
        mergeEntities(y.entities, merged);
    }
    let topics = y ? collections.concatArrays(x.topics, y.topics) : x.topics;
    let actions = y
        ? collections.concatArrays(x.actions, y.actions)
        : x.actions;
    return {
        entities: [...merged.values()],
        topics,
        actions,
    };
}
function mergeEntities(entities, nameToEntityMap) {
    for (const ee of entities) {
        const entity = prepareEntityForMerge(ee.value);
        const existing = nameToEntityMap.get(entity.name);
        if (existing) {
            // We already have an entity with this name. Merge the entity's types
            existing.value.type = unionArrays(existing.value.type, entity.type);
            if (entity.facets && entity.facets.length > 0) {
                for (const f of entity.facets) {
                    mergeEntityFacet(existing.value, f);
                }
            }
        }
        else {
            // Have not seen this entity before
            nameToEntityMap.set(entity.name, ee);
        }
    }
}
function prepareEntityForMerge(entity) {
    entity.name = entity.name.toLowerCase();
    collections.lowerAndSort(entity.type);
    return entity;
}
export function isValidEntityName(name) {
    return name !== undefined && name.length > 0 && name !== NoEntityName;
}
//# sourceMappingURL=knowledge.js.map