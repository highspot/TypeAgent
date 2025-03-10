// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import path from "path";
import { openai } from "aiclient";
import { asyncArray, collections, } from "typeagent";
import { createConversation, createConversationTopicMerger, } from "./conversation.js";
import { extractKnowledgeFromBlock, createKnowledgeExtractor, createKnowledgeExtractorSettings, createExtractedKnowledge, isMemorizedEntity, isKnowledgeEmpty, mergeKnowledge, } from "./knowledge.js";
import { createSearchProcessor, } from "./searchProcessor.js";
import { createEmbeddingCache } from "../modelCache.js";
import { logError } from "../diagnostics.js";
import assert from "assert";
/**
 * Creates a conversation manager with standard defaults.
 * @param conversationName name of conversation
 * @param conversationPath path to a root folder for this conversation.
 * @param createNew Use existing conversation or create a new one
 * @param existingConversation If using an existing conversation
 * @param model Pass in chat model to use
 * @param initializer Optional initializer
 */
export async function createConversationManager(settings, conversationName, conversationPath, createNew, existingConversation) {
    const conversationSettings = createConversationSettings();
    const chatModel = settings.model ?? openai.createChatModelDefault("conversationManager");
    const knowledgeModel = chatModel;
    const answerModel = settings.answerModel ?? chatModel;
    const folderSettings = defaultFolderSettings();
    const conversation = existingConversation === undefined
        ? await createConversation(conversationSettings, path.join(conversationPath, conversationName), folderSettings)
        : existingConversation;
    if (createNew) {
        await conversation.clear(true);
    }
    const knowledgeExtractor = createKnowledgeExtractor(knowledgeModel, createKnowledgeExtractorSettings());
    let topicMerger = await createMerger();
    const searchProcessor = createSearchProcessor(conversation, knowledgeModel, answerModel);
    const updateTaskQueue = collections.createTaskQueue(async (task) => {
        await handleUpdateTask(task);
    }, 64);
    const thisConversationManager = {
        conversationName,
        conversation,
        get topicMerger() {
            return topicMerger;
        },
        knowledgeExtractor,
        searchProcessor,
        updateTaskQueue,
        addMessage,
        addMessageBatch,
        queueAddMessage,
        search,
        getSearchResponse,
        generateAnswerForSearchResponse,
        clear,
    };
    await load();
    return thisConversationManager;
    function addMessage(message, extractKnowledge) {
        if (typeof message === "string") {
            message = { text: message };
        }
        return addMessageToConversation(conversation, knowledgeExtractor, topicMerger, message, extractKnowledge);
    }
    function addMessageBatch(messages, extractKnowledge) {
        if (messages.length === 1) {
            const message = messages[0];
            return addMessage(message, extractKnowledge);
        }
        return addMessageBatchToConversation(conversation, knowledgeExtractor, topicMerger, messages, extractKnowledge);
    }
    function queueAddMessage(message, extractKnowledge) {
        if (typeof message === "string") {
            message = { text: message };
        }
        extractKnowledge ??= true;
        if (message.knowledge) {
            if (Array.isArray(message.knowledge)) {
                message.knowledge = removeMemorizedEntities(message.knowledge);
            }
            else {
                message.knowledge.entities = removeMemorizedEntities(message.knowledge.entities);
            }
        }
        return updateTaskQueue.push({
            type: "addMessage",
            message,
            extractKnowledge,
        });
    }
    async function handleUpdateTask(task) {
        let callback;
        try {
            switch (task.type) {
                default:
                    break;
                case "addMessage":
                    const addTask = task;
                    callback = addTask.callback;
                    await addMessageToConversation(conversation, knowledgeExtractor, topicMerger, addTask.message, addTask.extractKnowledge);
                    break;
            }
            if (callback) {
                callback();
            }
        }
        catch (error) {
            logError(`${conversationName}:writeMessage\n${error}`);
            if (callback) {
                callback(error);
            }
        }
    }
    async function search(query, termFilters, fuzzySearchOptions, maxMessages, progress) {
        return searchProcessor.searchTerms(query, termFilters, createSearchProcessingSettings(fuzzySearchOptions, maxMessages, progress));
    }
    async function getSearchResponse(query, termFilters, fuzzySearchOptions, maxMessages, progress) {
        const options = createSearchProcessingSettings(fuzzySearchOptions, maxMessages, progress);
        options.skipAnswerGeneration = true;
        return searchProcessor.searchTerms(query, termFilters, options);
    }
    async function generateAnswerForSearchResponse(query, searchResponse, fuzzySearchOptions, maxMessages) {
        const options = createSearchProcessingSettings(fuzzySearchOptions, maxMessages);
        return searchProcessor.generateAnswer(query, searchResponse, options);
    }
    async function load() {
        await conversation.getMessageIndex();
        if (settings.initializer) {
            await settings.initializer(thisConversationManager);
        }
    }
    async function clear(removeMessages) {
        await conversation.clear(removeMessages);
        await topicMerger.reset();
        await load();
    }
    async function createMerger() {
        return await createConversationTopicMerger(knowledgeModel, conversation, 1);
    }
    function createConversationSettings() {
        if (existingConversation) {
            return existingConversation.settings;
        }
        const embeddingModel = createEmbeddingCache(openai.createEmbeddingModel(), 64);
        return {
            indexSettings: {
                caseSensitive: false,
                concurrency: 2,
                embeddingModel,
                semanticIndex: true,
            },
        };
    }
    function defaultFolderSettings() {
        return {
            cacheNames: true,
            useWeakRefs: true,
        };
    }
    function createSearchProcessingSettings(fuzzySearchOptions, maxMessages, progress) {
        fuzzySearchOptions ??= {
            maxMatches: 2,
        };
        fuzzySearchOptions.minScore ??= 0.8;
        maxMessages ??= 10;
        return {
            maxMatches: fuzzySearchOptions.maxMatches,
            minScore: fuzzySearchOptions.minScore,
            maxMessages,
            progress,
            fallbackSearch: { maxMatches: maxMessages },
        };
    }
}
export async function createConversationManagerEx(settings, conversationSettings, name, rootPath, storageProvider) {
    const conversation = await createConversation(conversationSettings, rootPath, undefined, undefined, storageProvider);
    const cm = await createConversationManager(settings, name, rootPath, false, conversation);
    return cm;
}
/**
 * Add a new message to the given conversation, extracting knowledge using the given knowledge extractor.
 * @param conversation
 * @param knowledgeExtractor
 * @param topicMerger (Optional)
 * @param message message text or message text block to add
 * @param knownKnowledge pre-extracted/known knowledge associated with this message
 * @param timestamp
 */
