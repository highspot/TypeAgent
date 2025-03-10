// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { asyncArray } from "typeagent";
import { removeUndefined } from "../setOperations.js";
import { createTagIndexOnStorage } from "../knowledgeStore.js";
import { getAllTermsInFilter } from "./knowledgeTermSearch2.js";
export async function createThreadIndexOnStorage(rootPath, storageProvider) {
    const threadStore = await storageProvider.createObjectFolder(rootPath, "entries");
    const textIndex = await storageProvider.createTextIndex({ caseSensitive: false, semanticIndex: true, concurrency: 1 }, rootPath, "description", "TEXT");
    const tagIndex = await createTagIndexOnStorage({ concurrency: 1 }, rootPath, storageProvider);
    return {
        tagIndex,
        entries: () => threadStore.all(),
        add,
        getById,
        getIds,
        get,
        getNearest,
        matchTags,
    };
    async function add(threadDef) {
        const entryId = await threadStore.put(threadDef);
        await textIndex.put(threadDef.description, [entryId]);
        return entryId;
    }
    function getById(id) {
        return threadStore.get(id);
    }
    function getIds(description) {
        return textIndex.get(description);
    }
    async function get(description) {
        const entryIds = await textIndex.get(description);
        if (entryIds && entryIds.length > 0) {
            return getByIds(entryIds);
        }
        return undefined;
    }
    async function getNearest(description, maxMatches, minScore) {
        const entryIds = await textIndex.getNearest(description, maxMatches, minScore);
        if (entryIds && entryIds.length > 0) {
            return getByIds(entryIds);
        }
        return [];
    }
    async function getByIds(entryIds) {
        const threads = await asyncArray.mapAsync(entryIds, 1, (id) => threadStore.get(id));
        return removeUndefined(threads);
    }
    async function matchTags(filters) {
        let matches;
        for (const filter of filters) {
            const terms = getAllTermsInFilter(filter, false);
            const threadIds = await tagIndex.getByTag(terms);
            if (threadIds && threadIds.length > 0) {
                matches ??= [];
                matches.push(...threadIds);
            }
        }
        return matches && matches.length > 0 ? matches : undefined;
    }
}
//# sourceMappingURL=threads.js.map