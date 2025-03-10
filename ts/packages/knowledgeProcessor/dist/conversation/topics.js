// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { asyncArray, loadSchema, } from "typeagent";
import { createTypeScriptJsonValidator } from "typechat/ts";
import { createJsonTranslator, } from "typechat";
import path from "path";
import { TextBlockType, collectBlockText, collectSourceIds, } from "../text.js";
import { filterTemporalSequence, getRangeOfTemporalSequence, itemsFromTemporalSequence, } from "../temporal.js";
import { toStopDate, toStartDate } from "./knowledgeActions.js";
import { addToSet, flatten, intersect, intersectMultiple, removeUndefined, unionMultiple, uniqueFrom, } from "../setOperations.js";
import { createRecentItemsWindow } from "../temporal.js";
import { getAllTermsInFilter, getSubjectFromActionTerm, } from "./knowledgeTermSearch2.js";
import { createFileSystemStorageProvider, } from "../storageProvider.js";
import { isValidEntityName } from "./knowledge.js";
export function createTopicExtractor(topicModel, mergeModel) {
    const defaultFacets = "comprehensive, detailed but concise, descriptive";
    mergeModel ??= topicModel;
    const topicTranslator = createTranslator(topicModel, loadSchema(["topicSchema.ts"], import.meta.url), "TopicResponse");
    const aggregateTranslator = createTranslator(mergeModel, loadSchema(["aggregateTopicSchema.ts"], import.meta.url), "AggregateTopicResponse");
    return {
        nextTopic,
        mergeTopics,
    };
    async function nextTopic(latestText, pastText, pastTopics, facets) {
        facets ??= defaultFacets;
        const instruction = "Identify all topics, themes, keywords, actions or entities mentioned, referenced ONLY in the [LATEST MESSAGE] in a conversation. " +
            "Also include the speaker, if any.\n" +
            "Prior messages are in [PAST MESSAGES]\n" +
            `Prior values identified in the conversation are in "context.pastValues". Use them when possible to avoid duplication.\n` +
            `Return ${facets} topics\n`;
        let request = "";
        request += instruction;
        request += "\n\n";
        request += buildContext(pastTopics);
        request += "\n\n";
        request += makeSection("PAST MESSAGES", pastText, "END SECTION");
        request += "\n";
        request += makeSection("LATEST MESSAGE", latestText, "END SECTION");
        request += "\n\n";
        const result = await topicTranslator.translate(request);
        return result.success ? result.data : undefined;
    }
    async function mergeTopics(topics, pastTopics, facets) {
        facets ??= defaultFacets;
        let instruction = `Derive ${facets} HIGHER LEVEL topic and theme from the sub-topics found in [TOPIC SECTION]. `;
        if (pastTopics && pastTopics.length > 0) {
            instruction += `Prior topics identified in the conversation are in "context.pastValues". Use them when possible to avoid duplication.\n`;
        }
        instruction +=
            "Use only the provided information. Make no assumptions about the origin of the sub-topics.\n";
        let request = "";
        request += instruction;
        request += "\n\n";
        request += buildContext(pastTopics);
        request += "\n\n";
        request += makeSection("TOPIC SECTION", topics.join("\n"), "END SECTION");
        request += "\n\n";
        const result = await aggregateTranslator.translate(request);
        return result.success && result.data.status === "Success"
            ? result.data
            : undefined;
    }
    function buildContext(pastTopics) {
        const context = {
            context: {
                pastValues: pastTopics ? pastTopics : [],
            },
        };
        return JSON.stringify(context, null, 2);
    }
    function makeSection(startTag, text, endTag) {
        return `[${startTag}]\n${text}\n[${endTag}]\n`;
    }
    function createTranslator(model, schema, typeName) {
        const validator = createTypeScriptJsonValidator(schema, typeName);
        const translator = createJsonTranslator(model, validator);
        translator.createRequestPrompt = createRequestPrompt;
        return translator;
        function createRequestPrompt(request) {
            return (request +
                `You return your response as a JSON object of type "${typeName}" using the following Typescript definitions:\n` +
                `\`\`\`\n${schema}\n\`\`\`\n` +
                "The following is a JSON object with 2 spaces of indentation and no properties with the value undefined:\n");
        }
    }
}
export async function createTopicMerger(model, childIndex, settings, topicIndex) {
    const topicExtractor = createTopicExtractor(model);
    let childSize = await childIndex.sequence.size();
    let recentTopics = createRecentItemsWindow(settings.mergeWindowSize);
    return {
        settings,
        next,
        mergeWindow,
        clearRecent,
    };
    async function next(lastTopics, lastTopicIds, timestamp, updateIndex) {
        ++childSize;
        if (childSize % settings.mergeWindowSize > 0) {
            return undefined;
        }
        return await mergeWindow(lastTopics, lastTopicIds, timestamp, settings.mergeWindowSize, updateIndex);
    }
    async function mergeWindow(lastTopics, lastTopicIds, timestamp, windowSize, updateIndex) {
        const topics = windowSize === 1 ? lastTopics.map((t) => t.value) : [];
        const allTopicIds = windowSize === 1 ? lastTopicIds : [];
        if (windowSize > 1) {
            const topicWindow = await childIndex.sequence.getNewest(windowSize);
            if (topicWindow.length === 0) {
                return undefined;
            }
            timestamp = topicWindow[0].timestamp;
            for (const entry of topicWindow) {
                const topicsText = await childIndex.getMultipleText(entry.value);
                topics.push(topicsText.join("\n"));
                allTopicIds.push(...entry.value);
            }
        }
        else {
            timestamp ??= new Date();
        }
        if (topics.length === 0) {
            return undefined;
        }
        let topicsResponse = await topicExtractor.mergeTopics(topics, settings.trackRecent ? recentTopics.getUnique() : undefined);
        if (!topicsResponse) {
            return undefined;
        }
        const aggregateTopic = {
            timestamp,
            value: {
                type: TextBlockType.Sentence,
                value: topicsResponse.topic,
                sourceIds: uniqueFrom(allTopicIds),
            },
        };
        if (topicIndex) {
            if (updateIndex) {
                await topicIndex.addNext([aggregateTopic.value], aggregateTopic.timestamp);
                await topicIndex.add(aggregateTopic.value);
            }
        }
        if (settings.trackRecent) {
            recentTopics.push(aggregateTopic.value.value);
        }
        return aggregateTopic;
    }
    function clearRecent() {
        recentTopics.reset();
    }
}
export function createTopicSearchOptions(isTopicSummary = false) {
    return {
        maxMatches: isTopicSummary ? Number.MAX_SAFE_INTEGER : 25,
        minScore: 0.8,
        loadTopics: true,
        sourceNameSearchOptions: {
            maxMatches: 8,
            minScore: 0.8,
        },
    };
}
function createSearchResults() {
    return {
        getTemporalRange() {
            return getRangeOfTemporalSequence(this.temporalSequence);
        },
    };
}
export async function createTopicIndex(settings, getNameIndex, rootPath, name, sourceIdType, folderSettings, fSys) {
    return createTopicIndexOnStorage(settings, getNameIndex, rootPath, name, createFileSystemStorageProvider(rootPath, folderSettings, fSys), sourceIdType);
}
export async function createTopicIndexOnStorage(settings, getNameIndex, basePath, name, storageProvider, sourceIdType) {
    // Timestamped sequence of topics, as they were seen
    const sequence = await storageProvider.createTemporalLog({ concurrency: settings.concurrency }, path.join(basePath, name), "sequence");
    const topicIndex = await storageProvider.createTextIndex(settings, basePath, name, sourceIdType);
    // Optionally maintain an index of the entities that that were involved in discussing
    // or formulating this topic...
    const sourceNameToTopicIndex = await storageProvider.createIndex(basePath, "sourceEntities", "TEXT");
    return {
        settings,
        sequence,
        textIndex: topicIndex,
        topics,
        entries: topicIndex.entries,
        getTopicSequence,
        get,
        getText,
        getMultiple,
        getId: topicIndex.getId,
        getMultipleText,
        getSourceIds,
        getSourceIdsForTopic,
        add,
        addNext,
        addMultiple,
        search,
        searchTerms,
        searchTermsV2,
        loadSourceIds,
    };
    async function* topics() {
        for (const topic of topicIndex.text()) {
            yield topic;
        }
    }
    async function get(id) {
        const topic = await topicIndex.getText(id);
        return topic
            ? {
                value: topic,
                sourceIds: await topicIndex.getById(id),
                type: TextBlockType.Sentence,
            }
            : undefined;
    }
    async function getText(id) {
        return (await topicIndex.getText(id)) ?? "";
    }
    async function getMultiple(ids) {
        const topics = await asyncArray.mapAsync(ids, settings.concurrency, (id) => get(id));
        return removeUndefined(topics);
    }
    async function getMultipleText(ids) {
        return asyncArray.mapAsync(ids, settings.concurrency, (id) => getText(id));
    }
    async function getSourceIds(ids) {
        const postings = removeUndefined(await topicIndex.getByIds(ids));
        return postings && postings.length > 0
            ? uniqueFrom(postings, (p) => p, true)
            : [];
    }
    async function getSourceIdsForTopic(topic) {
        return topicIndex.get(topic);
    }
    async function addMultiple(topics, sourceName, ids) {
        if (ids && ids.length !== topics.length) {
            throw Error("Id length mismatch");
        }
        const topicIds = [];
        for (let i = 0; i < topics.length; ++i) {
            let id = await add(topics[i], sourceName, ids ? ids[i] : undefined);
            topicIds.push(id);
        }
        return topicIds;
    }
    async function addNext(topics, timestamp) {
        const topicIds = await asyncArray.mapAsync(topics, 1, (t) => topicIndex.put(t.value));
        topicIds.sort();
        await sequence.put(topicIds, timestamp);
        return topicIds;
    }
    async function add(topic, sourceName, id) {
        let topicId;
        if (typeof topic === "string") {
            topicId = id ? id : await topicIndex.put(topic);
        }
        else {
            if (id) {
                topicId = id;
                if (topic.sourceIds) {
                    await topicIndex.addSources(topicId, topic.sourceIds);
                }
            }
            else {
                topicId = await topicIndex.put(topic.value, topic.sourceIds);
            }
        }
        if (sourceName) {
            const entityNames = await getNameIndex();
            // TODO: use aliases here for better matching
            const nameId = await entityNames.nameIndex.getId(sourceName);
            if (nameId) {
                await sourceNameToTopicIndex.put([topicId], nameId);
            }
        }
        return topicId;
    }
    async function search(filter, options, sourceName, rawTerms, possibleIds) {
        let results = createSearchResults();
        if (filter.timeRange) {
            results.temporalSequence = await sequence.getEntriesInRange(toStartDate(filter.timeRange.startDate), toStopDate(filter.timeRange.stopDate));
        }
        if (filter.topics) {
            if (filter.topics === "*") {
                // Wildcard
                results.topicIds = await asyncArray.toArray(topicIndex.ids());
            }
            else {
                results.topicIds = rawTerms
                    ? await topicIndex.getNearestTextMultiple(rawTerms, options.maxMatches, options.minScore)
                    : await topicIndex.getNearestText(filter.topics, options.maxMatches, options.minScore);
            }
            if (results.topicIds && results.topicIds.length === 0) {
                results.topicIds = undefined;
            }
            if (results.topicIds) {
                if (possibleIds && possibleIds.length > 0) {
                    // TODO: combine this and the one below
                    results.topicIds = [
                        ...intersect(results.topicIds, possibleIds),
                    ];
                }
                if (sourceName) {
                    const entityNames = await getNameIndex();
                    const topicIdsWithSource = await matchName(entityNames, sourceNameToTopicIndex, sourceName, options);
                    if (topicIdsWithSource) {
                        results.topicIds = [
                            ...intersect(results.topicIds, topicIdsWithSource),
                        ];
                    }
                }
            }
        }
        if (results.temporalSequence) {
            const temporalTopicIds = itemsFromTemporalSequence(results.temporalSequence);
            if (results.topicIds) {
                // Only return topics in the matched time range
                results.topicIds = [
                    ...intersectMultiple(results.topicIds, temporalTopicIds),
                ];
                results.temporalSequence = filterTemporalSequence(results.temporalSequence, results.topicIds);
            }
            else {
                results.topicIds = temporalTopicIds;
            }
        }
        if (options.loadTopics) {
            if (results.topicIds) {
                results.topics = await getMultipleText(results.topicIds);
            }
            else if (results.temporalSequence) {
                const ids = uniqueFrom(flatten(results.temporalSequence, (t) => t.value, false));
                if (ids) {
                    results.topics = await getMultipleText(ids);
                }
            }
        }
        return results;
    }
    async function searchTerms(filter, options) {
        // We will just use the standard topic stuff for now, since that does the same thing
        const topics = filter.terms && filter.terms.length > 0
            ? filter.terms.join(" ")
            : "*";
        const topicFilter = {
            filterType: "Topic",
            topics,
            timeRange: filter.timeRange,
        };
        return search(topicFilter, options);
    }
    async function searchTermsV2(filter, options, possibleIds) {
        // We will just use the standard topic stuff for now, since that does the same thing
        const allTerms = getAllTermsInFilter(filter);
        let sourceName = getSubjectFromActionTerm(filter.action);
        if (!isValidEntityName(sourceName)) {
            sourceName = undefined;
        }
        const topics = allTerms && allTerms.length > 0 ? allTerms.join(" ") : "*";
        const topicFilter = {
            filterType: "Topic",
            topics,
            timeRange: filter.timeRange,
        };
        return search(topicFilter, options, options.filterBySourceName ? sourceName : undefined, 
        //topics !== "*" ? getAllTermsInFilter(filter, false) : undefined,
        undefined, possibleIds);
    }
    async function loadSourceIds(sourceIdLog, results, unique) {
        if (results.length === 0) {
            return unique;
        }
        unique ??= new Set();
        await asyncArray.forEachAsync(results, settings.concurrency, async (t) => {
            if (t.topicIds && t.topicIds.length > 0) {
                const ids = await getSourceIds(t.topicIds);
                const timeRange = t.getTemporalRange();
                if (timeRange) {
                    const idRange = await sourceIdLog.getIdsInRange(timeRange.startDate, timeRange.stopDate);
                    addToSet(unique, intersect(ids, idRange));
                }
                else {
                    addToSet(unique, ids);
                }
            }
        });
        return unique.size === 0 ? undefined : unique;
    }
    async function* getTopicSequence() {
        for await (const entry of sequence.all()) {
            const topicIds = entry.value.value;
            const topics = await getMultiple(topicIds);
            const block = {
                type: TextBlockType.Paragraph,
                blockId: entry.name,
                timestamp: entry.value.timestamp,
                value: collectBlockText(topics, "\n"),
                sourceIds: collectSourceIds(topics),
            };
            yield block;
        }
    }
    async function matchName(names, nameIndex, name, searchOptions) {
        const options = searchOptions.sourceNameSearchOptions ?? searchOptions;
        // Possible names of entities
        const nameIds = await names.nameIndex.getNearestText(name, options.maxMatches, options.minScore, names.nameAliases);
        if (nameIds && nameIds.length > 0) {
            // Load all topic Ids for those entities
            const matches = await nameIndex.getMultiple(nameIds, settings.concurrency);
            if (matches && matches.length > 0) {
                return unionMultiple(...matches);
            }
        }
        return undefined;
    }
}
//# sourceMappingURL=topics.js.map