export async function addMessageToConversation(conversation, knowledgeExtractor, topicMerger, message, extractKnowledge = true) {
    const messageBlock = await conversation.addMessage(getMessageHeaderAndText(message), message.timestamp);
    const messageIndex = await conversation.getMessageIndex();
    await messageIndex.put(messageBlock.value, messageBlock.blockId);
    let extractedKnowledge = await extractKnowledgeFromMessage(knowledgeExtractor, message, messageBlock, message.knowledge, extractKnowledge);
    if (extractedKnowledge) {
        await indexKnowledge(conversation, topicMerger, messageBlock, extractedKnowledge, message.timestamp);
    }
}
export async function addMessageBatchToConversation(conversation, knowledgeExtractor, topicMerger, messages, extractKnowledge = true) {
    const messageBlocks = await asyncArray.mapAsync(messages, 1, (m) => conversation.addMessage(getMessageHeaderAndText(m), m.timestamp));
    assert.ok(messages.length === messageBlocks.length);
    const messageIndex = await conversation.getMessageIndex();
    await messageIndex.putMultiple(messageBlocks.map((m) => {
        return [m.value, m.blockId];
    }));
    //
    // Knowledge extraction can be done in parallel
    // But we update the knowledge index sequentially
    //
    const concurrency = conversation.settings.indexSettings.concurrency;
    const extractedKnowledge = await asyncArray.mapAsync(messageBlocks, concurrency, async (messageBlock, index) => {
        const knowledge = await extractKnowledgeFromMessage(knowledgeExtractor, messages[index], messageBlock, messages[index].knowledge, extractKnowledge);
        return knowledge;
    });
    assert.ok(messageBlocks.length === extractedKnowledge.length);
    for (let i = 0; i < extractedKnowledge.length; ++i) {
        const knowledge = extractedKnowledge[i];
        if (knowledge) {
            await indexKnowledge(conversation, topicMerger, messageBlocks[i], knowledge, messages[i].timestamp);
        }
    }
}
async function extractKnowledgeFromMessage(knowledgeExtractor, message, messageBlock, priorKnowledge, shouldExtractKnowledge = true) {
    let newKnowledge;
    let knownKnowledge;
    if (hasPriorKnowledge(priorKnowledge)) {
        knownKnowledge = createExtractedKnowledge(messageBlock, priorKnowledge);
    }
    // Ignore message header if there is one
    if (message.header) {
        messageBlock = {
            ...messageBlock,
        };
        messageBlock.value = getMessageText(message);
    }
    const knowledgeResult = shouldExtractKnowledge
        ? await extractKnowledgeFromBlock(knowledgeExtractor, messageBlock)
        : undefined;
    if (knowledgeResult) {
        newKnowledge = knowledgeResult[1];
    }
    if (newKnowledge) {
        if (knownKnowledge) {
            newKnowledge = mergeKnowledge(newKnowledge, knownKnowledge);
        }
    }
    else {
        newKnowledge = knownKnowledge
            ? mergeKnowledge(knownKnowledge) // Eliminates any duplicate information
            : undefined;
    }
    if (newKnowledge) {
        newKnowledge.sourceEntityName = message.sender;
    }
    return newKnowledge;
    function hasPriorKnowledge(knowledge) {
        if (knowledge) {
            if (Array.isArray(knowledge)) {
                return knowledge.length > 0;
            }
            return !isKnowledgeEmpty(knowledge);
        }
        return false;
    }
}
function removeMemorizedEntities(entities) {
    return entities.filter((e) => !isMemorizedEntity(e.type));
}
async function indexKnowledge(conversation, topicMerger, messageBlock, knowledge, timestamp) {
    // Add next message... this updates the "sequence"
    const knowledgeIds = await conversation.addKnowledgeForMessage(messageBlock, knowledge);
    await conversation.addKnowledgeToIndex(knowledge, knowledgeIds);
    if (topicMerger &&
        knowledgeIds.topicIds &&
        knowledgeIds.topicIds.length > 0) {
        await topicMerger.next(knowledge.topics, knowledgeIds.topicIds, timestamp, true);
    }
}
function getMessageText(message) {
    return typeof message.text === "string" ? message.text : message.text.value;
}
function getMessageHeaderAndText(message) {
    if (message.header) {
        if (typeof message.text === "string") {
            return message.header + "\n\n" + message.text;
        }
        let textBlock = {
            type: message.text.type,
            value: message.header + "\n\n" + message.text.value,
            sourceIds: message.text.sourceIds,
        };
        return textBlock;
    }
    return message.text;
}
//# sourceMappingURL=conversationManager.js.map