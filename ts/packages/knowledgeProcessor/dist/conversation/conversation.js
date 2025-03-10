// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { asyncArray, createObjectFolder, removeDir, } from "typeagent";
import { TextBlockType } from "../text.js";
import { createTextStore } from "../textStore.js";
import path from "path";
import { createTopicIndexOnStorage, createTopicMerger, createTopicSearchOptions, } from "./topics.js";
import { removeSemanticIndexFolder } from "../textIndex.js";
import { createEntityIndexOnStorage, createEntitySearchOptions, } from "./entities.js";
import { intersectSets, removeUndefined, unionSets } from "../setOperations.js";
import { createMessageIndex } from "./messages.js";
import { createActionIndexOnStorage, createActionSearchOptions, } from "./actions.js";
import { getAllTermsInFilter } from "./knowledgeTermSearch2.js";
import { createSearchResponse } from "./searchResponse.js";
import { createFileSystemStorageProvider, } from "../storageProvider.js";
import { createRecentItemsWindow } from "../temporal.js";
import { createThreadIndexOnStorage } from "./threads.js";
export function createConversationSettings(embeddingModel) {
    return {
        indexSettings: {
            caseSensitive: false,
            concurrency: 2,
            embeddingModel,
            semanticIndex: true,
        },
    };
}
export function createConversationSearchOptions(topLevelSummary = false) {
    const topicLevel = topLevelSummary ? 2 : 1;
    const searchOptions = {
        entity: createEntitySearchOptions(true),
        topic: createTopicSearchOptions(topLevelSummary),
        action: createActionSearchOptions(true),
        topicLevel,
        loadMessages: !topLevelSummary,
    };
    return searchOptions;
}
/**
 * Create or load a persistent conversation, using the given rootPath as the storage root.
 * - The conversation is stored in folders below the given root path
 * - If the rootPath exists, the conversation stored inside it is automatically used.
 * @param settings
 * @param rootPath
 * @param folderSettings (Optional) Flags for object storage
 * @param fSys (Optional) By default, stored on local file system
 * @returns
 */
