// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { conversation as kpLib } from "knowledge-processor";
import { openai } from "aiclient";
import { async } from "typeagent";
import { facetValueToString } from "./knowledge.js";
import { buildSecondaryIndexes } from "./secondaryIndexes.js";
export function textRangeFromLocation(messageIndex, chunkIndex = 0) {
    return {
        start: { messageIndex, chunkIndex },
        end: undefined,
    };
}
export function addMetadataToIndex(messages, semanticRefs, semanticRefIndex, knowledgeValidator) {
    knowledgeValidator ??= defaultKnowledgeValidator;
    for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        const knowledgeResponse = msg.metadata.getKnowledge();
        if (semanticRefIndex !== undefined) {
            for (const entity of knowledgeResponse.entities) {
                if (knowledgeValidator("entity", entity)) {
                    addEntityToIndex(entity, semanticRefs, semanticRefIndex, i);
                }
            }
            for (const action of knowledgeResponse.actions) {
                if (knowledgeValidator("action", action)) {
                    addActionToIndex(action, semanticRefs, semanticRefIndex, i);
                }
            }
            for (const topic of knowledgeResponse.topics) {
                if (knowledgeValidator("topic", topic)) {
                    addTopicToIndex(topic, semanticRefs, semanticRefIndex, i);
                }
            }
        }
    }
}
function defaultKnowledgeValidator(knowledgeType, knowledge) {
    return true;
}
export function addEntityToIndex(entity, semanticRefs, semanticRefIndex, messageIndex, chunkIndex = 0) {
    const refIndex = semanticRefs.length;
    semanticRefs.push({
        semanticRefIndex: refIndex,
        range: textRangeFromLocation(messageIndex, chunkIndex),
        knowledgeType: "entity",
        knowledge: entity,
    });
    semanticRefIndex.addTerm(entity.name, refIndex);
    // add each type as a separate term
    for (const type of entity.type) {
        semanticRefIndex.addTerm(type, refIndex);
    }
    // add every facet name as a separate term
    if (entity.facets) {
        for (const facet of entity.facets) {
            addFacet(facet, refIndex, semanticRefIndex);
        }
    }
}
function addFacet(facet, refIndex, semanticRefIndex) {
    if (facet !== undefined) {
        semanticRefIndex.addTerm(facet.name, refIndex);
        if (facet.value !== undefined) {
            semanticRefIndex.addTerm(facetValueToString(facet), refIndex);
        }
    }
}
export function addTopicToIndex(topic, semanticRefs, semanticRefIndex, messageIndex, chunkIndex = 0) {
    const refIndex = semanticRefs.length;
    semanticRefs.push({
        semanticRefIndex: refIndex,
        range: textRangeFromLocation(messageIndex, chunkIndex),
        knowledgeType: "topic",
        knowledge: topic,
    });
    semanticRefIndex.addTerm(topic.text, refIndex);
}
export function addActionToIndex(action, semanticRefs, semanticRefIndex, messageIndex, chunkIndex = 0) {
    const refIndex = semanticRefs.length;
    semanticRefs.push({
        semanticRefIndex: refIndex,
        range: textRangeFromLocation(messageIndex, chunkIndex),
        knowledgeType: "action",
        knowledge: action,
    });
    semanticRefIndex.addTerm(action.verbs.join(" "), refIndex);
    if (action.subjectEntityName !== "none") {
        semanticRefIndex.addTerm(action.subjectEntityName, refIndex);
    }
    if (action.objectEntityName !== "none") {
        semanticRefIndex.addTerm(action.objectEntityName, refIndex);
    }
    if (action.indirectObjectEntityName !== "none") {
        semanticRefIndex.addTerm(action.indirectObjectEntityName, refIndex);
    }
    if (action.params) {
        for (const param of action.params) {
            if (typeof param === "string") {
                semanticRefIndex.addTerm(param, refIndex);
            }
            else {
                semanticRefIndex.addTerm(param.name, refIndex);
                if (typeof param.value === "string") {
                    semanticRefIndex.addTerm(param.value, refIndex);
                }
            }
        }
    }
    addFacet(action.subjectEntityFacet, refIndex, semanticRefIndex);
}
export function addKnowledgeToIndex(semanticRefs, semanticRefIndex, messageIndex, knowledge) {
    for (const entity of knowledge.entities) {
        addEntityToIndex(entity, semanticRefs, semanticRefIndex, messageIndex);
    }
    for (const action of knowledge.actions) {
        addActionToIndex(action, semanticRefs, semanticRefIndex, messageIndex);
    }
    for (const inverseAction of knowledge.inverseActions) {
        addActionToIndex(inverseAction, semanticRefs, semanticRefIndex, messageIndex);
    }
    for (const topic of knowledge.topics) {
        const topicObj = { text: topic };
        addTopicToIndex(topicObj, semanticRefs, semanticRefIndex, messageIndex);
    }
}
export async function buildSemanticRefIndex(conversation, extractor, eventHandler) {
    conversation.semanticRefIndex ??= new ConversationIndex();
    const semanticRefIndex = conversation.semanticRefIndex;
    conversation.semanticRefIndex = semanticRefIndex;
    if (conversation.semanticRefs === undefined) {
        conversation.semanticRefs = [];
    }
    const semanticRefs = conversation.semanticRefs;
    extractor ??= createKnowledgeProcessor();
    const maxRetries = 4;
    let indexingResult = {};
    for (let i = 0; i < conversation.messages.length; i++) {
        let messageIndex = i;
        const chunkIndex = 0;
        const msg = conversation.messages[messageIndex];
        // only one chunk per message for now
        const text = msg.textChunks[chunkIndex];
        const knowledgeResult = await async.callWithRetry(() => extractor.extractWithRetry(text, maxRetries));
        if (!knowledgeResult.success) {
            indexingResult.error = knowledgeResult.message;
            break;
        }
        const knowledge = knowledgeResult.data;
        if (knowledge) {
            addKnowledgeToIndex(semanticRefs, semanticRefIndex, messageIndex, knowledge);
        }
        const completedChunk = { messageIndex, chunkIndex };
        indexingResult.chunksIndexedUpto = completedChunk;
        if (eventHandler?.onKnowledgeExtracted &&
            !eventHandler.onKnowledgeExtracted(completedChunk, knowledge)) {
            break;
        }
    }
    return indexingResult;
}
export function addToConversationIndex(conversation, messages, knowledgeResponses) {
    if (conversation.semanticRefIndex === undefined) {
        conversation.semanticRefIndex = new ConversationIndex();
    }
    if (conversation.semanticRefs === undefined) {
        conversation.semanticRefs = [];
    }
    for (let i = 0; i < messages.length; i++) {
        const messageIndex = conversation.messages.length;
        conversation.messages.push(messages[i]);
        const knowledge = knowledgeResponses[i];
        if (knowledge) {
            addKnowledgeToIndex(conversation.semanticRefs, conversation.semanticRefIndex, messageIndex, knowledge);
        }
    }
}
/**
 * Notes:
 *  Case-insensitive
 */
