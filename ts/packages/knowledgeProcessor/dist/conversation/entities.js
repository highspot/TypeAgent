// Copyright (c) Microsoft Corporation and Henry Lucco.
// Licensed under the MIT License.
import { asyncArray, collections, } from "typeagent";
import { createTermSet, } from "../textIndex.js";
import { createKnowledgeStoreOnStorage, } from "../knowledgeStore.js";
import { knowledgeValueToString } from "./knowledge.js";
import { TextBlockType } from "../text.js";
import { SetOp, addToSet, createHitTable, intersect, 
//intersectArrays,
intersectMultiple, intersectUnionMultiple, removeUndefined, unionArrays, unionMultiple, uniqueFrom, } from "../setOperations.js";
import { filterTemporalSequence, getRangeOfTemporalSequence, itemsFromTemporalSequence, } from "../temporal.js";
import { toStopDate, toStartDate, isFilterWithTagScope, } from "./knowledgeActions.js";
import { createFileSystemStorageProvider, } from "../storageProvider.js";
import { createAliasMatcher } from "../textMatcher.js";
export function createEntitySearchOptions(loadEntities = true) {
    return {
        maxMatches: 2,
        minScore: 0.8,
        nameSearchOptions: {
            maxMatches: 5,
        },
        facetSearchOptions: {
            maxMatches: 10,
        },
        combinationSetOp: SetOp.IntersectUnion,
        loadEntities,
        alwaysUseTags: false,
    };
}
export function createEntityIndex(settings, rootPath, folderSettings, fSys) {
    return createEntityIndexOnStorage(settings, rootPath, createFileSystemStorageProvider(rootPath, folderSettings, fSys));
}
export async function createEntityIndexOnStorage(settings, rootPath, storageProvider) {
    const [entityStore, nameIndex, typeIndex, facetIndex] = await Promise.all([
        createKnowledgeStoreOnStorage(settings, rootPath, storageProvider),
        storageProvider.createTextIndex(settings, rootPath, "names", "TEXT"),
        storageProvider.createTextIndex(settings, rootPath, "types", "TEXT"),
        storageProvider.createTextIndex(settings, rootPath, "facets", "TEXT"),
    ]);
    const nameAliases = await createAliasMatcher(nameIndex, storageProvider, rootPath, "nameAliases", "TEXT");
    const noiseTerms = createTermSet();
    return {
        ...entityStore,
        nameIndex,
        typeIndex,
        facetIndex,
        nameAliases,
        noiseTerms,
        entities: () => entityStore.entries(),
        get: (id) => entityStore.get(id),
        getMultiple,
        getSourceIds,
        getEntities,
        getEntityIdsInTimeRange,
        add,
        addMultiple,
        search,
        searchTerms,
        searchTermsV2,
        loadSourceIds,
    };
    async function getMultiple(ids) {
        const entities = await asyncArray.mapAsync(ids, settings.concurrency, (id) => entityStore.get(id));
        return removeUndefined(entities);
    }
    async function getSourceIds(ids) {
        const entities = await getMultiple(ids);
        const unique = uniqueFrom(entities, (e) => e.sourceIds, true);
        return unique ? unique : [];
    }
    async function getEntities(ids) {
        return await asyncArray.mapAsync(ids, settings.concurrency, async (id) => {
            const entity = (await entityStore.get(id));
            return entity.value;
        });
    }
    async function getEntityIdsInTimeRange(startAt, stopAt) {
        // Get all entity ids seen in this date range
        const temporalSequence = await entityStore.sequence.getEntriesInRange(startAt, stopAt);
        return itemsFromTemporalSequence(temporalSequence);
    }
    async function add(extractedEntity, id) {
        const entityId = id ? id : await entityStore.add(extractedEntity);
        const sourceIds = [entityId];
        await Promise.all([
            addName(extractedEntity.value.name, sourceIds),
            addTypes(extractedEntity.value.type, sourceIds),
            addFacets(extractedEntity.value.facets, sourceIds),
        ]);
        return entityId;
    }
    async function addMultiple(entities, ids) {
        if (ids && ids.length !== entities.length) {
            throw Error("Id length mismatch");
        }
        // TODO: parallelize
        return asyncArray.mapAsync(entities, 1, (entity, i) => add(entity, ids ? ids[i] : undefined));
    }
    async function addName(name, sourceIds) {
        await nameIndex.put(name, sourceIds);
    }
    async function addTypes(type, sourceIds) {
        const typeEntries = type.map((t) => {
            return {
                value: t,
                sourceIds,
                type: TextBlockType.Word,
            };
        });
        await typeIndex.putMultiple(typeEntries);
    }
    async function addFacets(facets, sourceIds) {
        if (facets && facets.length > 0) {
            const facetEntries = facets.map((f) => {
                return {
                    value: facetToString(f),
                    sourceIds,
                    type: TextBlockType.Word,
                };
            });
            await facetIndex.putMultiple(facetEntries);
        }
    }
    async function search(filter, options) {
        const results = createSearchResults();
        let typeMatchIds;
        let nameMatchIds;
        let nameTypeMatchIds;
        if (filter.timeRange) {
            results.temporalSequence =
                await entityStore.sequence.getEntriesInRange(toStartDate(filter.timeRange.startDate), toStopDate(filter.timeRange.stopDate));
        }
        if (filter.type && filter.type.length > 0) {
            typeMatchIds = await typeIndex.getNearestMultiple(filter.type, options.maxMatches, options.minScore);
        }
        if (filter.name && filter.name.length > 0) {
            nameMatchIds = await nameIndex.getNearest(filter.name, options.nameSearchOptions?.maxMatches ?? options.maxMatches, options.nameSearchOptions?.minScore ?? options.minScore);
            if (nameMatchIds === undefined || nameMatchIds.length == 0) {
                // The AI will often mix types and names...
                nameTypeMatchIds = await typeIndex.getNearest(filter.name, options.maxMatches, options.minScore);
            }
            if (nameTypeMatchIds && nameTypeMatchIds.length > 0) {
                nameMatchIds = unionMultiple(nameMatchIds, nameTypeMatchIds);
            }
        }
        results.entityIds = [
            ...intersectMultiple(intersectUnionMultiple(typeMatchIds, nameMatchIds), itemsFromTemporalSequence(results.temporalSequence)),
        ];
        if (results.entityIds && results.temporalSequence) {
            // The temporal sequence maintains all entity ids seen at a timestamp.
            // Since we identified specific entity ids, we remove the other ones
            results.temporalSequence = filterTemporalSequence(results.temporalSequence, results.entityIds);
        }
        if (options.loadEntities && results.entityIds) {
            results.entities = await getEntities(results.entityIds);
        }
        return results;
    }
    async function searchTerms(filter, options) {
        const terms = combineTerms(filter);
        return matchEntities(terms, filter.timeRange, options);
    }
    async function searchTermsV2(filterOrScoped, options) {
        let filter;
        let tags;
        if (isFilterWithTagScope(filterOrScoped)) {
            filter = filterOrScoped.filter;
            tags = filterOrScoped.tags;
        }
        else {
            filter = filterOrScoped;
        }
        if (filter.searchTerms && filter.searchTerms.length > 0) {
            if (options.alwaysUseTags && !tags) {
                tags = filter.searchTerms;
            }
            return matchEntities(filter.searchTerms, filter.timeRange, options, tags);
        }
        return createSearchResults();
    }
    async function matchEntities(terms, timeRange, options, tags) {
        const results = createSearchResults();
        if (timeRange) {
            results.temporalSequence =
                await entityStore.sequence.getEntriesInRange(toStartDate(timeRange.startDate), toStopDate(timeRange.stopDate));
        }
        let tagMatchIds;
        if (tags) {
            tagMatchIds = await entityStore.getByTag(tags);
        }
        terms = terms.filter((t) => !noiseTerms.has(t));
        if (terms && terms.length > 0) {
            const entityIdHitTable = createHitTable();
            const scoreBoost = 100;
            await Promise.all([
                nameIndex.getNearestHitsMultiple(terms, entityIdHitTable, options.nameSearchOptions?.maxMatches ?? options.maxMatches, options.nameSearchOptions?.minScore ?? options.minScore, scoreBoost, nameAliases),
                typeIndex.getNearestHitsMultiple(terms, entityIdHitTable, options.maxMatches, options.minScore, scoreBoost),
                facetIndex.getNearestHitsMultiple(terms, entityIdHitTable, options.facetSearchOptions?.maxMatches, options.facetSearchOptions?.minScore ?? options.minScore),
            ]);
            entityIdHitTable.roundScores(2);
            let entityIdHits = entityIdHitTable
                .getTopK(determineTopK(options))
                .sort();
            results.entityIds = [
                ...intersectMultiple(entityIdHits, tagMatchIds, itemsFromTemporalSequence(results.temporalSequence)),
            ];
        }
        if (results.entityIds && results.temporalSequence) {
            // The temporal sequence maintains all entity ids seen at a timestamp.
            // Since we identified specific entity ids, we remove the other ones
            results.temporalSequence = filterTemporalSequence(results.temporalSequence, results.entityIds);
        }
        if (options.loadEntities && results.entityIds) {
            results.entities = await getEntities(results.entityIds);
        }
        return results;
    }
    function combineTerms(filter) {
        let terms;
        if (filter.verbs && filter.verbs.length > 0) {
            terms = [];
            terms.push(...filter.verbs);
            if (filter.terms && filter.terms.length > 0) {
                terms.push(...filter.terms);
            }
        }
        return terms ?? filter.terms;
    }
    async function loadSourceIds(sourceIdLog, results, unique) {
        unique ??= new Set();
        if (results.length === 0) {
            return unique;
        }
        await asyncArray.forEachAsync(results, settings.concurrency, async (e) => {
            if (e.entityIds && e.entityIds.length > 0) {
                const ids = await getSourceIds(e.entityIds);
                const timeRange = e.getTemporalRange();
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
    function determineTopK(options) {
        const topK = options.topK;
        return topK === undefined || topK < 10 ? 10 : topK;
    }
}
function createSearchResults() {
    return {
        getTemporalRange() {
            return getRangeOfTemporalSequence(this.temporalSequence);
        },
    };
}
export function entityToString(entity) {
    let text = entity.name;
    text += "\n";
    text += entity.type.join(", ");
    if (entity.facets) {
        text += "\n";
        text += entity.facets.join("\n");
    }
    return text;
}
export function mergeEntities(entities) {
    return mergeCompositeEntities(toComposite(entities));
    function* toComposite(entities) {
        for (const entity of entities) {
            yield toCompositeEntity(entity);
        }
    }
}
export function getTopMergedEntities(rawEntities, topK = -1) {
    const mergedEntities = mergeEntities(rawEntities);
    let entities;
    if (mergedEntities.size > 0) {
        // Sort in hit count order
        entities = [...mergedEntities.values()]
            .sort((x, y) => y.count - x.count)
            .map((e) => e.value);
        entities = topK > 0 ? entities.slice(0, topK) : entities;
    }
    return entities;
}
export function mergeCompositeEntities(entities) {
    const merged = new Map();
    for (let entity of entities) {
        const existing = merged.get(entity.name);
        if (existing) {
            if (appendCompositeEntity(existing.value, entity)) {
                existing.count++;
            }
        }
        else {
            merged.set(entity.name, { value: entity, count: 1 });
        }
    }
    return merged;
}
export function appendCompositeEntity(x, y) {
    if (x.name !== y.name) {
        return false;
    }
    x.type = unionArrays(x.type, y.type);
    x.facets = unionArrays(x.facets, y.facets);
    return true;
}
export function toCompositeEntity(entity) {
    if (entity === undefined) {
        return {
            name: "undefined",
            type: ["undefined"],
        };
    }
    const composite = {
        name: entity.name,
        type: [...entity.type],
    };
    composite.name = composite.name.toLowerCase();
    collections.lowerAndSort(composite.type);
    if (entity.facets) {
        composite.facets = entity.facets.map((f) => facetToString(f));
        collections.lowerAndSort(composite.facets);
    }
    return composite;
}
export function toCompositeEntities(entities) {
    const merged = mergeCompositeEntities(collections.mapIterate(entities, (e) => toCompositeEntity(e.value)));
    return collections.mapIterate(merged.values(), (e) => e.value);
}
export function facetToString(facet) {
    return `${facet.name}="${knowledgeValueToString(facet.value)}"`;
}
export function facetMatch(x, y) {
    if (!collections.stringEquals(x.name, y.name, false)) {
        return false;
    }
    if (typeof x.value === "object") {
        if (typeof y.value === "object") {
            return (x.value.amount === y.value.amount &&
                x.value.units === y.value.units);
        }
        else {
            return false;
        }
    }
    else {
        return x.value === y.value;
    }
}
export function mergeEntityFacet(entity, facet) {
    entity.facets ??= [];
    // Look for an equal facet
    for (const f of entity.facets) {
        if (facetMatch(f, facet)) {
            break;
        }
    }
    entity.facets.push(facet);
}
export function pushFacet(entity, name, value) {
    entity.facets ??= [];
    entity.facets.push({ name, value });
}
export function entityFromRecord(ns, name, type, record) {
    let entity = {
        name: `${ns}:${name}`,
        type: [`${ns}:${type}`],
    };
    const facets = facetsFromRecord(record);
    if (facets) {
        entity.facets = facets;
    }
    return entity;
}
export function facetsFromRecord(record) {
    let facets;
    for (const name in record) {
        const value = record[name];
        if (value) {
            facets ??= [];
            facets.push({ name, value });
        }
    }
    return facets;
}
//# sourceMappingURL=entities.js.map