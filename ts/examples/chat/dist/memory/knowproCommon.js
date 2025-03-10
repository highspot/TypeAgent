// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import * as knowLib from "knowledge-processor";
import * as kp from "knowpro";
export function textLocationToString(location) {
    let text = `MessageIndex: ${location.messageIndex}`;
    if (location.chunkIndex) {
        text += `\nChunkIndex: ${location.chunkIndex}`;
    }
    if (location.charIndex) {
        text += `\nCharIndex: ${location.charIndex}`;
    }
    return text;
}
export async function matchFilterToConversation(conversation, filter, knowledgeType, searchOptions, useAnd = false) {
    let termGroup = termFilterToSearchGroup(filter, useAnd);
    if (filter.action) {
        let actionGroup = actionFilterToSearchGroup(filter.action, useAnd);
        // Just flatten for now...
        termGroup.terms.push(...actionGroup.terms);
    }
    let when = termFilterToWhenFilter(filter);
    when.knowledgeType = knowledgeType;
    let searchResults = await kp.searchConversation(conversation, termGroup, when, searchOptions);
    if (useAnd && (!searchResults || searchResults.size === 0)) {
        // Try again with OR
        termGroup = termFilterToSearchGroup(filter, false);
        searchResults = await kp.searchConversation(conversation, termGroup, when);
    }
    return searchResults;
}
export function termFilterToSearchGroup(filter, and) {
    const searchTermGroup = {
        booleanOp: and ? "and" : "or",
        terms: [],
    };
    if (filter.searchTerms && filter.searchTerms.length > 0) {
        for (const st of filter.searchTerms) {
            searchTermGroup.terms.push({ term: { text: st } });
        }
    }
    return searchTermGroup;
}
export function termFilterToWhenFilter(filter) {
    let when = {};
    if (filter.timeRange) {
        when.dateRange = {
            start: knowLib.conversation.toStartDate(filter.timeRange.startDate),
            end: knowLib.conversation.toStopDate(filter.timeRange.stopDate),
        };
    }
    return when;
}
export function actionFilterToSearchGroup(action, and) {
    const searchTermGroup = {
        booleanOp: and ? "and" : "or",
        terms: [],
    };
    if (action.verbs) {
        searchTermGroup.terms.push(...action.verbs.words.map((v) => {
            return kp.createPropertySearchTerm(kp.PropertyNames.Verb, v);
        }));
    }
    if (action.subject !== "none") {
        searchTermGroup.terms.push(kp.createPropertySearchTerm(kp.PropertyNames.Subject, action.subject.subject));
    }
    if (action.object) {
        searchTermGroup.terms.push(kp.createSearchTerm(action.object));
    }
    return searchTermGroup;
}
//# sourceMappingURL=knowproCommon.js.map