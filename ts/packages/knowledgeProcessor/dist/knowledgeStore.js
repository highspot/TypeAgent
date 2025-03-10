// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { asyncArray, } from "typeagent";
import { intersectMultiple, removeUndefined, unionMultiple, } from "./setOperations.js";
import { createFileSystemStorageProvider, } from "./storageProvider.js";
import path from "path";
export async function createKnowledgeStore(settings, rootPath, folderSettings, fSys) {
    return createKnowledgeStoreOnStorage(settings, rootPath, createFileSystemStorageProvider(rootPath, folderSettings, fSys));
}
export async function createKnowledgeStoreOnStorage(settings, rootPath, storageProvider) {
    const [sequence, entries] = await Promise.all([
        storageProvider.createTemporalLog({ concurrency: settings.concurrency }, rootPath, "sequence"),
        storageProvider.createObjectFolder(rootPath, "entries"),
    ]);
    let tagIndex;
    return {
        settings,
        store: entries,
        sequence,
        entries: entries.allObjects,
        get: entries.get,
        getMultiple,
        add,
        addNext,
        getTagIndex,
        addTag,
        getByTag,
    };
    async function getMultiple(ids) {
        const items = await asyncArray.mapAsync(ids, settings.concurrency, (id) => entries.get(id));
        return removeUndefined(items);
    }
    async function addNext(items, timestamp) {
        const itemIds = await asyncArray.mapAsync(items, 1, (e) => entries.put(e));
        itemIds.sort();
        await sequence.put(itemIds, timestamp);
        return itemIds;
    }
    async function add(item, id) {
        return id ? id : await entries.put(item, id);
    }
    async function addTag(tag, tIds) {
        const tagIndex = await getTagIndex();
        return await tagIndex.put(tag, Array.isArray(tIds) ? tIds : [tIds]);
    }
    async function getByTag(tag, unionMatches) {
        unionMatches ??= false;
        const tagIndex = await getTagIndex();
        let tagMatches;
        if (Array.isArray(tag)) {
            const ids = await asyncArray.mapAsync(tag, settings.concurrency, (t) => tagIndex.get(t));
            tagMatches = [
                ...(unionMatches
                    ? unionMultiple(...ids)
                    : intersectMultiple(...ids)),
            ];
        }
        else {
            tagMatches = await tagIndex.get(tag);
        }
        return tagMatches && tagMatches.length > 0 ? tagMatches : undefined;
    }
    async function getTagIndex() {
        if (!tagIndex) {
            tagIndex = await storageProvider.createTextIndex({
                caseSensitive: false,
                semanticIndex: undefined,
                concurrency: settings.concurrency,
            }, rootPath, "tags", "TEXT");
        }
        return tagIndex;
    }
}
export async function createTagIndexOnStorage(settings, rootPath, storageProvider) {
    const storePath = path.join(rootPath, "tags");
    const tagIndex = await storageProvider.createTextIndex({
        caseSensitive: false,
        semanticIndex: undefined,
        concurrency: settings.concurrency,
    }, storePath, "tagToSrc", "TEXT");
    const sourceIndex = await storageProvider.createIndex(storePath, "srcToTag", "TEXT");
    return {
        tags,
        addTag,
        removeTag,
        getByTag,
        getTagsFor,
    };
    async function tags() {
        return Promise.resolve([...tagIndex.text()]);
    }
    async function addTag(tag, id) {
        const tagId = await tagIndex.put(tag, [id]);
        await sourceIndex.put([tagId], id);
        return tagId;
    }
    async function removeTag(tag, id) {
        const tagId = await tagIndex.getId(tag);
        if (tagId) {
            await tagIndex.remove(tagId, [id]);
        }
    }
    async function getByTag(tag) {
        let tagMatches;
        if (Array.isArray(tag)) {
            const ids = await asyncArray.mapAsync(tag, settings.concurrency, (t) => tagIndex.get(t));
            tagMatches = [...intersectMultiple(...ids)];
        }
        else {
            tagMatches = await tagIndex.get(tag);
        }
        return tagMatches && tagMatches.length > 0 ? tagMatches : undefined;
    }
    async function getTagsFor(id) {
        const postings = await sourceIndex.get(id);
        if (postings && postings.length > 0) {
            const tags = await asyncArray.mapAsync(postings, settings.concurrency, (id) => tagIndex.getText(id));
            return removeUndefined(tags);
        }
        return undefined;
    }
}
//# sourceMappingURL=knowledgeStore.js.map