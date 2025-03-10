// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import path from "path";
import { asyncArray, collections, createEmbeddingFolder, createObjectFolder, createSemanticIndex, removeDir, } from "typeagent";
import { intersectMultiple, intersectUnionMultiple, removeUndefined, union, unionArrays, unionMultiple, unionMultipleScored, } from "./setOperations.js";
import { TextBlockType } from "./text.js";
import { createIndexFolder } from "./keyValueIndex.js";
// There are *three* important types here:
// - entries are always strings; typically words or sentences
// - postings are arrays of TSourceIds; typically unique IDs for other objects
// - TextId is a string that uniquely identifies an (entry, postings) pair internally
export async function createTextIndex(settings, folderPath, folderSettings, fSys, textFolder) {
    const entriesFolder = textFolder ??
        (await createObjectFolder(path.join(folderPath, "entries"), folderSettings, fSys));
    const textIdMap = await loadTextIdMap();
    const postingFolder = await createIndexFolder(path.join(folderPath, "postings"), folderSettings, fSys);
    const semanticIndex = settings.semanticIndex !== undefined && settings.semanticIndex
        ? await createSemanticIndexFolder(folderPath, folderSettings, settings.concurrency, settings.embeddingModel, fSys)
        : undefined;
    return {
        text: () => textIdMap.keys(),
        ids,
        entries,
        get,
        getFrequency,
        getById,
        getByIds,
        getId,
        getIds,
        getText,
        put,
        putMultiple,
        addSources,
        getNearest,
        getNearestHits,
        getNearestHitsMultiple,
        getNearestMultiple,
        getNearestText,
        getNearestTextMultiple,
        nearestNeighbors,
        nearestNeighborsText,
        nearestNeighborsPairs,
        remove,
    };
    async function* ids() {
        for (const id of textIdMap.values()) {
            yield id;
        }
    }
    async function* entries() {
        for (const text of textIdMap.keys()) {
            yield {
                type: TextBlockType.Sentence,
                value: text,
                sourceIds: await get(text),
            };
        }
    }
    async function get(text) {
        const textId = textToId(text);
        if (textId) {
            return postingFolder.get(textId);
        }
        return undefined;
    }
    async function getFrequency(text) {
        const postings = await get(text);
        return postings ? postings.length : 0;
    }
    async function getById(id) {
        return postingFolder.get(id);
    }
    async function getByIds(ids) {
        return asyncArray.mapAsync(ids, settings.concurrency, (id) => getById(id));
    }
    async function getId(text) {
        return textToId(text);
    }
    async function getIds(texts) {
        return texts.map((t) => textToId(t));
    }
    async function getText(id) {
        return entriesFolder.get(id);
    }
    async function put(text, postings) {
        text = prepareText(text);
        postings = preparePostings(postings);
        let textId = textToId(text, false);
        if (textId) {
            await updatePostings(textId, postings);
        }
        else {
            textId = await addPostings(text, postings);
            textIdMap.set(text, textId);
        }
        return textId;
    }
    async function putMultiple(blocks) {
        // TODO: parallelize
        const ids = [];
        for (const b of blocks) {
            const id = await put(b.value, b.sourceIds);
            ids.push(id);
        }
        return ids;
    }
    function addSources(textId, sourceIds) {
        return updatePostings(textId, sourceIds);
    }
    async function addPostings(text, postings) {
        let textId = await entriesFolder.put(text);
        const tasks = [];
        if (postings && postings.length > 0) {
            tasks.push(postingFolder.put(postings, textId));
        }
        if (semanticIndex) {
            tasks.push(semanticIndex.put(text, textId));
        }
        await Promise.all(tasks);
        return textId;
    }
    async function updatePostings(textId, postings) {
        if (postings && postings.length > 0) {
            const existingPostings = await postingFolder.get(textId);
            const updatedPostings = existingPostings && existingPostings.length > 0
                ? [...union(existingPostings.values(), postings.values())]
                : postings;
            await postingFolder.replace(updatedPostings, textId);
        }
    }
    async function remove(textId, postings) {
        const existingPostings = await postingFolder.get(textId);
        if (!existingPostings || existingPostings.length === 0) {
            return;
        }
        let updatedPostings = collections.removeItemFromArray(existingPostings, postings);
        if (updatedPostings.length === 0) {
            await postingFolder.remove(textId);
        }
        else {
            await postingFolder.replace(updatedPostings, textId);
        }
    }
    async function getNearest(value, maxMatches, minScore) {
        maxMatches ??= 1;
        // Check exact match first
        let postings = await get(value);
        let postingsNearest;
        if (maxMatches > 1) {
            const nearestPostings = await getNearestPostings(value, maxMatches, minScore);
            postingsNearest = [...unionMultiple(...nearestPostings)];
        }
        else if (semanticIndex && (!postings || postings.length === 0)) {
            const textId = await semanticIndex.nearestNeighbor(value, minScore);
            if (textId) {
                postingsNearest = await postingFolder.get(textId.item);
            }
        }
        postings = unionArrays(postings, postingsNearest);
        return postings ?? [];
    }
    async function getNearestHits(value, hitTable, maxMatches, minScore, scoreBoost, aliases) {
        maxMatches ??= 1;
        // Check exact match first
        let postingsExact = await get(value);
        let postingsAlias;
        if (aliases) {
            // If no exact match, see if matched any (optional) aliases.
            postingsAlias = await getByAlias(value, aliases);
        }
        let postingsNearest;
        if (maxMatches > 1) {
            const scoredPostings = await getNearestPostingsWithScore(value, maxMatches, minScore);
            postingsNearest = unionMultipleScored(...scoredPostings);
        }
        else if (semanticIndex &&
            (!postingsExact || postingsExact.length === 0)) {
            const textId = await semanticIndex.nearestNeighbor(value, minScore);
            if (textId) {
                const postings = await postingFolder.get(textId.item);
                if (postings) {
                    postingsNearest = scorePostings(postings, scoreBoost ? scoreBoost * textId.score : textId.score);
                }
            }
        }
        hitTable.addMultipleScored(unionMultipleScored(postingsExact ? scorePostings(postingsExact, 1.0) : undefined, postingsAlias ? scorePostings(postingsAlias, 1.0) : undefined, postingsNearest));
    }
    async function getByAlias(value, aliases) {
        const matchedTextIds = await aliases.match(value);
        if (matchedTextIds && matchedTextIds.length > 0) {
            const postings = await getByIds(matchedTextIds);
            return [...unionMultiple(...postings)];
        }
        return undefined;
    }
    async function getNearestHitsMultiple(values, hitTable, maxMatches, minScore, scoreBoost, aliases) {
        return asyncArray.forEachAsync(values, settings.concurrency, (v) => getNearestHits(v, hitTable, maxMatches, minScore, scoreBoost, aliases));
    }
    async function getNearestMultiple(values, maxMatches, minScore) {
        const matches = await asyncArray.mapAsync(values, settings.concurrency, (t) => getNearest(t, maxMatches, minScore));
        const combined = intersectMultiple(...matches);
        return Array.isArray(combined) ? combined : [...combined];
    }
    async function getNearestText(value, maxMatches, minScore, aliases) {
        maxMatches ??= 1;
        // Check exact match first
        let matchedIds = [];
        let exactMatchId = textToId(value);
        if (exactMatchId) {
            matchedIds.push(exactMatchId);
        }
        if (aliases) {
            const aliasMatchIds = await aliases.match(value);
            if (aliasMatchIds && aliasMatchIds.length > 0) {
                matchedIds = unionArrays(matchedIds, aliasMatchIds);
            }
        }
        if (semanticIndex && maxMatches > 1) {
            const nearestMatches = await semanticIndex.nearestNeighbors(value, maxMatches, minScore);
            if (nearestMatches.length > 0) {
                const nearestIds = nearestMatches.map((m) => m.item).sort();
                matchedIds = unionArrays(matchedIds, nearestIds);
            }
        }
        return matchedIds;
    }
    async function getNearestTextMultiple(values, maxMatches, minScore) {
        const matches = await asyncArray.mapAsync(values, settings.concurrency, (t) => getNearestText(t, maxMatches, minScore));
        return intersectUnionMultiple(...matches) ?? [];
    }
    async function nearestNeighbors(value, maxMatches, minScore) {
        const matches = await nearestNeighborsText(value, maxMatches, minScore);
        return asyncArray.mapAsync(matches, settings.concurrency, async (m) => {
            return {
                score: m.score,
                item: (await postingFolder.get(m.item)) ?? [],
            };
        });
    }
    async function nearestNeighborsText(value, maxMatches, minScore) {
        if (!semanticIndex) {
            return [];
        }
        let matches = await semanticIndex.nearestNeighbors(value, maxMatches, minScore);
        // Also do an exact match
        let textId = textToId(value);
        if (textId) {
            // Remove prior match
            const pos = matches.findIndex((m) => m.item === textId);
            if (pos >= 0) {
                matches.splice(pos, 1);
            }
            matches.splice(0, 0, { score: 1.0, item: textId });
        }
        return matches;
    }
    async function nearestNeighborsPairs(query, maxMatches, minScore) {
        return removeUndefined(await asyncArray.mapAsync(await nearestNeighborsText(query, maxMatches, minScore), settings.concurrency, async (m) => {
            const value = await entriesFolder.get(m.item);
            if (!value)
                return;
            const sourceIds = await postingFolder.get(m.item);
            if (!sourceIds)
                return;
            return {
                score: m.score,
                item: {
                    type: TextBlockType.Sentence,
                    value,
                    sourceIds,
                },
            };
        }));
    }
    async function loadTextIdMap() {
        const map = new Map();
        const allIds = await entriesFolder.allNames();
        if (allIds.length > 0) {
            // Load all text entries
            const allText = await asyncArray.mapAsync(allIds, settings.concurrency, (id) => entriesFolder.get(id));
            if (!allText || allIds.length !== allText.length) {
                throw Error(`TextIndex is corrupt: ${folderPath}`);
            }
            // And now map the text to its ids
            for (let i = 0; i < allIds.length; ++i) {
                const text = allText[i];
                if (text) {
                    map.set(text, allIds[i]);
                }
            }
        }
        return map;
    }
    async function getNearestPostings(value, maxMatches, minScore) {
        if (!semanticIndex) {
            return [];
        }
        maxMatches ??= 1;
        const nearestText = await semanticIndex.nearestNeighbors(value, maxMatches, minScore);
        return asyncArray.mapAsync(nearestText, settings.concurrency, (m) => postingFolder.get(m.item));
    }
    async function getNearestPostingsWithScore(value, maxMatches, minScore) {
        if (!semanticIndex) {
            return [];
        }
        maxMatches ??= 1;
        const nearestText = await semanticIndex.nearestNeighbors(value, maxMatches, minScore);
        const nearestPostings = await asyncArray.mapAsync(nearestText, settings.concurrency, (m) => postingFolder.get(m.item));
        const scoredPostings = [];
        for (let i = 0; i < nearestPostings.length; ++i) {
            const posting = nearestPostings[i];
            if (posting) {
                scoredPostings.push(scorePostings(posting, nearestText[i].score));
            }
        }
        return scoredPostings;
    }
    function* scorePostings(postings, score) {
        for (const item of postings) {
            yield { item, score };
        }
    }
    function textToId(text, prepare = true) {
        return textIdMap.get(prepare ? prepareText(text) : text);
    }
    function prepareText(text) {
        return settings.caseSensitive ? text : text.toLowerCase();
    }
    function preparePostings(postings) {
        return postings ? postings.sort() : [];
    }
}
export async function searchIndex(index, value, exact, count, minScore) {
    if (exact) {
        const ids = await index.get(value);
        if (ids) {
            return [{ score: 1.0, item: ids }];
        }
        return [];
    }
    count ??= 1;
    const matches = await index.nearestNeighbors(value, count, minScore);
    return matches;
}
export async function searchIndexText(index, value, exact, count, minScore) {
    if (exact) {
        const id = await index.getId(value);
        if (id) {
            return [{ score: 1.0, item: id }];
        }
        return [];
    }
    count ??= 1;
    const matches = await index.nearestNeighborsText(value, count, minScore);
    return matches;
}
export async function createSemanticIndexFolder(folderPath, folderSettings, concurrency, model, fSys) {
    return createSemanticIndex(await createEmbeddingFolder(path.join(folderPath, "embeddings"), folderSettings, concurrency, fSys), model);
}
export async function removeSemanticIndexFolder(folderPath, fSys) {
    await removeDir(path.join(folderPath, "embeddings"), fSys);
}
export function createTermSet(caseSensitive = false) {
    const set = new Set();
    return {
        has(term) {
            return set.has(prepareTerm(term));
        },
        put(term) {
            set.add(prepareTerm(term));
        },
    };
    function prepareTerm(term) {
        return caseSensitive ? term : term.toLowerCase();
    }
}
export function createTermMap(caseSensitive = false) {
    const map = new Map();
    return {
        size() {
            return map.size;
        },
        get(term) {
            return map.get(prepareTerm(term));
        },
        put(term, value) {
            map.set(prepareTerm(term), value);
        },
    };
    function prepareTerm(term) {
        return caseSensitive ? term : term.toLowerCase();
    }
}
//# sourceMappingURL=textIndex.js.map