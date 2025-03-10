// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { asyncArray, collections, } from "typeagent";
import { createTermMap } from "../textIndex.js";
import { createKnowledgeStoreOnStorage, } from "../knowledgeStore.js";
import { getRangeOfTemporalSequence, itemsFromTemporalSequence, filterTemporalSequence, } from "../temporal.js";
import { addToSet, intersect, intersectUnionMultiple, unionMultiple, uniqueFrom, intersectMultiple, createHitTable, removeDuplicates, } from "../setOperations.js";
import { isValidEntityName, knowledgeValueToString, NoEntityName, } from "./knowledge.js";
import { toStopDate, toStartDate } from "./knowledgeActions.js";
import { facetToString } from "./entities.js";
import { createFileSystemStorageProvider, } from "../storageProvider.js";
import { getSubjectFromActionTerm } from "./knowledgeTermSearch2.js";
function createSearchResults() {
    return {
        getTemporalRange() {
            return getRangeOfTemporalSequence(this.temporalSequence);
        },
    };
}
export function createActionSearchOptions(loadActions = false) {
    return {
        maxMatches: 2,
        minScore: 0.8,
        verbSearchOptions: {
            maxMatches: 1,
            minScore: 0.8,
        },
        loadActions,
    };
}
export function createActionIndex(settings, getNameIndex, rootPath, folderSettings, fSys) {
    return createActionIndexOnStorage(settings, getNameIndex, rootPath, createFileSystemStorageProvider(rootPath, folderSettings, fSys));
}
export async function createActionIndexOnStorage(settings, getEntityNameIndex, rootPath, storageProvider) {
    // Initialize indexes
    const [actionStore, verbIndex, subjectIndex, objectIndex, indirectObjectIndex,] = await Promise.all([
        createKnowledgeStoreOnStorage(settings, rootPath, storageProvider),
        storageProvider.createTextIndex(settings, rootPath, "verbs", "TEXT"),
        storageProvider.createIndex(rootPath, "subjects", "TEXT"),
        storageProvider.createIndex(rootPath, "objects", "TEXT"),
        storageProvider.createIndex(rootPath, "indirectObjects", "TEXT"),
    ]);
    const verbTermMap = createTermMap();
    return {
        ...actionStore,
        verbTermMap,
        add,
        addMultiple,
        getActions,
        getSourceIds,
        search,
        searchTerms,
        searchTermsV2,
        loadSourceIds,
        getAllVerbs,
    };
    async function add(action, id) {
        id = await actionStore.add(action, id);
        const postings = [id];
        const names = await getEntityNameIndex();
        await Promise.all([
            addVerb(action.value, postings),
            addName(names, subjectIndex, action.value.subjectEntityName, postings),
            addName(names, objectIndex, action.value.objectEntityName, postings),
            addName(names, indirectObjectIndex, action.value.indirectObjectEntityName, postings),
        ]);
        return id;
    }
    async function addMultiple(items, ids) {
        if (ids && items.length !== ids?.length) {
            throw Error("Id length mismatch");
        }
        // TODO: parallelize
        return asyncArray.mapAsync(items, 1, (action, i) => add(action, ids ? ids[i] : undefined));
    }
    async function getSourceIds(ids) {
        const actions = await actionStore.getMultiple(ids);
        const unique = uniqueFrom(actions, (e) => e.sourceIds, true);
        return unique ? unique : [];
    }
    async function getActions(ids) {
        return await asyncArray.mapAsync(ids, settings.concurrency, async (id) => {
            const entity = (await actionStore.get(id));
            return entity.value;
        });
    }
    async function getAllVerbs() {
        return [...verbIndex.text()].sort();
    }
    async function addVerb(action, actionIds) {
        const fullVerb = actionVerbsToString(action.verbs, action.verbTense);
        await verbIndex.put(fullVerb, actionIds);
    }
    async function addName(names, nameIndex, name, actionIds) {
        if (isValidEntityName(name)) {
            const nameId = await names.nameIndex.getId(name);
            if (nameId) {
                await nameIndex.put(actionIds, nameId);
            }
        }
    }
    async function search(filter, options, otherTerms, timeRange, searchResults) {
        const results = searchResults ?? createSearchResults();
        if (timeRange) {
            results.temporalSequence = await matchTimeRange(timeRange);
        }
        const entityNames = await getEntityNameIndex();
        const [subjectToActionIds, objectToActionIds, indirectObjectToActionIds, termsToActionIds, verbToActionIds,] = await Promise.all([
            matchName(entityNames, subjectIndex, filter.subjectEntityName, options),
            matchName(entityNames, objectIndex, filter.objectEntityName, options),
            matchName(entityNames, indirectObjectIndex, filter.indirectObjectEntityName, options),
            matchTerms(entityNames, indirectObjectIndex, otherTerms, options),
            matchVerbs(filter, options),
        ]);
        const entityActionIds = intersectUnionMultiple(subjectToActionIds, objectToActionIds, indirectObjectToActionIds, termsToActionIds);
        results.actionIds = [
            ...intersectMultiple(entityActionIds, verbToActionIds, itemsFromTemporalSequence(results.temporalSequence)),
        ];
        if (results.actionIds && results.temporalSequence) {
            // The temporal sequence maintains all entity ids seen at a timestamp.
            // Since we identified specific entity ids, we remove the other ones
            results.temporalSequence = filterTemporalSequence(results.temporalSequence, results.actionIds);
        }
        if (options.loadActions && results.actionIds) {
            results.actions = await getActions(results.actionIds);
        }
        return results;
    }
    async function searchTerms(filter, options) {
        const results = createSearchResults();
        if (filter.timeRange) {
            results.temporalSequence = await matchTimeRange(filter.timeRange);
        }
        const entityNames = await getEntityNameIndex();
        const [subjectToActionIds, objectToActionIds, indirectToObjectIds, verbToActionIds,] = await Promise.all([
            matchTerms(entityNames, subjectIndex, filter.terms, options),
            matchTerms(entityNames, objectIndex, filter.terms, options),
            matchTerms(entityNames, indirectObjectIndex, filter.terms, options),
            matchVerbTerms(filter.verbs, undefined, options),
        ]);
        results.actionIds = [
            ...intersectMultiple(intersectUnionMultiple(subjectToActionIds, objectToActionIds, indirectToObjectIds), verbToActionIds, itemsFromTemporalSequence(results.temporalSequence)),
        ];
        if (results.actionIds && results.temporalSequence) {
            // The temporal sequence maintains all entity ids seen at a timestamp.
            // Since we identified specific entity ids, we remove the other ones
            results.temporalSequence = filterTemporalSequence(results.temporalSequence, results.actionIds);
        }
        if (options.loadActions && results.actionIds) {
            results.actions = await getActions(results.actionIds);
        }
        return results;
    }
    async function searchTermsV2(filter, options) {
        const results = createSearchResults();
        if (!filter.action) {
            return results;
        }
        if (filter.timeRange) {
            results.temporalSequence = await matchTimeRange(filter.timeRange);
        }
        await searchVerbTerm(filter.action, filter.searchTerms, filter.timeRange, options, results);
        if (results.actionIds && results.temporalSequence) {
            // The temporal sequence maintains all entity ids seen at a timestamp.
            // Since we identified specific entity ids, we remove the other ones
            results.temporalSequence = filterTemporalSequence(results.temporalSequence, results.actionIds);
        }
        if (options.loadActions && results.actionIds) {
            results.actions = await getActions(results.actionIds);
        }
        return results;
    }
    async function searchVerbTerm(actionTerm, otherTerms, timeRange, options, results) {
        const actionFilter = {
            filterType: "Action",
            subjectEntityName: getSubjectFromActionTerm(actionTerm) ?? NoEntityName,
            objectEntityName: actionTerm.object,
        };
        if (actionTerm.verbs) {
            actionFilter.verbFilter = {
                verbs: actionTerm.verbs.words,
                verbTense: actionTerm.verbs.verbTense,
            };
        }
        await search(actionFilter, options, otherTerms, timeRange, results);
    }
    async function matchName(entityNames, nameIndex, name, options) {
        if (isValidEntityName(name)) {
            // Possible names of entities
            const nameIds = await entityNames.nameIndex.getNearestText(name, options.maxMatches, options.minScore, entityNames.nameAliases);
            if (nameIds && nameIds.length > 0) {
                // Load all actions for those entities
                const matches = await nameIndex.getMultiple(nameIds, settings.concurrency);
                if (matches && matches.length > 0) {
                    return unionMultiple(...matches);
                }
            }
        }
        return undefined;
    }
    async function matchVerbs(filter, options) {
        if (filter.verbFilter && filter.verbFilter.verbs.length > 0) {
            return matchVerbTerms(filter.verbFilter.verbs, filter.verbFilter.verbTense, options);
        }
        return undefined;
    }
    async function matchTerms(entityNames, nameIndex, terms, options) {
        if (!terms || terms.length === 0) {
            return undefined;
        }
        const matches = await asyncArray.mapAsync(terms, settings.concurrency, (term) => matchName(entityNames, nameIndex, term, options));
        return intersectUnionMultiple(...matches);
    }
    async function matchVerbTerms(verbs, verbTense, options) {
        if (verbs && verbs.length > 0) {
            verbs = mapVerbTerms(verbs);
            const verbOptions = options.verbSearchOptions ?? options;
            const matches = await verbIndex.getNearest(actionVerbsToString(verbs, verbTense), verbOptions.maxMatches, verbOptions.minScore);
            return matches;
        }
        return undefined;
    }
    function mapVerbTerms(terms) {
        return terms.map((t) => verbTermMap.get(t) ?? t);
    }
    async function matchTimeRange(timeRange) {
        if (timeRange) {
            return await actionStore.sequence.getEntriesInRange(toStartDate(timeRange.startDate), toStopDate(timeRange.stopDate));
        }
        return undefined;
    }
    async function loadSourceIds(sourceIdLog, results, unique) {
        if (results.length === 0) {
            return unique;
        }
        unique ??= new Set();
        await asyncArray.forEachAsync(results, settings.concurrency, async (a) => {
            if (a.actionIds && a.actionIds.length > 0) {
                const ids = await getSourceIds(a.actionIds);
                const timeRange = a.getTemporalRange();
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
}
export function actionToString(action) {
    let text = "";
    text = appendEntityName(text, action.subjectEntityName);
    text += ` [${action.verbs.join(", ")}]`;
    text = appendEntityName(text, action.objectEntityName);
    text = appendEntityName(text, action.indirectObjectEntityName);
    text += ` {${action.verbTense}}`;
    if (action.subjectEntityFacet) {
        text += ` <${facetToString(action.subjectEntityFacet)}>`;
    }
    return text;
    function appendEntityName(text, name) {
        if (text.length > 0) {
            text += " ";
        }
        if (isValidEntityName(name)) {
            text += `<${name}>`;
        }
        else {
            text += "<>";
        }
        return text;
    }
}
export function actionVerbsToString(verbs, verbTense) {
    const text = verbTense
        ? `${verbs.join(" ")} {${verbTense}}`
        : verbs.join(" ");
    return text;
}
export function actionParamToString(param) {
    return typeof param === "string"
        ? param
        : `${param.name}="${knowledgeValueToString(param.value)}"`;
}
export function toCompositeAction(action) {
    const composite = {
        verbs: actionVerbsToString(action.verbs, action.verbTense),
    };
    if (isValidEntityName(action.subjectEntityName)) {
        composite.subject = action.subjectEntityName;
    }
    if (isValidEntityName(action.objectEntityName)) {
        composite.object = action.objectEntityName;
    }
    if (isValidEntityName(action.indirectObjectEntityName)) {
        composite.indirectObject = action.indirectObjectEntityName;
    }
    if (action.params) {
        composite.params = action.params.map((a) => actionParamToString(a));
    }
    return composite;
}
/**
 * Action groups are sorted by relevance
 * @param actions
 * @param fullActionsOnly
 * @returns
 */
export function mergeActions(actions, fullActionsOnly = true) {
    if (fullActionsOnly) {
        actions = getFullActions(actions);
    }
    const merged = mergeCompositeActions(toCompositeActions(actions));
    return merged.map((a) => a.item);
}
function* toCompositeActions(actions) {
    for (const a of actions) {
        yield toCompositeAction(a);
    }
}
export function mergeCompositeActions(actions) {
    const merged = createHitTable((k) => actionGroupKey(k));
    for (const action of actions) {
        const key = actionGroupKey(action);
        let existing = merged.get(action);
        if (!existing) {
            existing = { item: actionToActionGroup(action), score: 0 };
            merged.set(key, existing);
        }
        if (appendToActionGroup(existing.item, action)) {
            existing.score += 1;
        }
    }
    const groups = merged.byHighestScore();
    groups.forEach((g) => {
        removeDuplicates(g.item.values, compareActionGroupValue);
        mergeActionGroup(g.item);
    });
    return groups;
}
function actionGroupKey(group) {
    let key = "";
    if (group.subject) {
        key += group.subject;
        key += " ";
    }
    key += group.verbs;
    if (group.object) {
        key += " " + group.object;
    }
    return key;
}
function actionToActionGroup(action) {
    const group = {};
    if (action.subject) {
        group.subject = action.subject;
    }
    if (action.verbs) {
        group.verbs = action.verbs;
    }
    return group;
}
function appendToActionGroup(x, y) {
    if (x.subject !== y.subject || x.verbs !== y.verbs) {
        return false;
    }
    x.values ??= [];
    const obj = {};
    if (y.object) {
        obj.object = y.object;
    }
    if (y.indirectObject) {
        obj.indirectObject = y.indirectObject;
    }
    if (y.params) {
        obj.params = y.params;
    }
    x.values.push(obj);
    return true;
}
function mergeActionGroup(group, mergeLength = 2) {
    // Simple merge for now: if all the objects are the same, merge them
    const values = group.values;
    if (!values || values.length <= mergeLength) {
        return group;
    }
    values.sort();
    const obj = values[0].object;
    if (!obj) {
        return group;
    }
    for (let i = 1; i < values.length; ++i) {
        if (obj !== values[i].object) {
            return group;
        }
    }
    group.object = obj;
    for (let i = 0; i < values.length; ++i) {
        delete values[i].object;
    }
    return group;
}
function compareActionGroupValue(x, y, caseSensitive = true) {
    let cmp = collections.stringCompare(x.object, y.object, caseSensitive);
    if (cmp === 0) {
        cmp = collections.stringCompare(x.indirectObject, y.indirectObject, caseSensitive);
        if (cmp === 0) {
            cmp = collections.stringCompareArray(x.params, y.params, caseSensitive);
        }
    }
    return cmp;
}
function* getFullActions(actions) {
    for (const a of actions) {
        if (isValidEntityName(a.subjectEntityName) &&
            a.verbs &&
            a.verbs.length > 0 &&
            isValidEntityName(a.objectEntityName)) {
            yield a;
        }
    }
}
//# sourceMappingURL=actions.js.map