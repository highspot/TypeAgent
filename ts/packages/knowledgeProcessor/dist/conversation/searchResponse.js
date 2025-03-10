// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { collections } from "typeagent";
import { mergeActions } from "./actions.js";
import { getTopMergedEntities, } from "./entities.js";
import { uniqueFrom } from "../setOperations.js";
export function createSearchResponse(topicLevel) {
    const response = {
        entities: [],
        topics: [],
        actions: [],
        topicLevel: topicLevel ?? 1,
        hasAnswer,
        getAnswer,
        getTopics,
        getEntities,
        getActions,
        allTopics,
        allTopicIds,
        topicTimeRanges,
        allRawEntities,
        allEntityIds,
        allEntityNames,
        entityTimeRanges,
        allActions,
        allActionIds,
        actionTimeRanges,
        getTotalMessageLength,
        hasTopics,
        hasEntities,
        hasActions,
        hasHits,
        hasMessages,
    };
    let lastEntities;
    return response;
    function hasAnswer() {
        return (response.answer !== undefined &&
            response.answer.answer !== undefined &&
            response.answer.answer.length > 0);
    }
    function getAnswer() {
        return response.answer?.answer ?? "";
    }
    function getTopics() {
        return uniqueFrom(allTopics());
    }
    function getEntities(topK) {
        topK = topK ?? response.topKSettings?.entitiesTopK ?? 3;
        if (lastEntities && lastEntities.score === topK) {
            return lastEntities.item;
        }
        let entities = getTopMergedEntities(allRawEntities(), topK);
        entities ??= [];
        lastEntities = { score: topK, item: entities };
        return entities;
    }
    function getActions(topK) {
        topK = topK ?? response.topKSettings?.actionsTopK ?? 3;
        // Returned ranked by most relevant
        const actionGroups = mergeActions(allActions(), false);
        return topK > 0 ? actionGroups.slice(0, topK) : actionGroups;
    }
    function* allTopics() {
        for (const result of response.topics) {
            if (result.topics && result.topics.length > 0) {
                for (const topic of result.topics) {
                    yield topic;
                }
            }
        }
    }
    function* allTopicIds() {
        for (const result of response.topics) {
            if (result.topicIds && result.topicIds.length > 0) {
                for (const id of result.topicIds) {
                    yield id;
                }
            }
        }
    }
    function* allEntityIds() {
        for (const result of response.entities) {
            if (result.entityIds && result.entityIds.length > 0) {
                for (const id of result.entityIds) {
                    yield id;
                }
            }
        }
    }
    function* allRawEntities() {
        for (const result of response.entities) {
            if (result.entities && result.entities.length > 0) {
                for (const entity of result.entities) {
                    yield entity;
                }
            }
        }
    }
    function allEntityNames() {
        return uniqueFrom(allRawEntities(), (e) => e.name, true);
    }
    function entityTimeRanges() {
        return response.entities.length > 0
            ? collections.mapAndFilter(response.entities, (e) => e.getTemporalRange())
            : [];
    }
    function topicTimeRanges() {
        return response.topics.length > 0
            ? collections.mapAndFilter(response.topics, (t) => t.getTemporalRange())
            : [];
    }
    function* allActions() {
        for (const result of response.actions) {
            if (result.actions && result.actions.length > 0) {
                for (const action of result.actions) {
                    yield action;
                }
            }
        }
    }
    function* allActionIds() {
        for (const result of response.actions) {
            if (result.actionIds) {
                for (const id of result.actionIds) {
                    yield id;
                }
            }
        }
    }
    function actionTimeRanges() {
        return response.actions.length > 0
            ? collections.mapAndFilter(response.actions, (a) => a.getTemporalRange())
            : [];
    }
    function getTotalMessageLength() {
        let length = 0;
        if (response.messages) {
            for (const message of response.messages) {
                length += message.value.value.length;
            }
        }
        return length;
    }
    function hasTopics() {
        for (const _ of allTopics()) {
            return true;
        }
        return false;
    }
    function hasEntities() {
        for (const _ of allRawEntities()) {
            return true;
        }
        return false;
    }
    function hasActions() {
        for (const _ of allActions()) {
            return true;
        }
        return false;
    }
    function hasMessages() {
        return (response.messageIds !== undefined && response.messageIds.length > 0);
    }
    function hasHits() {
        return hasMessages() || hasEntities() || hasTopics();
    }
}
//# sourceMappingURL=searchResponse.js.map