export async function createConversation(settings, rootPath, folderSettings, fSys, storageProvider) {
    settings.indexActions ??= true;
    folderSettings ??= {
        cacheNames: true,
        useWeakRefs: true,
    };
    storageProvider ??= createFileSystemStorageProvider(rootPath, folderSettings, fSys);
    const messages = await createTextStore({ concurrency: settings.indexSettings.concurrency }, path.join(rootPath, "messages"), folderSettings, fSys);
    let messageIndex;
    const knowledgeStore = await createObjectFolder(path.join(rootPath, "knowledge"), folderSettings, fSys);
    const topics = new Map();
    const entityPath = path.join(rootPath, "entities");
    let entityIndex;
    const actionPath = path.join(rootPath, "actions");
    let actionIndex;
    const threadsPath = path.join(rootPath, "threads");
    let threadIndex;
    const thisConversation = {
        settings,
        messages,
        knowledge: knowledgeStore,
        getMessageIndex,
        getEntityIndex,
        getTopicsIndex,
        getActionIndex,
        getThreadIndex,
        clear,
        addMessage,
        addKnowledgeForMessage,
        addKnowledgeToIndex,
        search,
        searchTerms,
        searchTermsV2,
        searchMessages,
        findMessage,
        loadMessages,
    };
    await load();
    return thisConversation;
    async function getMessageIndex() {
        if (!messageIndex) {
            messageIndex = await createMessageIndex(settings.indexSettings, rootPath, folderSettings, fSys);
        }
        return messageIndex;
    }
    async function getEntityIndex() {
        if (!entityIndex) {
            entityIndex = await createEntityIndexOnStorage(settings.entityIndexSettings ?? settings.indexSettings, entityPath, storageProvider);
        }
        return entityIndex;
    }
    async function getEntityNameIndex() {
        const entityIndex = await getEntityIndex();
        return {
            nameIndex: entityIndex.nameIndex,
            nameAliases: entityIndex.nameAliases,
        };
    }
    async function getActionIndex() {
        if (!actionIndex) {
            actionIndex = await createActionIndexOnStorage(settings.actionIndexSettings ?? settings.indexSettings, getEntityNameIndex, actionPath, storageProvider);
        }
        return actionIndex;
    }
    async function getThreadIndex() {
        if (!threadIndex) {
            // Using file provider until stable
            const provider = createFileSystemStorageProvider(rootPath, folderSettings, fSys);
            threadIndex = await createThreadIndexOnStorage(threadsPath, provider);
        }
        return threadIndex;
    }
    async function getTopicsIndex(level) {
        const name = topicsName(level);
        let topicIndex = topics.get(name);
        if (!topicIndex) {
            topicIndex = await loadTopicIndex(name);
            topics.set(name, topicIndex);
        }
        return topicIndex;
    }
    async function loadKnowledge() {
        await Promise.all([
            getTopicsIndex(1),
            getTopicsIndex(2),
            getEntityIndex(),
            getActionIndex(),
        ]);
    }
    async function removeTopics(level) {
        const name = topicsName(level);
        topics.delete(name);
        await removeDir(path.join(rootPath, name), fSys);
    }
    async function removeEntities() {
        await removeDir(entityPath, fSys);
        entityIndex = undefined;
    }
    async function removeActions() {
        await removeDir(actionPath, fSys);
        actionIndex = undefined;
    }
    async function removeKnowledge() {
        // TODO: Migrate to file system storage provider
        await Promise.all([
            knowledgeStore.clear(),
            removeTopics(1),
            removeTopics(2), // TODO: what about topics at other levels?
            removeEntities(),
            removeActions(),
        ]);
        topics.clear();
        await storageProvider.clear();
    }
    async function removeMessageIndex() {
        await removeSemanticIndexFolder(rootPath, fSys);
        messageIndex = undefined;
    }
    async function clear(removeMessages) {
        await removeMessageIndex();
        await removeKnowledge();
        if (removeMessages) {
            await messages.clear();
        }
        await load();
    }
    async function load() {
        await Promise.all([loadKnowledge(), getMessageIndex()]);
        if (settings.initializer) {
            await settings.initializer(thisConversation);
        }
    }
    async function loadTopicIndex(name) {
        const index = await createTopicIndexOnStorage(settings.indexSettings, getEntityNameIndex, rootPath, name, storageProvider, "TEXT");
        return index;
    }
    async function addMessage(message, timestamp) {
        const messageBlock = typeof message === "string"
            ? {
                value: message,
                type: TextBlockType.Paragraph,
            }
            : message;
        timestamp ??= new Date();
        const blockId = await messages.put(messageBlock, timestamp);
        return { ...messageBlock, blockId, timestamp };
    }
    async function addKnowledgeForMessage(message, knowledge) {
        await knowledgeStore.put(knowledge, message.blockId);
        const knowledgeIds = {};
        await Promise.all([
            addNextEntities(knowledge, knowledgeIds, message.timestamp),
            addNextTopics(knowledge, knowledgeIds, message.timestamp),
            addNextActions(knowledge, knowledgeIds, message.timestamp),
        ]);
        return knowledgeIds;
    }
    async function addKnowledgeToIndex(knowledge, knowledgeIds, message) {
        // these indexes are independent, they can be updated concurrently.
        await Promise.all([
            indexMessage(message),
            indexEntities(knowledge, knowledgeIds),
        ]);
        // actions and topics depend on entities
        await Promise.all([
            indexTopics(knowledge, knowledgeIds),
            indexActions(knowledge, knowledgeIds),
        ]);
    }
    async function indexMessage(message) {
        if (message) {
            const messageIndex = await getMessageIndex();
            await messageIndex.put(message.value, message.blockId);
        }
    }
    async function addNextTopics(knowledge, knowledgeIds, timestamp) {
        if (knowledge.topics && knowledge.topics.length > 0) {
            const topicIndex = await getTopicsIndex();
            knowledgeIds.topicIds = await topicIndex.addNext(knowledge.topics, timestamp);
        }
    }
    async function indexTopics(knowledge, knowledgeIds) {
        if (knowledge.topics && knowledge.topics.length > 0) {
            const topicIndex = await getTopicsIndex();
            await topicIndex.addMultiple(knowledge.topics, knowledge.sourceEntityName, knowledgeIds.topicIds);
        }
    }
    async function addNextEntities(knowledge, knowledgeIds, timestamp) {
        if (knowledge.entities && knowledge.entities.length > 0) {
            const entityIndex = await getEntityIndex();
            knowledgeIds.entityIds = await entityIndex.addNext(knowledge.entities, timestamp);
        }
    }
    async function indexEntities(knowledge, knowledgeIds) {
        if (knowledge.entities && knowledge.entities.length > 0) {
            const entityIndex = await getEntityIndex();
            const entityIds = await entityIndex.addMultiple(knowledge.entities, knowledgeIds.entityIds);
            if (knowledge.tags && knowledge.tags.length > 0) {
                await asyncArray.mapAsync(knowledge.tags, 1, (t) => entityIndex.addTag(t, entityIds));
            }
        }
    }
    async function addNextActions(knowledge, knowledgeIds, timestamp) {
        if (settings.indexActions &&
            knowledge.actions &&
            knowledge.actions.length > 0) {
            const actionIndex = await getActionIndex();
            knowledgeIds.actionIds = await actionIndex.addNext(knowledge.actions, timestamp);
        }
    }
    async function indexActions(knowledge, knowledgeIds) {
        if (settings.indexActions &&
            knowledge.actions &&
            knowledge.actions.length > 0) {
            const actionIndex = await getActionIndex();
            await actionIndex.addMultiple(knowledge.actions, knowledgeIds.actionIds);
        }
    }
    async function search(filters, options) {
        const entityIndex = await getEntityIndex();
        const topicIndex = await getTopicsIndex(options.topicLevel);
        const actionIndex = await getActionIndex();
        const results = createSearchResults();
        for (const filter of filters) {
            switch (filter.filterType) {
                case "Topic":
                    if (options.topic) {
                        const topicResult = await topicIndex.search(filter, options.topic);
                        results.topics.push(topicResult);
                    }
                    break;
                case "Entity":
                    if (options.entity) {
                        const entityResult = await entityIndex.search(filter, options.entity);
                        results.entities.push(entityResult);
                    }
                    break;
                case "Action":
                    if (options.action) {
                        const actionResults = await actionIndex.search(filter, options.action);
                        results.actions.push(actionResults);
                    }
                    break;
            }
        }
        if (options.loadMessages) {
            await resolveMessages(results, topicIndex, entityIndex, actionIndex);
        }
        return results;
    }
    async function searchTerms(filters, options) {
        console.log("SEARCHING TERMS HERE");
        const [entityIndex, topicIndex, actionIndex] = await Promise.all([
            getEntityIndex(),
            getTopicsIndex(options.topicLevel),
            getActionIndex(),
        ]);
        const results = createSearchResults();
        for (const filter of filters) {
            // Only search actions if (a) actions are enabled (b) we have an action filter
            if (options.topic) {
                const topicResult = await topicIndex.searchTerms(filter, options.topic);
                results.topics.push(topicResult);
            }
            if (options.entity) {
                const entityResult = await entityIndex.searchTerms(filter, options.entity);
                results.entities.push(entityResult);
            }
            if (options.action) {
                const actionResult = await actionIndex.searchTerms(filter, options.action);
                results.actions.push(actionResult);
            }
        }
        if (options.loadMessages) {
            await resolveMessages(results, topicIndex, entityIndex, actionIndex);
        }
        return results;
    }
    async function searchTermsV2(filters, searchOptions) {
        const options = searchOptions ?? createConversationSearchOptions();
        const [entityIndex, topicIndex, actionIndex] = await Promise.all([
            getEntityIndex(),
            getTopicsIndex(options.topicLevel),
            getActionIndex(),
        ]);
        const results = createSearchResults();
        for (let filter of filters) {
            let topLevelTopicMatches = options.topic &&
                options.topic.useHighLevel &&
                options.topicLevel === 1
                ? await matchTopLevelTopics(options.topicLevel, filter, options.topic)
                : undefined;
            const searchTasks = [
                options.action
                    ? await actionIndex.searchTermsV2(filter, options.action)
                    : Promise.resolve(undefined),
                options.topic
                    ? topicIndex.searchTermsV2(filter, options.topic, topLevelTopicMatches)
                    : Promise.resolve(undefined),
                options.entity
                    ? entityIndex.searchTermsV2({
                        searchTerms: getAllTermsInFilter(filter, false),
                        timeRange: filter.timeRange,
                    }, options.entity)
                    : Promise.resolve(undefined),
            ];
            const [actionResult, topicResult, entityResult] = await Promise.all(searchTasks);
            if (topicResult) {
                results.topics.push(topicResult);
            }
            if (entityResult) {
                results.entities.push(entityResult);
            }
            if (actionResult) {
                results.actions.push(actionResult);
            }
        }
        if (options.loadMessages) {
            await resolveMessages(results, topicIndex, entityIndex, actionIndex);
        }
        return results;
    }
    async function matchTopLevelTopics(level, filter, options) {
        const topicIndex = await getTopicsIndex(level + 1);
        const result = await topicIndex.searchTermsV2(filter, options);
        if (result.topicIds && result.topicIds.length > 0) {
            return await topicIndex.getSourceIds(result.topicIds);
        }
        return undefined;
    }
    async function searchMessages(query, options, idsToSearch) {
        const messageIndex = await getMessageIndex();
        if (messageIndex) {
            const matches = idsToSearch && idsToSearch.length > 0
                ? await messageIndex.nearestNeighborsInSubset(query, idsToSearch, options.maxMatches, options.minScore)
                : await messageIndex.nearestNeighbors(query, options.maxMatches, options.minScore);
            if (matches.length > 0) {
                const messageIds = matches.map((m) => m.item);
                return { messageIds, messages: await loadMessages(messageIds) };
            }
        }
        return undefined;
    }
    async function resolveMessages(results, topicIndex, entityIndex, actionIndex) {
        let topicMessageIds;
        let entityMessageIds;
        let actionMessageIds;
        if (results.topics && results.topics.length > 0) {
            topicMessageIds = await topicIndex.loadSourceIds(messages, results.topics);
        }
        if (results.entities && results.entities.length > 0) {
            entityMessageIds = await entityIndex.loadSourceIds(messages, results.entities);
        }
        if (results.actions && results.actions.length > 0) {
            actionMessageIds = await actionIndex.loadSourceIds(messages, results.actions);
        }
        entityMessageIds = intersectSets(entityMessageIds, actionMessageIds);
        if (!entityMessageIds || entityMessageIds.size === 0) {
            entityMessageIds = unionSets(entityMessageIds, actionMessageIds);
        }
        let messageIds = intersectSets(topicMessageIds, entityMessageIds);
        if (!messageIds || messageIds.size === 0) {
            //messageIds = topicMessageIds;
            // If nothing in common, try a union.
            messageIds = unionSets(topicMessageIds, entityMessageIds);
            //messageIds = intersectUnionSets(topicMessageIds, entityMessageIds);
        }
        if (messageIds && messageIds.size > 0) {
            results.messageIds = [...messageIds.values()].sort();
            results.messages = await loadMessages(results.messageIds);
        }
    }
    async function loadMessages(ids) {
        let loadedMessages = (await messages.getMultiple(ids));
        loadedMessages = removeUndefined(loadedMessages);
        // Return messages in temporal order
        loadedMessages.sort((x, y) => x.timestamp.getTime() - y.timestamp.getTime());
        return loadedMessages;
    }
    function topicsName(level) {
        level ??= 1;
        return `topics_${level}`;
    }
    async function findMessage(messageText) {
        const existing = await searchMessages(messageText, {
            maxMatches: 1,
        });
        if (existing && existing.messages && existing.messages.length > 0) {
            const messageBlock = existing.messages[0];
            if (messageText === messageBlock.value.value) {
                return messageBlock;
            }
        }
        return undefined;
    }
    function createSearchResults() {
        return createSearchResponse();
    }
}
export async function createConversationTopicMerger(mergeModel, conversation, baseTopicLevel, mergeWindowSize = 4) {
    let baseTopics;
    let topLevelTopics;
    let topicMerger;
    await init();
    return {
        get settings() {
            return topicMerger.settings;
        },
        next,
        mergeWindow,
        clearRecent,
        reset,
    };
    function next(lastTopics, lastTopicIds, timestamp, updateIndex) {
        return topicMerger.next(lastTopics, lastTopicIds, timestamp, updateIndex);
    }
    function mergeWindow(lastTopics, lastTopicIds, timestamp, windowSize, updateIndex) {
        return topicMerger.mergeWindow(lastTopics, lastTopicIds, timestamp, windowSize, updateIndex);
    }
    function clearRecent() {
        topicMerger.clearRecent();
    }
    function reset() {
        return init();
    }
    async function init() {
        baseTopics = await conversation.getTopicsIndex(baseTopicLevel);
        topLevelTopics = await conversation.getTopicsIndex(baseTopicLevel + 1);
        topicMerger = await createTopicMerger(mergeModel, baseTopics, { mergeWindowSize, trackRecent: true }, topLevelTopics);
    }
}
export function createRecentConversationWindow(windowSize) {
    return {
        turns: createRecentItemsWindow(windowSize, (b) => b.value),
        topics: createRecentItemsWindow(windowSize),
    };
}
//# sourceMappingURL=conversation.js.map