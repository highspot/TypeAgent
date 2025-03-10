// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { MessageSourceRole, } from "typeagent";
import { createSearchResponse } from "./searchResponse.js";
import { SetOp } from "../setOperations.js";
import { createKnowledgeActionTranslator, } from "./knowledgeActions.js";
import { createAnswerGenerator, } from "./answerGenerator.js";
import { createTopicSearchOptions } from "./topics.js";
export function createSearchProcessor(conversation, actionModel, answerModel, searchProcessorSettings) {
    const settings = searchProcessorSettings ?? {};
    const searchTranslator = createKnowledgeActionTranslator(actionModel);
    const answers = createAnswerGenerator(answerModel);
    const thisProcessor = {
        settings,
        actions: searchTranslator,
        answers,
        search,
        searchTerms,
        searchTermsV2,
        buildContext,
        generateAnswer,
        generateAnswerV2,
        searchMessages,
    };
    return thisProcessor;
    async function search(query, options) {
        const context = await buildContext(query, options);
        const actionResult = await searchTranslator.translateSearch(query, context);
        if (!actionResult.success) {
            return undefined;
        }
        let action = actionResult.data;
        if (options.progress) {
            options.progress(action);
        }
        const rr = {
            action,
        };
        switch (rr.action.actionName) {
            case "unknown":
                break;
            case "getAnswer":
                rr.response = await handleGetAnswers(query, rr.action, options);
                break;
        }
        return rr;
    }
    async function searchTerms(query, filters, options) {
        const context = await buildContext(query, options);
        let action;
        if (filters && filters.length > 0) {
            // Filters already provided
            action = {
                actionName: "getAnswer",
                parameters: {
                    filters,
                },
            };
        }
        else {
            const actionResult = await searchTranslator.translateSearchTerms(query, context);
            if (!actionResult.success) {
                return undefined;
            }
            action = actionResult.data;
        }
        if (options.progress) {
            options.progress(action);
        }
        const rr = {
            action,
        };
        if (rr.action.actionName !== "unknown") {
            rr.response = await handleGetAnswersTerms(query, rr.action, options);
        }
        return rr;
    }
    async function searchTermsV2(query, filters, options, history) {
        const context = await buildContext(query, options, history);
        let action;
        if (filters && filters.length > 0) {
            // Filters already provided
            action = {
                actionName: "getAnswer",
                parameters: {
                    question: query,
                    filters,
                },
            };
        }
        else {
            const actionResult = await searchTranslator.translateSearchTermsV2(query, context);
            if (!actionResult.success) {
                return undefined;
            }
            action = actionResult.data;
        }
        if (options.progress) {
            options.progress(action);
        }
        const rr = {
            action,
        };
        if (rr.action.actionName !== "unknown") {
            rr.response = await handleGetAnswersTermsV2(query, rr.action, options);
        }
        return rr;
    }
    async function searchMessages(query, options, maxMessageChars) {
        const response = createSearchResponse();
        //await fallbackSearch(query, undefined, response, options);
        const messageIndex = await conversation.getMessageIndex();
        if (messageIndex) {
            const matches = await messageIndex.nearestNeighbors(query, options.maxMatches, options.minScore);
            if (matches.length > 0) {
                response.messageIds = matches.map((m) => m.item);
                response.messages = await conversation.loadMessages(response.messageIds);
                if (maxMessageChars && maxMessageChars > 0) {
                    let charCount = 0;
                    let i = 0;
                    for (; i < response.messages.length; ++i) {
                        const messageLength = response.messages[i].value.value.length;
                        if (charCount + messageLength > maxMessageChars) {
                            break;
                        }
                        charCount += messageLength;
                    }
                    if (i > 0 && i < response.messages.length) {
                        response.messageIds.splice(i);
                        response.messages.splice(i);
                    }
                }
                response.answer = await answers.generateAnswer(query, undefined, response, true, false);
            }
        }
        return response;
    }
    async function buildContext(query, options, history) {
        let context;
        const timeRange = await conversation.messages.getTimeRange();
        if (timeRange) {
            context ??= [];
            context.push({
                role: MessageSourceRole.system,
                content: `ONLY IF user request explicitly asks for time ranges, THEN use the CONVERSATION TIME RANGE: "${timeRange.startDate} to ${timeRange.stopDate}"`,
            });
        }
        if (settings.contextProvider) {
            context ??= [];
            context.push(...(await settings.contextProvider.getSections(query)));
        }
        if (history && history.length > 0) {
            context ??= [];
            context.push(...history);
        }
        return context;
    }
    async function handleGetAnswers(query, action, options) {
        const responseType = action.parameters.responseType;
        const topLevelTopicSummary = isTopicSummaryRequest(action);
        const topicLevel = topLevelTopicSummary ? 2 : 1;
        const searchOptions = {
            entity: {
                maxMatches: options.maxMatches,
                minScore: options.minScore,
                combinationSetOp: SetOp.IntersectUnion,
                loadEntities: true,
            },
            topic: {
                maxMatches: topLevelTopicSummary
                    ? Number.MAX_SAFE_INTEGER
                    : options.maxMatches,
                minScore: options.minScore,
                loadTopics: responseType === "Answer" || responseType === "Topics",
            },
            topicLevel,
            loadMessages: responseType === "Answer" || hasActionFilter(action),
        };
        searchOptions.action = {
            maxMatches: options.maxMatches,
            minScore: options.minScore,
            verbSearchOptions: {
                maxMatches: 1,
                minScore: options.minScore,
            },
            loadActions: false,
        };
        adjustRequest(query, action, searchOptions);
        const response = await conversation.search(action.parameters.filters, searchOptions);
        await adjustResponse(query, action, response, searchOptions, options);
        response.answer = await answers.generateAnswer(query, action.parameters.responseStyle, response, false);
        if (response.answer?.type === "NoAnswer" && options.fallbackSearch) {
            await fallbackSearch(query, action.parameters.responseStyle, response, options.fallbackSearch);
        }
        return response;
    }
    async function handleGetAnswersTerms(query, action, options) {
        const topLevelTopicSummary = isSummaryRequest(action);
        const searchOptions = createSearchOptions(topLevelTopicSummary, options);
        const response = await conversation.searchTerms(action.parameters.filters, searchOptions);
        await adjustMessages(query, response, searchOptions, options);
        response.topKSettings = answers.settings.topK;
        if (!options.skipAnswerGeneration) {
            console.log("Generating answer for search terms");
            console.log("Query: ", query);
            console.log("Response: ", response);
            console.log("ENTITIES: ", response.entities.map((e) => e.entities));
            console.log("Options: ", options);
            await generateAnswerForSearchTerms(query, response, options);
        }
        return response;
    }
    async function handleGetAnswersTermsV2(query, action, options) {
        query = action.parameters.question;
        const topLevelTopicSummary = isSummaryRequestV2(action);
        const searchOptions = createSearchOptions(topLevelTopicSummary, options, false);
        await applyThreadFilters(action.parameters.question, action.parameters.filters, options.threadSearch);
        const response = await conversation.searchTermsV2(action.parameters.filters, searchOptions);
        await adjustMessages(query, response, searchOptions, options);
        response.topKSettings = answers.settings.topK;
        if (!options.skipAnswerGeneration) {
            await generateAnswerForSearchTerms(query, response, options);
        }
        return response;
    }
    async function generateAnswer(query, actionResponse, options) {
        if (actionResponse.response) {
            await generateAnswerForSearchTerms(query, actionResponse.response, options);
        }
        return actionResponse;
    }
    async function generateAnswerV2(query, actionResponse, options) {
        if (actionResponse.action.actionName === "getAnswer") {
            query = actionResponse.action.parameters.question;
        }
        if (actionResponse.response) {
            await generateAnswerForSearchTerms(query, actionResponse.response, options);
        }
        return actionResponse;
    }
    async function generateAnswerForSearchTerms(query, response, options, style) {
        response.answer = await answers.generateAnswer(query, style, response, false);
        if (response.answer?.type === "NoAnswer" && options.fallbackSearch) {
            await fallbackSearch(query, undefined, response, options.fallbackSearch);
        }
    }
    function isTopicSummaryRequest(action) {
        const params = action.parameters;
        return (params.responseType === "Topics" &&
            !params.filters.some((f) => f.filterType !== "Topic"));
    }
    function isSummaryRequest(action) {
        const filters = action.parameters.filters;
        for (const filter of filters) {
            if (filter.terms && filter.terms.length > 0) {
                return false;
            }
        }
        return true;
    }
    function isSummaryRequestV2(action) {
        const filters = action.parameters.filters;
        for (const filter of filters) {
            if (filter.action ||
                (filter.searchTerms && filter.searchTerms.length > 0)) {
                return false;
            }
        }
        return true;
    }
    function hasActionFilter(action) {
        const params = action.parameters;
        return !params.filters.some((f) => f.filterType !== "Action");
    }
    function ensureTopicFilter(query, filters) {
        for (const filter of filters) {
            if (filter.filterType === "Topic") {
                if (filter.timeRange || filter.topics) {
                    return;
                }
                filter.topics ??= query;
                return;
            }
        }
        filters.push({
            filterType: "Topic",
            topics: query,
        });
    }
    function ensureEntityFilter(query, filters) {
        for (const filter of filters) {
            if (filter.filterType === "Entity") {
                if (filter.timeRange || filter.name || filter.type) {
                    return;
                }
            }
        }
        filters.push({
            filterType: "Entity",
            name: query,
        });
    }
    function adjustRequest(query, action, searchOptions) {
        if (searchOptions.topic && searchOptions.topic.loadTopics) {
            ensureTopicFilter(isTopicSummaryRequest(action) ? "*" : query, action.parameters.filters);
        }
        if (searchOptions.entity && searchOptions.entity.loadEntities) {
            ensureEntityFilter(query, action.parameters.filters);
        }
    }
    async function adjustResponse(query, action, response, options, processingOptions) {
        if (action.parameters.responseType == "Topics" &&
            !responseHasTopics(response)) {
            await ensureEntitiesLoaded(response);
        }
        await adjustMessages(query, response, options, processingOptions);
    }
    async function adjustMessages(query, response, options, processingOptions) {
        if ((!response.messages &&
            options.loadMessages &&
            processingOptions.fallbackSearch) ||
            (response.messages &&
                response.messages.length > processingOptions.maxMessages)) {
            const result = await conversation.searchMessages(query, {
                // No min score. We already know that the messages are relevant. We are using embeddings to pick the most relevant
                maxMatches: processingOptions.maxMessages,
            }, response.messageIds);
            if (result) {
                response.messageIds = result.messageIds;
                response.messages = result.messages;
            }
            else if (response.messages) {
                response.messageIds = response.messageIds.slice(0, processingOptions.maxMessages);
                response.messages = response.messages.slice(0, processingOptions.maxMessages);
            }
        }
    }
    async function ensureEntitiesLoaded(response) {
        const entityIndex = await conversation.getEntityIndex();
        for (const result of response.entities) {
            if (result.entityIds && !result.entities) {
                result.entities = await entityIndex.getEntities(result.entityIds);
            }
        }
    }
    function responseHasTopics(response) {
        for (const _ of response.allTopics()) {
            return true;
        }
        return false;
    }
    async function fallbackSearch(query, style, response, options) {
        const sResult = await conversation.searchMessages(query, options);
        if (sResult) {
            response.fallbackUsed = true;
            response.messageIds = sResult.messageIds;
            response.messages = sResult.messages;
            response.answer = await answers.generateAnswer(query, style, response, true);
        }
    }
    async function applyThreadFilters(query, filters, options) {
        const threadIndex = await conversation.getThreadIndex();
        if (!options) {
            if (await threadIndex.matchTags(filters)) {
                options = { maxMatches: 1, minScore: 0.8 };
            }
        }
        if (options) {
            const threads = await threadIndex.getNearest(query, options.maxMatches, options.minScore);
            if (threads.length === 0) {
                return;
            }
            const thread = threads[0];
            for (const filter of filters) {
                if (!filter.timeRange) {
                    filter.timeRange = thread.timeRange;
                }
            }
        }
    }
    function createSearchOptions(topLevelTopicSummary, options, loadActions = false) {
        const topicLevel = topLevelTopicSummary ? 2 : 1;
        const topicOptions = createTopicSearchOptions(topLevelTopicSummary);
        topicOptions.minScore = options.minScore;
        const searchOptions = {
            entity: options.entitySearch ??
                settings.defaultEntitySearchOptions ?? {
                maxMatches: options.maxMatches,
                minScore: options.minScore,
                loadEntities: true,
            },
            topic: topicOptions,
            topicLevel,
            loadMessages: !topLevelTopicSummary,
        };
        searchOptions.action = {
            maxMatches: options.maxMatches,
            minScore: options.minScore,
            verbSearchOptions: {
                maxMatches: 1,
                minScore: options.minScore,
            },
            loadActions,
        };
        if (options.skipTopicSearch) {
            searchOptions.topic = undefined;
        }
        if (options.skipEntitySearch) {
            searchOptions.entity = undefined;
        }
        if (options.skipActionSearch) {
            searchOptions.action = undefined;
        }
        if (options.skipMessages) {
            searchOptions.loadMessages = false;
        }
        return searchOptions;
    }
}
//# sourceMappingURL=searchProcessor.js.map