export class ConversationIndex {
    constructor(data) {
        this.map = new Map();
        if (data !== undefined) {
            this.deserialize(data);
        }
    }
    get size() {
        return this.map.size;
    }
    getTerms() {
        return [...this.map.keys()];
    }
    addTerm(term, semanticRefIndex) {
        if (!term) {
            return;
        }
        if (typeof semanticRefIndex === "number") {
            semanticRefIndex = {
                semanticRefIndex: semanticRefIndex,
                score: 1,
            };
        }
        term = this.prepareTerm(term);
        const existing = this.map.get(term);
        if (existing != undefined) {
            existing.push(semanticRefIndex);
        }
        else {
            this.map.set(term, [semanticRefIndex]);
        }
    }
    lookupTerm(term) {
        return this.map.get(this.prepareTerm(term)) ?? [];
    }
    removeTerm(term, semanticRefIndex) {
        this.map.delete(this.prepareTerm(term));
    }
    removeTermIfEmpty(term) {
        term = this.prepareTerm(term);
        if (this.map.has(term) && this.map.get(term)?.length === 0) {
            this.map.delete(term);
        }
    }
    serialize() {
        const items = [];
        for (const [term, semanticRefIndices] of this.map) {
            items.push({ term, semanticRefIndices });
        }
        return { items };
    }
    deserialize(data) {
        for (const termData of data.items) {
            if (termData && termData.term) {
                this.map.set(this.prepareTerm(termData.term), termData.semanticRefIndices);
            }
        }
    }
    /**
     * Do any pre-processing of the term.
     * @param term
     */
    prepareTerm(term) {
        return term.toLowerCase();
    }
}
export function createKnowledgeModel() {
    const chatModelSettings = openai.apiSettingsFromEnv(openai.ModelType.Chat, undefined, "GPT_4_O");
    chatModelSettings.retryPauseMs = 10000;
    const chatModel = openai.createJsonChatModel(chatModelSettings, [
        "chatExtractor",
    ]);
    return chatModel;
}
export function createKnowledgeProcessor(chatModel) {
    chatModel ??= createKnowledgeModel();
    const extractor = kpLib.createKnowledgeExtractor(chatModel, {
        maxContextLength: 4096,
        mergeActionKnowledge: false,
    });
    return extractor;
}
export async function buildConversationIndex(conversation, eventHandler) {
    const result = await buildSemanticRefIndex(conversation, undefined, eventHandler);
    if (!result.error && conversation.semanticRefIndex) {
        await buildSecondaryIndexes(conversation, true, eventHandler);
    }
    return result;
}
//# sourceMappingURL=conversationIndex.js.map