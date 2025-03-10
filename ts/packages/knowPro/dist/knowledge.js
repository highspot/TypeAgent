// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { collections, getTopK } from "typeagent";
import { unionArrays } from "./collections.js";
export function facetValueToString(facet) {
    const value = facet.value;
    if (typeof value === "object") {
        return `${value.amount} ${value.units}`;
    }
    return value.toString();
}
export function mergeTopics(semanticRefs, semanticRefMatches, topK) {
    let mergedTopics = new Map();
    for (let semanticRefMatch of semanticRefMatches) {
        const semanticRef = semanticRefs[semanticRefMatch.semanticRefIndex];
        if (semanticRef.knowledgeType !== "topic") {
            continue;
        }
        const topic = semanticRef.knowledge;
        const existing = mergedTopics.get(topic.text);
        if (existing) {
            if (existing.score < semanticRefMatch.score) {
                existing.score = semanticRefMatch.score;
            }
        }
        else {
            mergedTopics.set(topic.text, {
                item: topic,
                score: semanticRefMatch.score,
            });
        }
    }
    let topKTopics = topK !== undefined && topK > 0
        ? getTopK(mergedTopics.values(), topK)
        : mergedTopics.values();
    const mergedKnowledge = [];
    for (const scoredTopic of topKTopics) {
        mergedKnowledge.push({
            knowledgeType: "topic",
            knowledge: scoredTopic.item,
            score: scoredTopic.score,
        });
    }
    return mergedKnowledge;
}
export function mergedEntities(semanticRefs, semanticRefMatches, topK) {
    return mergeScoredEntities(getScoredEntities(semanticRefs, semanticRefMatches), topK);
}
function mergeScoredEntities(scoredEntities, topK) {
    let mergedEntities = new Map();
    for (let scoredEntity of scoredEntities) {
        const mergedEntity = concreteToMergedEntity(scoredEntity.item);
        const existing = mergedEntities.get(mergedEntity.name);
        if (existing) {
            if (unionEntities(existing.item, mergedEntity)) {
                if (existing.score < scoredEntity.score) {
                    existing.score = scoredEntity.score;
                }
            }
        }
        else {
            mergedEntities.set(mergedEntity.name, {
                item: mergedEntity,
                score: scoredEntity.score,
            });
        }
    }
    let topKEntities = topK !== undefined && topK > 0
        ? getTopK(mergedEntities.values(), topK)
        : mergedEntities.values();
    const mergedKnowledge = [];
    for (const scoredEntity of topKEntities) {
        mergedKnowledge.push({
            knowledgeType: "entity",
            knowledge: mergedToConcreteEntity(scoredEntity.item),
            score: scoredEntity.score,
        });
    }
    return mergedKnowledge;
}
/**
 * In place union
 */
function unionEntities(to, other) {
    if (to.name !== other.name) {
        return false;
    }
    to.type = unionArrays(to.type, other.type);
    to.facets = unionFacets(to.facets, other.facets);
    return true;
}
function concreteToMergedEntity(entity) {
    let type = [...entity.type];
    collections.lowerAndSort(type);
    return {
        name: entity.name.toLowerCase(),
        type: type,
        facets: entity.facets ? facetsToMergedFacets(entity.facets) : undefined,
    };
}
function mergedToConcreteEntity(mergedEntity) {
    const entity = {
        name: mergedEntity.name,
        type: mergedEntity.type,
    };
    if (mergedEntity.facets && mergedEntity.facets.size > 0) {
        entity.facets = mergedFacetsToFacets(mergedEntity.facets);
    }
    return entity;
}
function facetsToMergedFacets(facets) {
    const mergedFacets = new collections.MultiMap();
    for (const facet of facets) {
        const name = facet.name.toLowerCase();
        const value = facetValueToString(facet).toLowerCase();
        mergedFacets.addUnique(name, value);
    }
    return mergedFacets;
}
function mergedFacetsToFacets(mergedFacets) {
    const facets = [];
    for (const facetName of mergedFacets.keys()) {
        const facetValues = mergedFacets.get(facetName);
        if (facetValues && facetValues.length > 0) {
            const facet = {
                name: facetName,
                value: facetValues.join("; "),
            };
            facets.push(facet);
        }
    }
    return facets;
}
/**
 * In place union
 */
function unionFacets(to, other) {
    if (to === undefined) {
        return other;
    }
    if (other === undefined) {
        return to;
    }
    for (const facetName of other.keys()) {
        const facetValues = other.get(facetName);
        if (facetValues) {
            for (let i = 0; i < facetValues.length; ++i) {
                to.addUnique(facetName, facetValues[i]);
            }
        }
    }
    return to;
}
function* getScoredEntities(semanticRefs, semanticRefMatches) {
    for (let semanticRefMatch of semanticRefMatches) {
        const semanticRef = semanticRefs[semanticRefMatch.semanticRefIndex];
        if (semanticRef.knowledgeType === "entity") {
            yield {
                score: semanticRefMatch.score,
                item: semanticRef.knowledge,
            };
        }
    }
}
//# sourceMappingURL=knowledge.js.map